-- =====================================================================
-- Online shop (run after 0003_awards_sections.sql). Safe to re-run.
-- Categories, products, hero banners, FAQs, orders, newsletter and the
-- shop settings (delivery charges, payment numbers, offer banner …).
-- Orders are only created through public.place_order(), which reads the real
-- prices from the database — visitors can never change a price or a total.
-- =====================================================================

-- ---------- Settings ----------
alter table public.site_settings
  add column if not exists accent_color_2 text not null default '#c9a27a',
  add column if not exists announcement text not null default '',
  add column if not exists whatsapp_number text,
  add column if not exists delivery_inside int not null default 60 check (delivery_inside between 0 and 100000),
  add column if not exists delivery_outside int not null default 120 check (delivery_outside between 0 and 100000),
  add column if not exists free_delivery_min int not null default 0 check (free_delivery_min between 0 and 10000000),
  add column if not exists delivery_note text not null default '',
  add column if not exists order_prefix text not null default 'AH',
  add column if not exists cod_enabled boolean not null default true,
  add column if not exists bkash_number text,
  add column if not exists nagad_number text,
  add column if not exists rocket_number text,
  add column if not exists payment_qr_url text,
  add column if not exists payment_note text not null default '',
  add column if not exists promo_kicker text not null default '',
  add column if not exists promo_title text not null default '',
  add column if not exists promo_text text not null default '',
  add column if not exists promo_button text not null default '',
  add column if not exists promo_link text not null default '',
  add column if not exists promo_image_url text,
  add column if not exists promo_ends_at timestamptz,
  add column if not exists gallery_images jsonb not null default '[]'::jsonb,
  add column if not exists map_embed_url text,
  add column if not exists cursor_enabled boolean not null default true;

alter table public.site_settings drop constraint if exists site_settings_accent_color_2_check;
alter table public.site_settings add constraint site_settings_accent_color_2_check
  check (accent_color_2 ~* '^#([0-9a-f]{3}|[0-9a-f]{6})$');
alter table public.site_settings drop constraint if exists site_settings_order_prefix_check;
alter table public.site_settings add constraint site_settings_order_prefix_check
  check (order_prefix ~ '^[A-Z]{1,4}$');
alter table public.site_settings drop constraint if exists site_settings_map_embed_url_check;
alter table public.site_settings add constraint site_settings_map_embed_url_check
  check (
    map_embed_url is null
    or map_embed_url = ''
    or map_embed_url ~* '^https://(www\.google\.com/maps/embed|maps\.google\.com/maps|www\.openstreetmap\.org/export/embed\.html)'
  );

-- ---------- Profile: About page photo ----------
alter table public.profile
  add column if not exists about_image_url text;

-- ---------- Categories ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  image_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_slug text references public.categories (slug) on update cascade on delete set null,
  short_description text not null default '',
  description text not null default '',
  price int not null check (price between 0 and 10000000),
  sale_price int check (sale_price is null or (sale_price >= 0 and sale_price <= price)),
  images jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  stock int not null default 0 check (stock between 0 and 1000000),
  sku text,
  badge text,
  featured boolean not null default false,
  is_new boolean not null default false,
  rating numeric(2, 1) not null default 5 check (rating between 0 and 5),
  review_count int not null default 0 check (review_count >= 0),
  status text not null default 'published' check (status in ('published', 'draft')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_slug);

-- ---------- Hero banners ----------
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  kicker text not null default '',
  title text not null,
  subtitle text not null default '',
  button_label text not null default 'Shop Now',
  button_link text not null default '/shop',
  image_url text not null,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- FAQs ----------
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text not null default '',
  area text not null check (area in ('inside', 'outside')),
  note text not null default '',
  items jsonb not null,
  subtotal int not null,
  delivery_charge int not null,
  total int not null,
  payment_method text not null check (payment_method in ('cod', 'bkash', 'nagad', 'rocket', 'qr')),
  payment_sender text,
  payment_trx text,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_phone_idx on public.orders (phone);

-- ---------- Newsletter ----------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 120),
  created_at timestamptz not null default now()
);

