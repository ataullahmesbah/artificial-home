-- =====================================================================
-- Awards + page-section settings (run after 0002_hardening.sql). Safe to re-run.
-- =====================================================================

-- ---------- Awards (optional section) ----------
create table if not exists public.awards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text,
  year text,
  short_description text not null,
  image_url text not null,
  link_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_awards_updated on public.awards;
create trigger trg_awards_updated before update on public.awards
for each row execute function public.set_updated_at();

alter table public.awards enable row level security;

drop policy if exists "public read awards" on public.awards;
drop policy if exists "admin insert awards" on public.awards;
drop policy if exists "admin update awards" on public.awards;
drop policy if exists "admin delete awards" on public.awards;
create policy "public read awards" on public.awards for select using (active or public.is_admin());
create policy "admin insert awards" on public.awards for insert to authenticated with check (public.is_admin());
create policy "admin update awards" on public.awards for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete awards" on public.awards for delete to authenticated using (public.is_admin());

-- ---------- Page sections: visibility + order ----------
alter table public.site_settings
  add column if not exists sections jsonb not null default '[]'::jsonb;

-- ---------- Storage: allow the new "awards" upload folder ----------
drop policy if exists "admin upload media" on storage.objects;
create policy "admin upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin()
    and (storage.foldername(name))[1] in ('profile', 'projects', 'services', 'testimonials', 'clients', 'awards', 'blog', 'documents', 'settings'));
