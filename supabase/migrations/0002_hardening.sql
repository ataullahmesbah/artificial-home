-- =====================================================================
-- Security hardening (run after 0001_init.sql). Safe to re-run.
-- =====================================================================

-- ---------- Contact form: database-level anti-spam ----------
-- The anon key is public, so someone could call the REST API directly and
-- skip the website's rate limit. This trigger caps volume in the database.
create or replace function public.messages_guard()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- Clients can never set these themselves.
  new.is_read := false;
  new.created_at := now();

  if (select count(*) from public.messages where created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'Too many messages right now. Please try again later.' using errcode = 'P0001';
  end if;

  if (select count(*) from public.messages
      where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Too many messages from this email. Please try again later.' using errcode = 'P0001';
  end if;

  if new.email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Invalid email.' using errcode = 'P0001';
  end if;

  return new;
end $$;

drop trigger if exists trg_messages_guard on public.messages;
create trigger trg_messages_guard before insert on public.messages
for each row execute function public.messages_guard();

create index if not exists messages_created_at_idx on public.messages (created_at desc);
create index if not exists messages_email_idx on public.messages (lower(email));

-- ---------- Storage: stop public listing of files ----------
-- Public buckets serve files by URL without any SELECT policy, so only
-- admins need to list objects (the dashboard uses it to delete old files).
drop policy if exists "public read media" on storage.objects;
drop policy if exists "admin read media" on storage.objects;
create policy "admin read media" on storage.objects for select to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

-- ---------- Admins: users may only edit their name / avatar ----------
revoke update on public.admins from anon, authenticated;
grant update (display_name, avatar_url) on public.admins to authenticated;
