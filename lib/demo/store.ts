import { canShowInsurance, matchesInsuranceFilter } from "@/lib/insurance";
import { addDaysInKL, todayInKL } from "@/lib/dates";
import { DEMO_USER_ID } from "@/lib/demo/session";
import type { CustomerStatus, InsuranceFilter, ProtonModel } from "@/lib/constants";
import type {
  Customer,
  CustomerRecord,
  FollowUpHistory,
  Insurance,
  InsuranceRenewalHistory,
  Vehicle,
} from "@/lib/types";

type DemoStore = {
  customers: Customer[];
  vehicles: Vehicle[];
  insurance: Insurance[];
  followUps: FollowUpHistory[];
  insuranceHistory: InsuranceRenewalHistory[];
};

type DemoEntry = { store: DemoStore; lastAccess: number };
type GlobalDemo = typeof globalThis & { __protonDemoStores?: Map<string, DemoEntry> };
const MAX_DEMO_SESSIONS = 100;

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function seed(): DemoStore {
  const now = new Date();
  const today = todayInKL(now);
  const created = isoDaysAgo(40);

  const ahmad: Customer = {
    id: "demo-ahmad",
    user_id: DEMO_USER_ID,
    name: "Ahmad Razak",
    phone: "60162246868",
    proton_model: "x50",
    customer_status: "follow_up",
    next_follow_up_at: today,
    follow_up_enabled: true,
    latest_remark: "Came in for X50 test drive. Will decide after talking to wife.",
    archived_at: null,
    created_at: created,
    updated_at: isoDaysAgo(0),
  };

  const siti: Customer = {
    id: "demo-siti",
    user_id: DEMO_USER_ID,
    name: "Siti Aminah",
    phone: "60133445566",
    proton_model: "saga",
    customer_status: "follow_up",
    next_follow_up_at: addDaysInKL(-3, now),
    follow_up_enabled: true,
    latest_remark: "Asked for weekend price. Missed last call.",
    archived_at: null,
    created_at: created,
    updated_at: isoDaysAgo(3),
  };

  const farah: Customer = {
    id: "demo-farah",
    user_id: DEMO_USER_ID,
    name: "Farah Lim",
    phone: "60198765432",
    proton_model: "emas_5",
    customer_status: "new_lead",
    next_follow_up_at: addDaysInKL(5, now),
    follow_up_enabled: true,
    latest_remark: "Walk-in. Interested in e.MAS 5 colour options.",
    archived_at: null,
    created_at: isoDaysAgo(1),
    updated_at: isoDaysAgo(1),
  };

  const wei: Customer = {
    id: "demo-wei",
    user_id: DEMO_USER_ID,
    name: "Wei Jun",
    phone: "60125551234",
    proton_model: "emas_6",
    customer_status: "not_interested",
    next_follow_up_at: null,
    follow_up_enabled: false,
    latest_remark: "Chose another brand. Keep record only.",
    archived_at: null,
    created_at: created,
    updated_at: isoDaysAgo(12),
  };

  const kumar: Customer = {
    id: "demo-kumar",
    user_id: DEMO_USER_ID,
    name: "Kumar Selvam",
    phone: "60172223344",
    proton_model: "x70",
    customer_status: "sold",
    next_follow_up_at: null,
    follow_up_enabled: false,
    latest_remark: "Delivered X70. Insurance due in about 3 weeks.",
    archived_at: null,
    created_at: created,
    updated_at: isoDaysAgo(2),
  };

  const mei: Customer = {
    id: "demo-mei",
    user_id: DEMO_USER_ID,
    name: "Mei Ling Tan",
    phone: "60168889900",
    proton_model: "x90",
    customer_status: "sold",
    next_follow_up_at: null,
    follow_up_enabled: false,
    latest_remark: "X90 delivered last year. Renewal is urgent.",
    archived_at: null,
    created_at: created,
    updated_at: isoDaysAgo(1),
  };

  const raj: Customer = {
    id: "demo-raj",
    user_id: DEMO_USER_ID,
    name: "Rajendran",
    phone: "60137778899",
    proton_model: "s70",
    customer_status: "sold",
    next_follow_up_at: null,
    follow_up_enabled: false,
    latest_remark: "Insurance already expired. Call today.",
    archived_at: null,
    created_at: created,
    updated_at: isoDaysAgo(4),
  };

  const kumarVehicle: Vehicle = {
    id: "demo-kumar-car",
    customer_id: kumar.id,
    user_id: DEMO_USER_ID,
    proton_model: "x70",
    registration_number: "VBG1234",
    delivery_date: addDaysInKL(-340, now),
    created_at: created,
  };

  const meiVehicle: Vehicle = {
    id: "demo-mei-car",
    customer_id: mei.id,
    user_id: DEMO_USER_ID,
    proton_model: "x90",
    registration_number: "BKK9088",
    delivery_date: addDaysInKL(-360, now),
    created_at: created,
  };

  const rajVehicle: Vehicle = {
    id: "demo-raj-car",
    customer_id: raj.id,
    user_id: DEMO_USER_ID,
    proton_model: "s70",
    registration_number: "JTX5511",
    delivery_date: addDaysInKL(-370, now),
    created_at: created,
  };

  const kumarInsurance: Insurance = {
    id: "demo-kumar-ins",
    customer_id: kumar.id,
    vehicle_id: kumarVehicle.id,
    user_id: DEMO_USER_ID,
    insurance_company: "Allianz",
    policy_number: "ALZ-77821",
    start_date: addDaysInKL(-340, now),
    expiry_date: addDaysInKL(22, now),
    updated_at: created,
  };

  const meiInsurance: Insurance = {
    id: "demo-mei-ins",
    customer_id: mei.id,
    vehicle_id: meiVehicle.id,
    user_id: DEMO_USER_ID,
    insurance_company: "Takaful Malaysia",
    policy_number: "TKF-22019",
    start_date: addDaysInKL(-360, now),
    expiry_date: addDaysInKL(5, now),
    updated_at: created,
  };

  const rajInsurance: Insurance = {
    id: "demo-raj-ins",
    customer_id: raj.id,
    vehicle_id: rajVehicle.id,
    user_id: DEMO_USER_ID,
    insurance_company: "Etiqa",
    policy_number: "ETQ-10933",
    start_date: addDaysInKL(-370, now),
    expiry_date: addDaysInKL(-4, now),
    updated_at: created,
  };

  return {
    customers: [ahmad, siti, farah, wei, kumar, mei, raj],
    vehicles: [kumarVehicle, meiVehicle, rajVehicle],
    insurance: [kumarInsurance, meiInsurance, rajInsurance],
    followUps: [
      {
        id: "demo-ahmad-fu-1",
        customer_id: ahmad.id,
        user_id: DEMO_USER_ID,
        remark: "Came in for X50 test drive. Will decide after talking to wife.",
        followed_up_at: isoDaysAgo(3),
        next_follow_up_at: today,
        created_at: isoDaysAgo(3),
      },
      {
        id: "demo-siti-fu-1",
        customer_id: siti.id,
        user_id: DEMO_USER_ID,
        remark: "Asked for weekend price. Missed last call.",
        followed_up_at: isoDaysAgo(6),
        next_follow_up_at: addDaysInKL(-3, now),
        created_at: isoDaysAgo(6),
      },
    ],
    insuranceHistory: [
      {
        id: "demo-kumar-hist-1",
        customer_id: kumar.id,
        vehicle_id: kumarVehicle.id,
        user_id: DEMO_USER_ID,
        insurance_company: "Allianz",
        policy_number: "ALZ-77821",
        start_date: addDaysInKL(-340, now),
        expiry_date: addDaysInKL(22, now),
        renewed_at: addDaysInKL(-340, now),
        remark: "Initial insurance policy",
        created_at: created,
      },
      {
        id: "demo-mei-hist-1",
        customer_id: mei.id,
        vehicle_id: meiVehicle.id,
        user_id: DEMO_USER_ID,
        insurance_company: "Takaful Malaysia",
        policy_number: "TKF-22019",
        start_date: addDaysInKL(-360, now),
        expiry_date: addDaysInKL(5, now),
        renewed_at: addDaysInKL(-360, now),
        remark: "Initial insurance policy",
        created_at: created,
      },
      {
        id: "demo-raj-hist-1",
        customer_id: raj.id,
        vehicle_id: rajVehicle.id,
        user_id: DEMO_USER_ID,
        insurance_company: "Etiqa",
        policy_number: "ETQ-10933",
        start_date: addDaysInKL(-370, now),
        expiry_date: addDaysInKL(-4, now),
        renewed_at: addDaysInKL(-370, now),
        remark: "Initial insurance policy",
        created_at: created,
      },
    ],
  };
}

