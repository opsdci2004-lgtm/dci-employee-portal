-- =====================================================
-- DCI Consultants — Leave Monitoring App
-- Run this ONCE in Supabase Dashboard → SQL Editor → New query.
-- Safe to re-run (uses "if not exists" / "or replace" where possible).
-- =====================================================

-- ---------- profiles ----------
-- One row per signed-up user. Created automatically by a trigger
-- (see handle_new_user below) when someone signs up — you never
-- insert into this table by hand.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'employee' check (role in ('employee','manager')),
  team text not null default 'General',
  department text,
  annual_entitlement numeric not null default 14,
  medical_entitlement numeric not null default 14,
  created_at timestamptz not null default now()
);

-- Adds the department column if this table already existed from an
-- earlier run of this script (before the printable leave form feature).
alter table public.profiles add column if not exists department text;

-- ---------- public_holidays ----------
-- Company-wide holiday calendar used to calculate working days.
create table if not exists public.public_holidays (
  id uuid primary key default gen_random_uuid(),
  holiday_date date not null unique,
  name text not null
);

-- ---------- leave_requests ----------
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  leave_type text not null check (leave_type in ('annual','medical','unpaid')),
  start_date date not null,
  end_date date not null,
  working_days numeric not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  manager_comment text,
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  half_day_period text check (half_day_period in ('AM','PM')),
  constraint end_after_start check (end_date >= start_date)
);

-- Adds the half_day_period column if this table already existed from an
-- earlier run of this script (before the printable leave form feature).
alter table public.leave_requests add column if not exists half_day_period text;
alter table public.leave_requests drop constraint if exists leave_requests_half_day_period_check;
alter table public.leave_requests add constraint leave_requests_half_day_period_check
  check (half_day_period in ('AM','PM') or half_day_period is null);

create index if not exists leave_requests_employee_idx on public.leave_requests (employee_id);
create index if not exists leave_requests_status_idx on public.leave_requests (status);
create index if not exists leave_requests_dates_idx on public.leave_requests (start_date, end_date);

-- =====================================================
-- Auto-create a profile row whenever someone signs up
-- (runs regardless of whether email confirmation is on).
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'employee'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- Helper: is the current logged-in user a manager?
-- security definer so it bypasses RLS internally (avoids recursion).
-- =====================================================
create or replace function public.is_manager()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'manager'
  );
$$;

-- =====================================================
-- Let a user update their own name/department only (never role or
-- entitlements) without opening a broad UPDATE policy on profiles.
-- =====================================================
create or replace function public.update_my_profile(p_full_name text, p_department text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set full_name = coalesce(nullif(p_full_name, ''), full_name),
      department = p_department
  where id = auth.uid();
end;
$$;

grant execute on function public.update_my_profile(text, text) to authenticated;

-- =====================================================
-- Row Level Security
-- =====================================================
alter table public.profiles enable row level security;
alter table public.public_holidays enable row level security;
alter table public.leave_requests enable row level security;

-- profiles: any signed-in user can read everyone's name/team/entitlement
-- (needed for the approval queue and team calendar); nobody can write
-- to it from the client — role/entitlement changes are admin-only via
-- the SQL editor (see "Promoting a manager" below).
drop policy if exists "profiles_select_all_authenticated" on public.profiles;
create policy "profiles_select_all_authenticated"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- public_holidays: any signed-in user can read; only managers can edit.
drop policy if exists "holidays_select_all" on public.public_holidays;
create policy "holidays_select_all"
  on public.public_holidays for select
  using (auth.role() = 'authenticated');

drop policy if exists "holidays_write_managers" on public.public_holidays;
create policy "holidays_write_managers"
  on public.public_holidays for all
  using (public.is_manager())
  with check (public.is_manager());

-- leave_requests: an employee sees/creates/cancels only their own
-- pending requests; a manager sees everything and can approve/reject.
drop policy if exists "leave_select_own_or_manager" on public.leave_requests;
create policy "leave_select_own_or_manager"
  on public.leave_requests for select
  using (employee_id = auth.uid() or public.is_manager());

drop policy if exists "leave_insert_own" on public.leave_requests;
create policy "leave_insert_own"
  on public.leave_requests for insert
  with check (employee_id = auth.uid() and status = 'pending');

drop policy if exists "leave_update_own_pending_or_manager" on public.leave_requests;
create policy "leave_update_own_pending_or_manager"
  on public.leave_requests for update
  using (
    (employee_id = auth.uid() and status = 'pending')
    or public.is_manager()
  );

drop policy if exists "leave_delete_own_pending" on public.leave_requests;
create policy "leave_delete_own_pending"
  on public.leave_requests for delete
  using (employee_id = auth.uid() and status = 'pending');

-- =====================================================
-- Starter public holidays (Singapore 2026) — edit freely.
-- =====================================================
insert into public.public_holidays (holiday_date, name) values
  ('2026-01-01', 'New Year''s Day'),
  ('2026-02-17', 'Chinese New Year'),
  ('2026-02-18', 'Chinese New Year Holiday'),
  ('2026-03-21', 'Hari Raya Puasa'),
  ('2026-04-03', 'Good Friday'),
  ('2026-05-01', 'Labour Day'),
  ('2026-05-27', 'Hari Raya Haji'),
  ('2026-05-31', 'Vesak Day'),
  ('2026-08-09', 'National Day'),
  ('2026-11-08', 'Deepavali'),
  ('2026-12-25', 'Christmas Day')
on conflict (holiday_date) do nothing;

-- =====================================================
-- Promoting a manager (run manually, one line, after they sign up):
--   update public.profiles set role = 'manager' where email = 'someone@example.com';
-- =====================================================
