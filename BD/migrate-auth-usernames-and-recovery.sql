-- SysLogistics: usernames, secure recovery and administrative reset permissions.
-- Run once in the Supabase SQL editor. It preserves every auth.users UUID and email.

begin;

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists recovery_email text;
alter table public.profiles add column if not exists recovery_email_verified_at timestamptz;
alter table public.profiles add column if not exists can_reset_user_passwords boolean not null default false;

alter table public.profiles drop constraint if exists profiles_username_format_check;
alter table public.profiles add constraint profiles_username_format_check
  check (username is null or (username = lower(username) and username ~ '^[a-z0-9][a-z0-9._-]{2,31}$'));
create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username)) where username is not null;
create unique index if not exists profiles_recovery_email_lower_unique
  on public.profiles (lower(recovery_email)) where recovery_email is not null;

-- Legacy users keep their current Auth email and UUID. Only confirmed Auth emails become
-- verified recovery addresses. Usernames intentionally remain null for an administrator to assign.
update public.profiles profile
set recovery_email = lower(auth_user.email),
    recovery_email_verified_at = auth_user.email_confirmed_at
from auth.users auth_user
where auth_user.id = profile.id
  and auth_user.email_confirmed_at is not null
  and profile.recovery_email is null;

-- Existing EPS administrators receive the new explicit permission. Client-company admins do not.
update public.profiles profile
set can_reset_user_passwords = true
from public.companies company
where company.id = profile.company_id
  and (company.is_owner_company = true or company.is_system_company = true)
  and profile.role = 'super_admin';

-- Remove historical plaintext passwords. They must never be retrievable again.
update public.profiles set last_password = null where last_password is not null;
alter table public.profiles drop column if exists last_password;
alter table public.password_resets drop column if exists temporary_password;

create table if not exists public.account_email_verifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  invalidated_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists account_email_verifications_profile_active_idx
  on public.account_email_verifications(profile_id, created_at desc)
  where used_at is null and invalidated_at is null;

create table if not exists public.account_password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  invalidated_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists account_password_reset_tokens_profile_active_idx
  on public.account_password_reset_tokens(profile_id, created_at desc)
  where used_at is null and invalidated_at is null;

create table if not exists public.password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolution_note text
);
create unique index if not exists password_reset_requests_one_pending_per_profile
  on public.password_reset_requests(profile_id) where status = 'pending';

create table if not exists public.account_security_rate_limits (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  subject_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists account_security_rate_limits_lookup_idx
  on public.account_security_rate_limits(action, subject_hash, created_at desc);

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists user_notifications_recipient_unread_idx
  on public.user_notifications(recipient_profile_id, created_at desc) where read_at is null;

alter table public.account_email_verifications enable row level security;
alter table public.account_password_reset_tokens enable row level security;
alter table public.password_reset_requests enable row level security;
alter table public.account_security_rate_limits enable row level security;
alter table public.user_notifications enable row level security;

-- Sensitive token and rate-limit tables deliberately have no client policies: only service role routes use them.
drop policy if exists user_notifications_select_own on public.user_notifications;
create policy user_notifications_select_own on public.user_notifications
  for select to authenticated using (recipient_profile_id = auth.uid());
drop policy if exists user_notifications_mark_own_read on public.user_notifications;
create policy user_notifications_mark_own_read on public.user_notifications
  for update to authenticated using (recipient_profile_id = auth.uid())
  with check (recipient_profile_id = auth.uid());

commit;
