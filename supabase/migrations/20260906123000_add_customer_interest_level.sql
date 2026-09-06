-- Add a salesperson-owned lead temperature without changing existing RLS boundaries.

do $$ begin
  create type public.interest_level as enum ('hot', 'warm', 'cold');
exception
  when duplicate_object then null;
end $$;

alter table public.customers
  add column if not exists interest_level public.interest_level not null default 'warm';

create index if not exists customers_user_interest_level_idx
  on public.customers (user_id, interest_level)
  where archived_at is null;

create or replace function public.create_customer_with_history(
  p_name text,
  p_phone text,
  p_proton_model public.proton_model,
  p_customer_status public.customer_status,
  p_next_follow_up_at date,
  p_follow_up_enabled boolean,
  p_remark text,
  p_interest_level public.interest_level
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_customer_id uuid;
begin
  if v_user_id is null then
    raise exception 'You must be signed in.';
  end if;

  v_customer_id := public.create_customer_with_history(
    p_name,
    p_phone,
    p_proton_model,
    p_customer_status,
    p_next_follow_up_at,
    p_follow_up_enabled,
    p_remark
  );

  update public.customers
  set interest_level = p_interest_level
  where id = v_customer_id and user_id = v_user_id;

  return v_customer_id;
end;
$$;

create or replace function public.mark_customer_sold(
  p_customer_id uuid,
  p_name text,
  p_phone text,
  p_proton_model public.proton_model,
  p_vehicle_model public.proton_model,
  p_registration_number text,
  p_delivery_date date,
  p_insurance_company text,
  p_policy_number text,
  p_start_date date,
  p_expiry_date date,
  p_remark text,
  p_interest_level public.interest_level
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_customer_id uuid;
begin
  if v_user_id is null then
    raise exception 'You must be signed in.';
  end if;

  v_customer_id := public.mark_customer_sold(
    p_customer_id,
    p_name,
    p_phone,
    p_proton_model,
    p_vehicle_model,
    p_registration_number,
    p_delivery_date,
    p_insurance_company,
    p_policy_number,
    p_start_date,
    p_expiry_date,
    p_remark
  );

  update public.customers
  set interest_level = p_interest_level
  where id = v_customer_id and user_id = v_user_id;

  return v_customer_id;
end;
$$;

revoke execute on function public.create_customer_with_history(text, text, public.proton_model, public.customer_status, date, boolean, text, public.interest_level) from public, anon;
revoke execute on function public.mark_customer_sold(uuid, text, text, public.proton_model, public.proton_model, text, date, text, text, date, date, text, public.interest_level) from public, anon;

grant execute on function public.create_customer_with_history(text, text, public.proton_model, public.customer_status, date, boolean, text, public.interest_level) to authenticated;
grant execute on function public.mark_customer_sold(uuid, text, text, public.proton_model, public.proton_model, text, date, text, text, date, date, text, public.interest_level) to authenticated;
