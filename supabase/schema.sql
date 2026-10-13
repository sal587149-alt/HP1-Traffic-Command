-- HP1 Traffic Command database schema
-- Run in Supabase SQL Editor. Review policies before production launch.

create extension if not exists pgcrypto;

do $$ begin
  create type public.hp1_role as enum ('soldier','supervisor','officer','section_head','deputy_director','director','brigadier','system_admin');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique,
  rank_title text,
  department text not null default 'المرور',
  role public.hp1_role not null default 'soldier',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  report_type text not null,
  department text not null,
  body text not null check (char_length(body) between 10 and 8000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  review_note text,
  submitted_by uuid not null references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.military_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null,
  title text not null check (char_length(title) between 2 and 120),
  details text not null check (char_length(details) between 5 and 5000),
  status text not null default 'pending' check (status in ('pending','approved','rejected','completed')),
  review_note text,
  submitted_by uuid not null references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.promotion_requests (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references public.profiles(id),
  requested_rank text not null,
  status text not null default 'قيد المراجعة',
  notes text,
  created_at timestamptz not null default now()
);
create table if not exists public.operations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  operation_type text not null,
  department text not null default 'المرور',
  status text not null default 'مجدولة',
  scheduled_at timestamptz,
  summary text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  priority text not null default 'normal' check (priority in ('normal','urgent')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reports_submitted_by_idx on public.reports(submitted_by, created_at desc);
create index if not exists reports_status_idx on public.reports(status, created_at desc);
create index if not exists requests_submitted_by_idx on public.military_requests(submitted_by, created_at desc);
create index if not exists profiles_department_idx on public.profiles(department);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.military_requests enable row level security;
alter table public.promotion_requests enable row level security;
alter table public.operations enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.current_hp1_role()
returns public.hp1_role language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() and is_active = true $$;

create or replace function public.hp1_is_manager()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce(public.current_hp1_role() in ('supervisor','officer','section_head','deputy_director','director','brigadier','system_admin'), false) $$;

-- Profiles: a user can read their own profile; managers can read the directory.
drop policy if exists "profiles read own or manager" on public.profiles;
create policy "profiles read own or manager" on public.profiles for select to authenticated
using (id = auth.uid() or public.hp1_is_manager());
-- No direct client role changes or profile inserts. Account API uses server-only service role.

drop policy if exists "reports read own or manager" on public.reports;
create policy "reports read own or manager" on public.reports for select to authenticated
using (submitted_by = auth.uid() or public.hp1_is_manager());

drop policy if exists "reports create own" on public.reports;
create policy "reports create own" on public.reports for insert to authenticated
with check (submitted_by = auth.uid() and status = 'pending' and reviewed_by is null);

drop policy if exists "reports manager update" on public.reports;
create policy "reports manager update" on public.reports for update to authenticated
using (public.hp1_is_manager())
with check (public.hp1_is_manager());

drop policy if exists "requests read own or manager" on public.military_requests;
create policy "requests read own or manager" on public.military_requests for select to authenticated
using (submitted_by = auth.uid() or public.hp1_is_manager());

drop policy if exists "requests create own" on public.military_requests;
create policy "requests create own" on public.military_requests for insert to authenticated
with check (submitted_by = auth.uid() and status = 'pending' and reviewed_by is null);

drop policy if exists "requests manager update" on public.military_requests;
create policy "requests manager update" on public.military_requests for update to authenticated
using (public.hp1_is_manager()) with check (public.hp1_is_manager());

drop policy if exists "promotions read own or manager" on public.promotion_requests;
create policy "promotions read own or manager" on public.promotion_requests for select to authenticated
using (submitted_by = auth.uid() or public.hp1_is_manager());
drop policy if exists "promotions create own" on public.promotion_requests;
create policy "promotions create own" on public.promotion_requests for insert to authenticated
with check (submitted_by = auth.uid());

drop policy if exists "operations read authenticated" on public.operations;
create policy "operations read authenticated" on public.operations for select to authenticated
using (public.current_hp1_role() is not null);
drop policy if exists "operations manager write" on public.operations;
create policy "operations manager write" on public.operations for all to authenticated
using (public.hp1_is_manager()) with check (public.hp1_is_manager());

drop policy if exists "announcements read authenticated" on public.announcements;
create policy "announcements read authenticated" on public.announcements for select to authenticated
using (public.current_hp1_role() is not null);
drop policy if exists "announcements management write" on public.announcements;
create policy "announcements management write" on public.announcements for all to authenticated
using (public.current_hp1_role() in ('director','brigadier','system_admin'))
with check (public.current_hp1_role() in ('director','brigadier','system_admin'));

drop policy if exists "audit read system admin" on public.audit_logs;
create policy "audit read system admin" on public.audit_logs for select to authenticated
using (public.current_hp1_role() = 'system_admin');
drop policy if exists "audit insert actor self" on public.audit_logs;
create policy "audit insert actor self" on public.audit_logs for insert to authenticated
with check (actor_id = auth.uid());

-- Authenticated user can only select active own profile; account creation runs via service role.
grant usage on schema public to authenticated;
grant select on public.profiles, public.reports, public.military_requests, public.promotion_requests, public.operations, public.announcements, public.audit_logs to authenticated;
grant insert on public.reports, public.military_requests, public.promotion_requests to authenticated;
grant update on public.reports, public.military_requests to authenticated;
grant insert, select on public.audit_logs to authenticated;
