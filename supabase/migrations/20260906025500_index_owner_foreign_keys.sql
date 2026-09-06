create index follow_up_history_customer_owner_idx
  on public.follow_up_history (customer_id, user_id);

create index vehicles_customer_owner_idx
  on public.vehicles (customer_id, user_id);

create index insurance_customer_owner_idx
  on public.insurance (customer_id, user_id);

create index insurance_vehicle_owner_idx
  on public.insurance (vehicle_id, user_id);

create index insurance_history_customer_owner_idx
  on public.insurance_renewal_history (customer_id, user_id);

create index insurance_history_vehicle_owner_idx
  on public.insurance_renewal_history (vehicle_id, user_id);
