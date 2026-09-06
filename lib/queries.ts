import { createClient } from "@/lib/supabase/server";
import { todayInKL } from "@/lib/dates";
import { followUpBucket } from "@/lib/follow-up";
import {
  canShowInsurance,
  insuranceBucket,
  matchesInsuranceFilter,
  type InsuranceBucket,
} from "@/lib/insurance";
import type { CustomerStatus, InsuranceFilter, ProtonModel } from "@/lib/constants";
import { DEMO_PROFILE, getDemoSessionId } from "@/lib/demo/session";
import { getDemoCustomer, listDemoCustomers } from "@/lib/demo/store";
import type {
  Customer,
  CustomerRecord,
  FollowUpHistory,
  Insurance,
  InsuranceAlert,
  InsuranceRenewalHistory,
  Profile,
  Vehicle,
} from "@/lib/types";

function asRecord(row: Customer & { vehicles?: Vehicle | null; insurance?: Insurance | null }): CustomerRecord {
  return {
    ...row,
    vehicles: row.vehicles ?? null,
    insurance: row.insurance ?? null,
  };
}

async function attachRelations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  customers: Customer[],
): Promise<CustomerRecord[]> {
  if (customers.length === 0) return [];

  const ids = customers.map((customer) => customer.id);
  const [vehiclesResult, insuranceResult] = await Promise.all([
    supabase.from("vehicles").select("*").in("customer_id", ids),
    supabase.from("insurance").select("*").in("customer_id", ids),
  ]);

  if (vehiclesResult.error) throw new Error(`Could not load vehicles: ${vehiclesResult.error.message}`);
  if (insuranceResult.error) throw new Error(`Could not load insurance: ${insuranceResult.error.message}`);

  const vehiclesByCustomer = new Map(
    ((vehiclesResult.data ?? []) as Vehicle[]).map((row) => [row.customer_id, row]),
  );
  const insuranceByCustomer = new Map(
    ((insuranceResult.data ?? []) as Insurance[]).map((row) => [row.customer_id, row]),
  );

  return customers.map((customer) =>
    asRecord({
      ...customer,
      vehicles: vehiclesByCustomer.get(customer.id) ?? null,
      insurance: insuranceByCustomer.get(customer.id) ?? null,
    }),
  );
}