-- ---------- updated_at triggers + RLS for the content tables ----------
do $$
declare t text;
begin
  foreach t in array array['categories', 'products', 'banners', 'faqs', 'orders'] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s for each row execute function public.set_updated_at()', t);
    execute format('alter table public.%1$s enable row level security', t);
  end loop;
  foreach t in array array['categories', 'banners', 'faqs'] loop
    execute format('drop policy if exists "public read %1$s" on public.%1$s', t);
    execute format('create policy "public read %1$s" on public.%1$s for select using (active or public.is_admin())', t);
  end loop;
  foreach t in array array['categories', 'products', 'banners', 'faqs'] loop
    execute format('drop policy if exists "admin insert %1$s" on public.%1$s', t);
    execute format('drop policy if exists "admin update %1$s" on public.%1$s', t);
    execute format('drop policy if exists "admin delete %1$s" on public.%1$s', t);
    execute format('create policy "admin insert %1$s" on public.%1$s for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin update %1$s" on public.%1$s for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin delete %1$s" on public.%1$s for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (status = 'published' or public.is_admin());

-- Orders: only admins can read or change them. Nobody inserts directly (see place_order).
drop policy if exists "admin read orders" on public.orders;
drop policy if exists "admin update orders" on public.orders;
drop policy if exists "admin delete orders" on public.orders;
create policy "admin read orders" on public.orders for select to authenticated using (public.is_admin());
create policy "admin update orders" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete orders" on public.orders for delete to authenticated using (public.is_admin());

-- Newsletter: anyone can subscribe, only admins can see or remove.
alter table public.subscribers enable row level security;
drop policy if exists "anyone can subscribe" on public.subscribers;
drop policy if exists "admin read subscribers" on public.subscribers;
drop policy if exists "admin delete subscribers" on public.subscribers;
create policy "anyone can subscribe" on public.subscribers for insert to anon, authenticated with check (true);
create policy "admin read subscribers" on public.subscribers for select to authenticated using (public.is_admin());
create policy "admin delete subscribers" on public.subscribers for delete to authenticated using (public.is_admin());

create or replace function public.subscribers_guard()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  new.email := lower(trim(new.email));
  new.created_at := now();
  if (select count(*) from public.subscribers where created_at > now() - interval '10 minutes') >= 50 then
    raise exception 'Too many sign-ups right now. Please try again later.' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists trg_subscribers_guard on public.subscribers;
create trigger trg_subscribers_guard before insert on public.subscribers
for each row execute function public.subscribers_guard();

-- ---------- Place an order (prices and totals are calculated here) ----------
create or replace function public.place_order(payload jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  s record;
  item jsonb;
  p record;
  v_qty int;
  v_unit int;
  v_color text;
  v_lines jsonb := '[]'::jsonb;
  v_subtotal int := 0;
  v_delivery int;
  v_method text := coalesce(payload->>'payment_method', '');
  v_area text := coalesce(payload->>'area', '');
  v_phone text := regexp_replace(coalesce(payload->>'phone', ''), '[\s-]', '', 'g');
  v_sender text := nullif(regexp_replace(coalesce(payload->>'payment_sender', ''), '[\s-]', '', 'g'), '');
  v_trx text := nullif(upper(trim(coalesce(payload->>'payment_trx', ''))), '');
  v_number text;
begin
  select * into s from public.site_settings order by updated_at desc limit 1;
  if not found then
    raise exception 'The shop is not set up yet.' using errcode = 'P0001';
  end if;

  -- Customer details
  if char_length(trim(coalesce(payload->>'customer_name', ''))) not between 2 and 80 then
    raise exception 'Please enter your name.' using errcode = 'P0001';
  end if;
  if v_phone !~ '^(\+?88)?01[3-9][0-9]{8}$' then
    raise exception 'Please enter a valid mobile number.' using errcode = 'P0001';
  end if;
  if char_length(trim(coalesce(payload->>'address', ''))) not between 5 and 300 then
    raise exception 'Please enter your full address.' using errcode = 'P0001';
  end if;
  if v_area not in ('inside', 'outside') then
    raise exception 'Please choose a delivery area.' using errcode = 'P0001';
  end if;

  -- Payment method must be switched on in Settings
  if v_method = 'cod' and not s.cod_enabled
     or v_method = 'bkash' and coalesce(s.bkash_number, '') = ''
     or v_method = 'nagad' and coalesce(s.nagad_number, '') = ''
     or v_method = 'rocket' and coalesce(s.rocket_number, '') = ''
     or v_method = 'qr' and coalesce(s.payment_qr_url, '') = ''
     or v_method not in ('cod', 'bkash', 'nagad', 'rocket', 'qr') then
    raise exception 'Please choose a payment method.' using errcode = 'P0001';
  end if;
  if v_method <> 'cod' then
    if v_trx is null or v_trx !~ '^[A-Z0-9]{6,20}$' then
      raise exception 'Please enter the Transaction ID from your payment.' using errcode = 'P0001';
    end if;
    if v_method <> 'qr' and (v_sender is null or v_sender !~ '^(\+?88)?01[3-9][0-9]{8}$') then
      raise exception 'Please enter the number you paid from.' using errcode = 'P0001';
    end if;
  end if;

  -- Anti-spam
  if (select count(*) from public.orders where created_at > now() - interval '10 minutes') >= 40 then
    raise exception 'Too many orders right now. Please try again in a few minutes.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.orders where phone = v_phone and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many orders from this number. Please contact us.' using errcode = 'P0001';
  end if;

  -- Items: real prices from the database, stock is checked and reserved
  if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') not between 1 and 30 then
    raise exception 'Your cart is empty.' using errcode = 'P0001';
  end if;
  for item in select * from jsonb_array_elements(payload->'items') loop
    v_qty := coalesce((item->>'qty')::int, 0);
    if v_qty not between 1 and 20 then
      raise exception 'Invalid quantity.' using errcode = 'P0001';
    end if;
    select * into p from public.products
      where id = (item->>'product_id')::uuid and status = 'published'
      for update;
    if not found then
      raise exception 'A product in your cart is no longer available.' using errcode = 'P0001';
    end if;
    if p.stock < v_qty then
      raise exception '% — only % left in stock.', p.name, p.stock using errcode = 'P0001';
    end if;
    v_color := left(nullif(trim(coalesce(item->>'color', '')), ''), 40);
    v_unit := coalesce(p.sale_price, p.price);
    v_subtotal := v_subtotal + v_unit * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'product_id', p.id, 'name', p.name, 'slug', p.slug, 'image', p.images->>0,
      'price', v_unit, 'qty', v_qty, 'color', v_color
    );
    update public.products set stock = stock - v_qty where id = p.id;
  end loop;

  v_delivery := case when v_area = 'inside' then s.delivery_inside else s.delivery_outside end;
  if s.free_delivery_min > 0 and v_subtotal >= s.free_delivery_min then
    v_delivery := 0;
  end if;

  loop
    v_number := coalesce(nullif(s.order_prefix, ''), 'AH') || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 5));
    exit when not exists (select 1 from public.orders where order_number = v_number);
  end loop;

  insert into public.orders (order_number, customer_name, phone, email, address, city, area, note, items,
    subtotal, delivery_charge, total, payment_method, payment_sender, payment_trx)
  values (
    v_number,
    left(trim(payload->>'customer_name'), 80),
    v_phone,
    nullif(left(trim(coalesce(payload->>'email', '')), 120), ''),
    left(trim(payload->>'address'), 300),
    left(trim(coalesce(payload->>'city', '')), 60),
    v_area,
    left(trim(coalesce(payload->>'note', '')), 500),
    v_lines, v_subtotal, v_delivery, v_subtotal + v_delivery, v_method,
    case when v_method = 'cod' then null else v_sender end,
    case when v_method = 'cod' then null else v_trx end
  );

  return jsonb_build_object('order_number', v_number, 'total', v_subtotal + v_delivery);
end $$;

-- ---------- Track an order (needs the order number AND the phone number) ----------
create or replace function public.track_order(p_number text, p_phone text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'order_number', o.order_number,
    'status', o.status,
    'payment_status', o.payment_status,
    'payment_method', o.payment_method,
    'total', o.total,
    'items', jsonb_array_length(o.items),
    'created_at', o.created_at
  )
  from public.orders o
  where o.order_number = upper(trim(p_number))
    and right(regexp_replace(o.phone, '\D', '', 'g'), 10) = right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10)
    and char_length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) >= 10
  limit 1
$$;

revoke all on function public.place_order(jsonb) from public;
revoke all on function public.track_order(text, text) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- ---------- Storage: upload folders used by the shop ----------
drop policy if exists "admin upload media" on storage.objects;
create policy "admin upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin()
    and (storage.foldername(name))[1] in ('profile', 'products', 'categories', 'banners', 'payments', 'gallery',
      'testimonials', 'blog', 'documents', 'settings'));
