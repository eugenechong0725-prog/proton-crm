-- Keep multi-table CRM workflows atomic and bind child records to the same owner.

alter table public.customers
  add constraint customers_id_user_id_key unique (id, user_id);

alter table public.vehicles
  add constraint vehicles_id_user_id_key unique (id, user_id),
  add constraint vehicles_customer_owner_fk
    foreign key (customer_id, user_id)
    references public.customers (id, user_id)
    on delete cascade;

alter table public.follow_up_history
  add constraint follow_up_history_customer_owner_fk
    foreign key (customer_id, user_id)
    references public.customers (id, user_id)
    on delete cascade;

alter table public.insurance
  add constraint insurance_customer_owner_fk
    foreign key (customer_id, user_id)
    references public.customers (id, user_id)
    on delete cascade,
  add constraint insurance_vehicle_owner_fk
    foreign key (vehicle_id, user_id)
    references public.vehicles (id, user_id)
    on delete cascade,
  add constraint insurance_dates_valid check (expiry_date >= start_date);

alter table public.insurance_renewal_history
  add constraint insurance_history_customer_owner_fk
    foreign key (customer_id, user_id)
    references public.customers (id, user_id)
    on delete cascade,
  add constraint insurance_history_vehicle_owner_fk
    foreign key (vehicle_id, user_id)
    references public.vehicles (id, user_id)
    on delete cascade,
  add constraint insurance_history_dates_valid
    check (start_date is null or expiry_date >= start_date);

