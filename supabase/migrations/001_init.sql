-- Proton Sales Follow-up & Insurance Renewal
-- Run this in the Supabase SQL editor, or via the Supabase CLI.

create extension if not exists pgcrypto;

do $$ begin
  create type public.proton_model as enum (
    'saga',
    'x50',
    'x70',
    'x90',
    's70',
    'emas_5',
    'emas_6'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.customer_status as enum (
    'new_lead',
    'follow_up',
    'sold',
    'not_interested'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  phone text not null,
  proton_model public.proton_model not null,
  customer_status public.customer_status not null default 'new_lead',
  next_follow_up_at date,
  follow_up_enabled boolean not null default false,
  latest_remark text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follow_up_history (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  remark text not null,
  followed_up_at timestamptz not null default now(),
  next_follow_up_at date,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.customers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  proton_model public.proton_model not null,
  registration_number text not null,
  delivery_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.insurance (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.customers (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  insurance_company text,
  policy_number text,
  start_date date not null,
  expiry_date date not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.insurance_renewal_history (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  insurance_company text,
  policy_number text,
  start_date date,
  expiry_date date not null,
  renewed_at date,
  remark text,
  created_at timestamptz not null default now()
);

create index if not exists customers_user_id_idx
  on public.customers (user_id);

create index if not exists customers_user_status_idx
  on public.customers (user_id, customer_status)
  where archived_at is null;

create index if not exists customers_follow_up_idx
  on public.customers (user_id, next_follow_up_at)
  where follow_up_enabled = true and archived_at is null;

create index if not exists customers_name_idx
  on public.customers (user_id, lower(name));

create index if not exists customers_phone_idx
  on public.customers (user_id, phone);

create index if not exists follow_up_history_customer_idx
  on public.follow_up_history (customer_id, created_at desc);

create index if not exists follow_up_history_user_id_idx
  on public.follow_up_history (user_id);

create index if not exists vehicles_user_reg_idx
  on public.vehicles (user_id, lower(registration_number));

create index if not exists insurance_user_expiry_idx
  on public.insurance (user_id, expiry_date);

create index if not exists insurance_vehicle_id_idx
  on public.insurance (vehicle_id);

create index if not exists insurance_history_customer_idx
  on public.insurance_renewal_history (customer_id, created_at desc);

create index if not exists insurance_renewal_history_user_id_idx
  on public.insurance_renewal_history (user_id);

create index if not exists insurance_renewal_history_vehicle_id_idx
  on public.insurance_renewal_history (vehicle_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists insurance_set_updated_at on public.insurance;
create trigger insurance_set_updated_at
  before update on public.insurance
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name;

  update auth.users
  set email_confirmed_at = coalesce(email_confirmed_at, now())
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

revoke execute on function public.set_updated_at() from public;
revoke execute on function public.set_updated_at() from anon;
revoke execute on function public.set_updated_at() from authenticated;

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.follow_up_history enable row level security;
alter table public.vehicles enable row level security;
alter table public.insurance enable row level security;
alter table public.insurance_renewal_history enable row level security;

drop policy if exists "profiles_own_select" on public.profiles;
create policy "profiles_own_select"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles_own_update" on public.profiles;
create policy "profiles_own_update"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "profiles_own_insert" on public.profiles;
create policy "profiles_own_insert"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "customers_own_all" on public.customers;
create policy "customers_own_all"
  on public.customers for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "follow_up_history_own_all" on public.follow_up_history;
create policy "follow_up_history_own_all"
  on public.follow_up_history for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "vehicles_own_all" on public.vehicles;
create policy "vehicles_own_all"
  on public.vehicles for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "insurance_own_all" on public.insurance;
create policy "insurance_own_all"
  on public.insurance for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "insurance_history_own_all" on public.insurance_renewal_history;
create policy "insurance_history_own_all"
  on public.insurance_renewal_history for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