export async function getSessionUser() {
  if (await getDemoSessionId()) {
    return {
      id: DEMO_PROFILE.id,
      email: DEMO_PROFILE.email,
      created_at: DEMO_PROFILE.created_at,
      user_metadata: { full_name: DEMO_PROFILE.full_name },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  if (await getDemoSessionId()) return DEMO_PROFILE;

  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile | null) ?? {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? null,
    email: user.email ?? null,
    created_at: user.created_at,
    updated_at: user.created_at,
  };
}

export async function getCustomers(filters: {
  query?: string;
  model?: ProtonModel | "all";
  status?: CustomerStatus | "all";
  insurance?: InsuranceFilter | "all";
  includeArchived?: boolean;
}): Promise<CustomerRecord[]> {
  const demoSessionId = await getDemoSessionId();
  if (demoSessionId) {
    return listDemoCustomers(demoSessionId, filters);
  }

  const supabase = await createClient();
  let request = supabase.from("customers").select("*").order("updated_at", { ascending: false });

  if (!filters.includeArchived) {
    request = request.is("archived_at", null);
  }

  if (filters.model && filters.model !== "all") {
    request = request.eq("proton_model", filters.model);
  }

  if (filters.status && filters.status !== "all") {
    request = request.eq("customer_status", filters.status);
  }

  const { data, error } = await request;
  if (error) throw new Error(`Could not load customers: ${error.message}`);
  if (!data) return [];

  let rows = await attachRelations(supabase, data as Customer[]);
  const query = filters.query?.trim().toLowerCase();

  if (query) {
    rows = rows.filter((row) => {
      const plate = row.vehicles?.registration_number?.toLowerCase() ?? "";
      return (
        row.name.toLowerCase().includes(query) ||
        row.phone.replace(/\s/g, "").includes(query.replace(/\s/g, "")) ||
        plate.includes(query)
      );
    });
  }

  if (filters.insurance && filters.insurance !== "all") {
    rows = rows.filter((row) => {
      if (!canShowInsurance(row.customer_status, row.archived_at) || !row.insurance) {
        return false;
      }
      return matchesInsuranceFilter(row.insurance.expiry_date, filters.insurance as InsuranceFilter);
    });
  }

  return rows;
}

export async function getCustomer(id: string): Promise<{
  customer: CustomerRecord | null;
  followUps: FollowUpHistory[];
  insuranceHistory: InsuranceRenewalHistory[];
}> {
  const demoSessionId = await getDemoSessionId();
  if (demoSessionId) {
    return getDemoCustomer(demoSessionId, id);
  }

  const supabase = await createClient();
  const [customerResult, followUpResult, insuranceHistoryResult] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("follow_up_history")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("insurance_renewal_history")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (customerResult.error) throw new Error(`Could not load customer: ${customerResult.error.message}`);
  if (followUpResult.error) throw new Error(`Could not load follow-up history: ${followUpResult.error.message}`);
  if (insuranceHistoryResult.error) {
    throw new Error(`Could not load insurance history: ${insuranceHistoryResult.error.message}`);
  }

  const customer = customerResult.data as Customer | null;
  const [record] = customer ? await attachRelations(supabase, [customer]) : [null];

  return {
    customer: record ?? null,
    followUps: (followUpResult.data as FollowUpHistory[]) ?? [],
    insuranceHistory: (insuranceHistoryResult.data as InsuranceRenewalHistory[]) ?? [],
  };
}

export async function getFollowUpLists(now = new Date()) {
  const demoSessionId = await getDemoSessionId();
  const source = demoSessionId
    ? listDemoCustomers(demoSessionId, {}).filter((row) => row.follow_up_enabled && row.next_follow_up_at)
    : await (async () => {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("follow_up_enabled", true)
          .is("archived_at", null)
          .not("next_follow_up_at", "is", null)
          .order("next_follow_up_at", { ascending: true });
        if (error) throw new Error(`Could not load follow-ups: ${error.message}`);
        return (data as Customer[]) ?? [];
      })();

  const today: Customer[] = [];
  const overdue: Customer[] = [];
  const upcoming: Customer[] = [];

  for (const row of source) {
    const bucket = followUpBucket(row.next_follow_up_at, row.follow_up_enabled, now);
    if (bucket === "today") today.push(row);
    if (bucket === "overdue") overdue.push(row);
    if (bucket === "upcoming") upcoming.push(row);
  }

  return { today, overdue, upcoming };
}

export async function getInsuranceAlerts(now = new Date()): Promise<{
  counts: Record<InsuranceBucket, number>;
  alerts: InsuranceAlert[];
}> {
  const demoSessionId = await getDemoSessionId();
  const data = demoSessionId
    ? listDemoCustomers(demoSessionId, { status: "sold" })
    : await (async () => {
        const supabase = await createClient();
        const { data: rows, error } = await supabase
          .from("customers")
          .select("*")
          .eq("customer_status", "sold")
          .is("archived_at", null);
        if (error) throw new Error(`Could not load insurance alerts: ${error.message}`);
        return attachRelations(supabase, (rows as Customer[]) ?? []);
      })();

  const counts: Record<InsuranceBucket, number> = {
    due_30: 0,
    due_14: 0,
    due_7: 0,
    today: 0,
    overdue: 0,
  };

  const alerts: InsuranceAlert[] = [];

  for (const raw of data ?? []) {
    const row = asRecord(raw as CustomerRecord);
    if (!row.insurance || !row.vehicles) continue;
    if (!canShowInsurance(row.customer_status, row.archived_at)) continue;

    const bucket = insuranceBucket(row.insurance.expiry_date, now);
    const alert = row as InsuranceAlert;
    if (bucket) {
      counts[bucket] += 1;
      alerts.push(alert);
    }
  }

  alerts.sort((a, b) => a.insurance.expiry_date.localeCompare(b.insurance.expiry_date));

  return { counts, alerts };
}

export async function getDashboardData() {
  const now = new Date();
  const [followUps, insurance, customers] = await Promise.all([
    getFollowUpLists(now),
    getInsuranceAlerts(now),
    getCustomers({}),
  ]);

  return {
    today: todayInKL(now),
    followUps,
    insurance,
    totalCustomers: customers.length,
  };
}
