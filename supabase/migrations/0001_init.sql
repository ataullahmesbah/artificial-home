-- =====================================================================
-- Business Portfolio — initial schema
-- Single-owner portfolio. Public can read published/active content;
-- only users listed in public.admins (and active) can write.
-- =====================================================================


-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- admins (dashboard users) ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Owner',
  avatar_url text,
  role text not null default 'owner' check (role in ('owner')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid() and a.active
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- site settings (single row) ----------
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  website_name text not null,
  logo_url text,
  accent_color text not null default '#ff014f' check (accent_color ~* '^#([0-9a-f]{3}|[0-9a-f]{6})$'),
  default_theme text not null default 'dark' check (default_theme in ('dark', 'light', 'system')),
  contact_email text not null,
  public_phone text,
  seo_title text not null,
  seo_description text not null,
  footer_text text not null default '',
  hire_label text not null default 'Hire Me',
  updated_at timestamptz not null default now()
);

-- ---------- profile (single row) ----------
create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  professional_title text not null,
  typed_roles text[] not null default '{}',
  short_intro text not null default '',
  bio text not null default '',
  email text not null,
  phone text,
  location text not null default '',
  profile_image_url text not null,
  hero_image_url text,
  resume_url text,
  availability_status text not null default '',
  social_links jsonb not null default '[]'::jsonb,
  skill_tools jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- content tables ----------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  short_description text not null,
  icon_key text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category text not null,
  year int not null,
  client text,
  role text,
  intro text not null,
  challenge text,
  solution text,
  result text,
  cover_image_url text not null,
  gallery jsonb not null default '[]'::jsonb,
  live_url text,
  likes int not null default 0,
  featured boolean not null default false,
  status text not null default 'published' check (status in ('published', 'draft')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('education', 'experience')),
  title text not null,
  subtitle text not null,
  period text not null,
  badge text,
  description text not null default '',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  level int not null default 80 check (level between 0 and 100),
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  company text,
  project_title text,
  quote text not null,
  avatar_url text,
  rating int not null default 5 check (rating between 1 and 5),
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Brand',
  logo_url text,
  website_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null default '',
  price text not null,
  period text not null default '',
  description text not null default '',
  features text[] not null default '{}',
  cta_label text not null default 'Order Now',
  highlighted boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text not null,
  content text not null,
  cover_image_url text not null,
  category text not null,
  read_time text not null default '3 min read',
  published_at date not null default current_date,
  status text not null default 'published' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 5 and 120),
  phone text check (phone is null or char_length(phone) <= 30),
  service text check (service is null or char_length(service) <= 80),
  budget text check (budget is null or char_length(budget) <= 40),
  message text not null check (char_length(message) between 10 and 4000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['admins','site_settings','profile','services','projects','resume_items','skills','testimonials','clients','pricing_plans','blog_posts']
  loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- Row Level Security ----------
alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.profile enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;
alter table public.resume_items enable row level security;
alter table public.skills enable row level security;
alter table public.testimonials enable row level security;
alter table public.clients enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.blog_posts enable row level security;
alter table public.messages enable row level security;

-- admins: a user can read and update only their own row (never role/active via app)
create policy "admins read self" on public.admins for select to authenticated using (user_id = auth.uid());
create policy "admins update self" on public.admins for update to authenticated
  using (user_id = auth.uid() and public.is_admin())
  with check (user_id = auth.uid() and role = 'owner' and active = true);

-- public read policies
create policy "public read settings" on public.site_settings for select using (true);
create policy "public read profile" on public.profile for select using (true);
create policy "public read services" on public.services for select using (active or public.is_admin());
create policy "public read projects" on public.projects for select using (status = 'published' or public.is_admin());
create policy "public read resume" on public.resume_items for select using (active or public.is_admin());
create policy "public read skills" on public.skills for select using (active or public.is_admin());
create policy "public read testimonials" on public.testimonials for select using (active or public.is_admin());
create policy "public read clients" on public.clients for select using (active or public.is_admin());
create policy "public read pricing" on public.pricing_plans for select using (active or public.is_admin());
create policy "public read posts" on public.blog_posts for select using (status = 'published' or public.is_admin());

-- admin write policies
do $$
declare t text;
begin
  foreach t in array array['site_settings','profile','services','projects','resume_items','skills','testimonials','clients','pricing_plans','blog_posts']
  loop
    execute format('create policy "admin insert %1$s" on public.%1$s for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin update %1$s" on public.%1$s for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin delete %1$s" on public.%1$s for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- messages: anyone may submit (validated by CHECK constraints); only admins can read/manage
create policy "anyone can send message" on public.messages for insert to anon, authenticated with check (is_read = false);
create policy "admin read messages" on public.messages for select to authenticated using (public.is_admin());
create policy "admin update messages" on public.messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete messages" on public.messages for delete to authenticated using (public.is_admin());

-- ---------- Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public read media" on storage.objects for select using (bucket_id = 'portfolio-media');
create policy "admin upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin()
    and (storage.foldername(name))[1] in ('profile', 'projects', 'services', 'testimonials', 'clients', 'blog', 'documents', 'settings'));
create policy "admin update media" on storage.objects for update to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());
create policy "admin delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());