export function getDemoStore(sessionId: string) {
  const globalStore = globalThis as GlobalDemo;
  globalStore.__protonDemoStores ??= new Map();
  const existing = globalStore.__protonDemoStores.get(sessionId);
  if (existing) {
    existing.lastAccess = Date.now();
    return existing.store;
  }

  if (globalStore.__protonDemoStores.size >= MAX_DEMO_SESSIONS) {
    const oldest = [...globalStore.__protonDemoStores.entries()].sort(
      (a, b) => a[1].lastAccess - b[1].lastAccess,
    )[0]?.[0];
    if (oldest) globalStore.__protonDemoStores.delete(oldest);
  }

  const store = seed();
  globalStore.__protonDemoStores.set(sessionId, { store, lastAccess: Date.now() });
  return store;
}

export function resetDemoStore(sessionId: string) {
  const globalStore = globalThis as GlobalDemo;
  globalStore.__protonDemoStores ??= new Map();
  globalStore.__protonDemoStores.set(sessionId, { store: seed(), lastAccess: Date.now() });
}

function asRecord(customer: Customer, store: DemoStore): CustomerRecord {
  return {
    ...customer,
    vehicles: store.vehicles.find((item) => item.customer_id === customer.id) ?? null,
    insurance: store.insurance.find((item) => item.customer_id === customer.id) ?? null,
  };
}

