import type { CustomerStatus, ProtonModel } from "@/lib/constants";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  proton_model: ProtonModel;
  customer_status: CustomerStatus;
  next_follow_up_at: string | null;
  follow_up_enabled: boolean;
  latest_remark: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FollowUpHistory = {
  id: string;
  customer_id: string;
  user_id: string;
  remark: string;
  followed_up_at: string;
  next_follow_up_at: string | null;
  created_at: string;
};

export type Vehicle = {
  id: string;
  customer_id: string;
  user_id: string;
  proton_model: ProtonModel;
  registration_number: string;
  delivery_date: string;
  created_at: string;
};

export type Insurance = {
  id: string;
  customer_id: string;
  vehicle_id: string;
  user_id: string;
  insurance_company: string | null;
  policy_number: string | null;
  start_date: string;
  expiry_date: string;
  updated_at: string;
};

export type InsuranceRenewalHistory = {
  id: string;
  customer_id: string;
  vehicle_id: string;
  user_id: string;
  insurance_company: string | null;
  policy_number: string | null;
  start_date: string | null;
  expiry_date: string;
  renewed_at: string | null;
  remark: string | null;
  created_at: string;
};

export type CustomerRecord = Customer & {
  vehicles: Vehicle | null;
  insurance: Insurance | null;
};

export type InsuranceAlert = Customer & {
  vehicles: Vehicle;
  insurance: Insurance;
};