create or replace function public.create_customer_with_history(
  p_name text,
  p_phone text,
  p_proton_model public.proton_model,
  p_customer_status public.customer_status,
  p_next_follow_up_at date,
  p_follow_up_enabled boolean,
  p_remark text
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
  if p_customer_status = 'sold' then
    raise exception 'Use the sold workflow for sold customers.';
  end if;

  insert into public.customers (
    user_id, name, phone, proton_model, customer_status,
    next_follow_up_at, follow_up_enabled, latest_remark
  ) values (
    v_user_id, p_name, p_phone, p_proton_model, p_customer_status,
    p_next_follow_up_at, p_follow_up_enabled, nullif(p_remark, '')
  )
  returning id into v_customer_id;

  if nullif(p_remark, '') is not null then
    insert into public.follow_up_history (
      customer_id, user_id, remark, next_follow_up_at
    ) values (
      v_customer_id, v_user_id, p_remark, p_next_follow_up_at
    );
  end if;

  return v_customer_id;
end;
$$;

create or replace function public.record_customer_follow_up(
  p_customer_id uuid,
  p_remark text,
  p_next_follow_up_at date,
  p_follow_up_enabled boolean
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_status public.customer_status;
begin
  if v_user_id is null then
    raise exception 'You must be signed in.';
  end if;

  select customer_status into v_status
  from public.customers
  where id = p_customer_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Customer not found.';
  end if;

  insert into public.follow_up_history (
    customer_id, user_id, remark, next_follow_up_at
  ) values (
    p_customer_id, v_user_id, p_remark, p_next_follow_up_at
  );

  update public.customers
  set latest_remark = p_remark,
      next_follow_up_at = p_next_follow_up_at,
      follow_up_enabled = p_follow_up_enabled,
      customer_status = case when v_status = 'sold' then v_status else 'follow_up' end
  where id = p_customer_id and user_id = v_user_id;

  return p_customer_id;
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
  p_remark text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_customer_id uuid := p_customer_id;
  v_vehicle_id uuid;
begin
  if v_user_id is null then
    raise exception 'You must be signed in.';
  end if;
  if p_expiry_date < p_start_date then
    raise exception 'Insurance expiry date must be on or after the start date.';
  end if;

  if v_customer_id is null then
    insert into public.customers (
      user_id, name, phone, proton_model, customer_status,
      next_follow_up_at, follow_up_enabled, latest_remark
    ) values (
      v_user_id, p_name, p_phone, p_proton_model, 'sold',
      null, false, nullif(p_remark, '')
    )
    returning id into v_customer_id;

    if nullif(p_remark, '') is not null then
      insert into public.follow_up_history (
        customer_id, user_id, remark, next_follow_up_at
      ) values (v_customer_id, v_user_id, p_remark, null);
    end if;
  else
    perform 1 from public.customers
    where id = v_customer_id and user_id = v_user_id
    for update;

    if not found then
      raise exception 'Customer not found.';
    end if;

    update public.customers
    set customer_status = 'sold',
        proton_model = p_vehicle_model,
        follow_up_enabled = false,
        next_follow_up_at = null
    where id = v_customer_id and user_id = v_user_id;
  end if;

  insert into public.vehicles (
    customer_id, user_id, proton_model, registration_number, delivery_date
  ) values (
    v_customer_id, v_user_id, p_vehicle_model, p_registration_number, p_delivery_date
  )
  on conflict (customer_id) do update
  set proton_model = excluded.proton_model,
      registration_number = excluded.registration_number,
      delivery_date = excluded.delivery_date
  where public.vehicles.user_id = v_user_id
  returning id into v_vehicle_id;

  if v_vehicle_id is null then
    raise exception 'Vehicle record belongs to another user.';
  end if;

  insert into public.insurance (
    customer_id, vehicle_id, user_id, insurance_company,
    policy_number, start_date, expiry_date
  ) values (
    v_customer_id, v_vehicle_id, v_user_id, nullif(p_insurance_company, ''),
    nullif(p_policy_number, ''), p_start_date, p_expiry_date
  )
  on conflict (customer_id) do update
  set vehicle_id = excluded.vehicle_id,
      insurance_company = excluded.insurance_company,
      policy_number = excluded.policy_number,
      start_date = excluded.start_date,
      expiry_date = excluded.expiry_date
  where public.insurance.user_id = v_user_id;

  if not exists (
    select 1 from public.insurance_renewal_history
    where customer_id = v_customer_id and user_id = v_user_id
  ) then
    insert into public.insurance_renewal_history (
      customer_id, vehicle_id, user_id, insurance_company, policy_number,
      start_date, expiry_date, renewed_at, remark
    ) values (
      v_customer_id, v_vehicle_id, v_user_id, nullif(p_insurance_company, ''),
      nullif(p_policy_number, ''), p_start_date, p_expiry_date, p_start_date,
      'Initial insurance policy'
    );
  end if;

  return v_customer_id;
end;
$$;

create or replace function public.renew_customer_insurance(
  p_customer_id uuid,
  p_renewal_date date,
  p_insurance_company text,
  p_policy_number text,
  p_start_date date,
  p_expiry_date date,
  p_remark text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_vehicle_id uuid;
  v_insurance_id uuid;
begin
  if v_user_id is null then
    raise exception 'You must be signed in.';
  end if;
  if p_expiry_date < p_start_date then
    raise exception 'Insurance expiry date must be on or after the start date.';
  end if;

  perform 1 from public.customers
  where id = p_customer_id
    and user_id = v_user_id
    and customer_status = 'sold'
  for update;

  if not found then
    raise exception 'Only sold customers can be renewed.';
  end if;

  select id into v_vehicle_id
  from public.vehicles
  where customer_id = p_customer_id and user_id = v_user_id;

  select id into v_insurance_id
  from public.insurance
  where customer_id = p_customer_id and user_id = v_user_id
  for update;

  if v_vehicle_id is null or v_insurance_id is null then
    raise exception 'Vehicle and insurance records are missing.';
  end if;

  insert into public.insurance_renewal_history (
    customer_id, vehicle_id, user_id, insurance_company, policy_number,
    start_date, expiry_date, renewed_at, remark
  ) values (
    p_customer_id, v_vehicle_id, v_user_id, nullif(p_insurance_company, ''),
    nullif(p_policy_number, ''), p_start_date, p_expiry_date, p_renewal_date,
    nullif(p_remark, '')
  );

  update public.insurance
  set insurance_company = nullif(p_insurance_company, ''),
      policy_number = nullif(p_policy_number, ''),
      start_date = p_start_date,
      expiry_date = p_expiry_date
  where id = v_insurance_id and user_id = v_user_id;

  if nullif(p_remark, '') is not null then
    update public.customers
    set latest_remark = p_remark
    where id = p_customer_id and user_id = v_user_id;
  end if;

  return p_customer_id;
end;
$$;

revoke execute on function public.create_customer_with_history(text, text, public.proton_model, public.customer_status, date, boolean, text) from public, anon;
revoke execute on function public.record_customer_follow_up(uuid, text, date, boolean) from public, anon;
revoke execute on function public.mark_customer_sold(uuid, text, text, public.proton_model, public.proton_model, text, date, text, text, date, date, text) from public, anon;
revoke execute on function public.renew_customer_insurance(uuid, date, text, text, date, date, text) from public, anon;

grant execute on function public.create_customer_with_history(text, text, public.proton_model, public.customer_status, date, boolean, text) to authenticated;
grant execute on function public.record_customer_follow_up(uuid, text, date, boolean) to authenticated;
grant execute on function public.mark_customer_sold(uuid, text, text, public.proton_model, public.proton_model, text, date, text, text, date, date, text) to authenticated;
grant execute on function public.renew_customer_insurance(uuid, date, text, text, date, date, text) to authenticated;
