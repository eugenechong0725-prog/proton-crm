alter table public.vehicles
  add constraint vehicles_registration_canonical
  check (registration_number = upper(regexp_replace(registration_number, '\s', '', 'g')));

create unique index vehicles_user_registration_unique_idx
  on public.vehicles (user_id, registration_number);