export function listDemoCustomers(sessionId: string, filters: {
  query?: string;
  model?: ProtonModel | "all";
  status?: CustomerStatus | "all";
  insurance?: InsuranceFilter | "all";
  includeArchived?: boolean;
}): CustomerRecord[] {
  const store = getDemoStore(sessionId);
  let rows = store.customers.map((customer) => asRecord(customer, store));

  if (!filters.includeArchived) {
    rows = rows.filter((row) => !row.archived_at);
  }
  if (filters.model && filters.model !== "all") {
    rows = rows.filter((row) => row.proton_model === filters.model);
  }
  if (filters.status && filters.status !== "all") {
    rows = rows.filter((row) => row.customer_status === filters.status);
  }

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

  return rows.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getDemoCustomer(sessionId: string, id: string) {
  const store = getDemoStore(sessionId);
  const customer = store.customers.find((item) => item.id === id);
  return {
    customer: customer ? asRecord(customer, store) : null,
    followUps: store.followUps
      .filter((item) => item.customer_id === id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    insuranceHistory: store.insuranceHistory
      .filter((item) => item.customer_id === id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
  };
}

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function demoInsertCustomer(sessionId: string, input: Omit<Customer, "id" | "user_id" | "created_at" | "updated_at">) {
  const store = getDemoStore(sessionId);
  const customer: Customer = {
    ...input,
    id: newId("demo-c"),
    user_id: DEMO_USER_ID,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  store.customers.unshift(customer);
  return customer;
}

export function demoUpdateCustomer(sessionId: string, id: string, patch: Partial<Customer>) {
  const store = getDemoStore(sessionId);
  const current = store.customers.find((item) => item.id === id);
  if (!current) return null;
  Object.assign(current, patch, { updated_at: nowIso() });
  return current;
}

export function demoAddFollowUp(sessionId: string, input: Omit<FollowUpHistory, "id" | "user_id" | "created_at" | "followed_up_at">) {
  const store = getDemoStore(sessionId);
  const row: FollowUpHistory = {
    ...input,
    id: newId("demo-fu"),
    user_id: DEMO_USER_ID,
    followed_up_at: nowIso(),
    created_at: nowIso(),
  };
  store.followUps.unshift(row);
  return row;
}

export function demoUpsertVehicle(sessionId: string, input: Omit<Vehicle, "id" | "user_id" | "created_at"> & { id?: string }) {
  const store = getDemoStore(sessionId);
  const existing = store.vehicles.find((item) => item.customer_id === input.customer_id);
  if (existing) {
    Object.assign(existing, input);
    return existing;
  }
  const vehicle: Vehicle = {
    ...input,
    id: input.id ?? newId("demo-v"),
    user_id: DEMO_USER_ID,
    created_at: nowIso(),
  };
  store.vehicles.push(vehicle);
  return vehicle;
}

export function demoUpsertInsurance(sessionId: string, input: Omit<Insurance, "id" | "user_id" | "updated_at"> & { id?: string }) {
  const store = getDemoStore(sessionId);
  const existing = store.insurance.find((item) => item.customer_id === input.customer_id);
  if (existing) {
    Object.assign(existing, input, { updated_at: nowIso() });
    return existing;
  }
  const row: Insurance = {
    ...input,
    id: input.id ?? newId("demo-i"),
    user_id: DEMO_USER_ID,
    updated_at: nowIso(),
  };
  store.insurance.push(row);
  return row;
}

export function demoAddInsuranceHistory(
  sessionId: string,
  input: Omit<InsuranceRenewalHistory, "id" | "user_id" | "created_at">,
) {
  const store = getDemoStore(sessionId);
  const row: InsuranceRenewalHistory = {
    ...input,
    id: newId("demo-ih"),
    user_id: DEMO_USER_ID,
    created_at: nowIso(),
  };
  store.insuranceHistory.unshift(row);
  return row;
}

export function demoInsuranceHistoryCount(sessionId: string, customerId: string) {
  return getDemoStore(sessionId).insuranceHistory.filter((item) => item.customer_id === customerId).length;
}
