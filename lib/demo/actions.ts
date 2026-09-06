import { CUSTOMER_STATUSES, PROTON_MODELS, type CustomerStatus, type ProtonModel } from "@/lib/constants";
import { resolveFollowUp } from "@/lib/follow-up";
import { normalizeMalaysiaPhone } from "@/lib/phone";
import { isIsoDate, isValidDateRange, readFollowUpPreset, readInterestLevel } from "@/lib/validation";
type ActionResult = { ok: true; id?: string } | { ok: false; error: string };
import {
  demoAddFollowUp,
  demoAddInsuranceHistory,
  demoInsertCustomer,
  demoInsuranceHistoryCount,
  demoUpdateCustomer,
  demoUpsertInsurance,
  demoUpsertVehicle,
  getDemoCustomer,
} from "@/lib/demo/store";

const MODEL_VALUES = PROTON_MODELS.map((item) => item.value);
const STATUS_VALUES = CUSTOMER_STATUSES.map((item) => item.value);

function readModel(value: FormDataEntryValue | null): ProtonModel | null {
  const model = String(value ?? "");
  return MODEL_VALUES.includes(model as ProtonModel) ? (model as ProtonModel) : null;
}

function readStatus(value: FormDataEntryValue | null): CustomerStatus | null {
  const status = String(value ?? "");
  return STATUS_VALUES.includes(status as CustomerStatus) ? (status as CustomerStatus) : null;
}

function markSold(sessionId: string, formData: FormData, existingId: string | null): ActionResult {
  const existing = existingId ? getDemoCustomer(sessionId, existingId).customer : null;
  const name = existing?.name ?? String(formData.get("name") ?? "").trim();
  const phoneRaw = existing?.phone ?? String(formData.get("phone") ?? "").trim();
  const phone = normalizeMalaysiaPhone(phoneRaw) ?? phoneRaw;
  const protonModel =
    existing?.proton_model ?? readModel(formData.get("proton_model")) ?? readModel(formData.get("vehicle_model"));
  const interestLevel = existing?.interest_level ?? readInterestLevel(formData.get("interest_level"));
  const remark = String(formData.get("remark") ?? "").trim();
  const vehicleModel = readModel(formData.get("vehicle_model")) ?? protonModel;
  const registration = String(formData.get("registration_number") ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  const deliveryDate = String(formData.get("delivery_date") ?? "");
  const insuranceCompany = String(formData.get("insurance_company") ?? "").trim() || null;
  const policyNumber = String(formData.get("policy_number") ?? "").trim() || null;
  const startDate = String(formData.get("insurance_start_date") ?? "");
  const expiryDate = String(formData.get("insurance_expiry_date") ?? "");

  if (!name || !phoneRaw || !protonModel || !interestLevel) {
    return { ok: false, error: "Name, phone, model, and interest level are required." };
  }
  if (!registration) return { ok: false, error: "Car registration number is required." };
  if (!deliveryDate) return { ok: false, error: "Sale / delivery date is required." };
  if (!startDate) return { ok: false, error: "Insurance start date is required." };
  if (!expiryDate) return { ok: false, error: "Insurance expiry date is required." };
  if (!normalizeMalaysiaPhone(phoneRaw)) return { ok: false, error: "Enter a valid Malaysian mobile number." };
  if (!isIsoDate(deliveryDate)) return { ok: false, error: "Enter a valid sale / delivery date." };
  if (!isValidDateRange(startDate, expiryDate)) {
    return { ok: false, error: "Insurance expiry date must be on or after the start date." };
  }

  let customerId = existingId;
  if (!customerId) {
    const created = demoInsertCustomer(sessionId, {
      name,
      phone,
      proton_model: protonModel,
      interest_level: interestLevel,
      customer_status: "sold",
      next_follow_up_at: null,
      follow_up_enabled: false,
      latest_remark: remark || null,
      archived_at: null,
    });
    customerId = created.id;
    if (remark) {
      demoAddFollowUp(sessionId, {
        customer_id: customerId,
        remark,
        next_follow_up_at: null,
      });
    }
  } else {
    demoUpdateCustomer(sessionId, customerId, {
      customer_status: "sold",
      proton_model: vehicleModel ?? protonModel,
      follow_up_enabled: false,
      next_follow_up_at: null,
    });
  }

  const vehicle = demoUpsertVehicle(sessionId, {
    customer_id: customerId,
    proton_model: vehicleModel ?? protonModel,
    registration_number: registration,
    delivery_date: deliveryDate,
  });

  demoUpsertInsurance(sessionId, {
    customer_id: customerId,
    vehicle_id: vehicle.id,
    insurance_company: insuranceCompany,
    policy_number: policyNumber,
    start_date: startDate,
    expiry_date: expiryDate,
  });

  if (!demoInsuranceHistoryCount(sessionId, customerId)) {
    demoAddInsuranceHistory(sessionId, {
      customer_id: customerId,
      vehicle_id: vehicle.id,
      insurance_company: insuranceCompany,
      policy_number: policyNumber,
      start_date: startDate,
      expiry_date: expiryDate,
      renewed_at: startDate,
      remark: "Initial insurance policy",
    });
  }

  return { ok: true, id: customerId };
}

export function createCustomer(sessionId: string, formData: FormData): ActionResult {
  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const phone = normalizeMalaysiaPhone(phoneRaw) ?? phoneRaw;
  const protonModel = readModel(formData.get("proton_model"));
  const status = readStatus(formData.get("customer_status")) ?? "new_lead";
  const interestLevel = readInterestLevel(formData.get("interest_level"));
  const preset = readFollowUpPreset(formData.get("follow_up_preset"));
  const customDate = String(formData.get("custom_follow_up_date") ?? "") || null;
  const remark = String(formData.get("remark") ?? "").trim();

  if (!name) return { ok: false, error: "Customer name is required." };
  if (!phoneRaw) return { ok: false, error: "Phone number is required." };
  if (!protonModel) return { ok: false, error: "Select a Proton model." };
  if (!interestLevel) return { ok: false, error: "Select a valid interest level." };
  if (!preset) return { ok: false, error: "Select a valid follow-up option." };
  if (preset === "custom" && (!customDate || !isIsoDate(customDate))) {
    return { ok: false, error: "Enter a valid custom follow-up date." };
  }
  if (!normalizeMalaysiaPhone(phoneRaw)) {
    return { ok: false, error: "Enter a valid Malaysian mobile number." };
  }
  const followUp = resolveFollowUp(preset, customDate);

  if (status === "sold") {
    return markSold(sessionId, formData, null);
  }

  const customer = demoInsertCustomer(sessionId, {
    name,
    phone,
    proton_model: protonModel,
    interest_level: interestLevel,
    customer_status: status,
    next_follow_up_at: followUp.nextFollowUpAt,
    follow_up_enabled: followUp.enabled,
    latest_remark: remark || null,
    archived_at: null,
  });

  if (remark) {
    demoAddFollowUp(sessionId, {
      customer_id: customer.id,
      remark,
      next_follow_up_at: followUp.nextFollowUpAt,
    });
  }

  return { ok: true, id: customer.id };
}

export function updateCustomer(sessionId: string, formData: FormData): ActionResult {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const phone = normalizeMalaysiaPhone(phoneRaw) ?? phoneRaw;
  const protonModel = readModel(formData.get("proton_model"));
  const status = readStatus(formData.get("customer_status"));
  const interestLevel = readInterestLevel(formData.get("interest_level"));
  const current = id ? getDemoCustomer(sessionId, id).customer : null;

  if (!id || !current) return { ok: false, error: "Missing customer." };
  if (!name || !protonModel || !status || !interestLevel) {
    return { ok: false, error: "Name, model, interest level, and status are required." };
  }
  if (!normalizeMalaysiaPhone(phoneRaw)) return { ok: false, error: "Enter a valid Malaysian mobile number." };
  if (status === "sold" && current.customer_status !== "sold") {
    return { ok: false, error: "Use Mark as Sold to add vehicle and insurance details." };
  }
  if (current.customer_status === "sold" && status !== "sold") {
    return { ok: false, error: "A sold customer cannot be changed back to a lead." };
  }

  demoUpdateCustomer(sessionId, id, {
    name,
    phone,
    proton_model: protonModel,
    interest_level: interestLevel,
    customer_status: status,
  });
  return { ok: true, id };
}

export function archiveCustomer(sessionId: string, customerId: string, archive: boolean): ActionResult {
  const current = demoUpdateCustomer(sessionId, customerId, {
    archived_at: archive ? new Date().toISOString() : null,
  });
  if (!current) return { ok: false, error: "Customer not found." };
  return { ok: true, id: customerId };
}

export function recordFollowUp(sessionId: string, formData: FormData): ActionResult {
  const customerId = String(formData.get("customer_id") ?? "");
  const remark = String(formData.get("remark") ?? "").trim();
  const preset = readFollowUpPreset(formData.get("follow_up_preset"));
  const customDate = String(formData.get("custom_follow_up_date") ?? "") || null;
  const current = getDemoCustomer(sessionId, customerId).customer;

  if (!customerId || !current) return { ok: false, error: "Missing customer." };
  if (!remark) return { ok: false, error: "Add a new remark before saving." };
  if (!preset) return { ok: false, error: "Select a valid follow-up option." };
  if (preset === "custom" && (!customDate || !isIsoDate(customDate))) {
    return { ok: false, error: "Enter a valid custom follow-up date." };
  }
  const followUp = resolveFollowUp(preset, customDate);

  demoAddFollowUp(sessionId, {
    customer_id: customerId,
    remark,
    next_follow_up_at: followUp.nextFollowUpAt,
  });

  demoUpdateCustomer(sessionId, customerId, {
    latest_remark: remark,
    next_follow_up_at: followUp.nextFollowUpAt,
    follow_up_enabled: followUp.enabled,
    customer_status: current.customer_status === "sold" ? "sold" : "follow_up",
  });

  return { ok: true, id: customerId };
}

export function markSoldAction(sessionId: string, formData: FormData): ActionResult {
  const existingId = String(formData.get("customer_id") ?? "") || null;
  if (existingId && !getDemoCustomer(sessionId, existingId).customer) {
    return { ok: false, error: "Customer not found." };
  }
  return markSold(sessionId, formData, existingId);
}

export function renewInsurance(sessionId: string, formData: FormData): ActionResult {
  const customerId = String(formData.get("customer_id") ?? "");
  const renewalDate = String(formData.get("renewal_date") ?? "");
  const company = String(formData.get("insurance_company") ?? "").trim() || null;
  const policyNumber = String(formData.get("policy_number") ?? "").trim() || null;
  const startDate = String(formData.get("insurance_start_date") ?? "");
  const expiryDate = String(formData.get("insurance_expiry_date") ?? "");
  const remark = String(formData.get("remark") ?? "").trim() || null;
  const current = getDemoCustomer(sessionId, customerId).customer;

  if (!customerId || !current) return { ok: false, error: "Missing customer." };
  if (current.customer_status !== "sold") return { ok: false, error: "Only sold customers can be renewed." };
  if (!current.vehicles || !current.insurance) {
    return { ok: false, error: "Vehicle and insurance records are missing." };
  }
  if (!renewalDate || !startDate || !expiryDate) {
    return { ok: false, error: "Renewal, start, and expiry dates are required." };
  }
  if (!isIsoDate(renewalDate)) return { ok: false, error: "Enter a valid renewal date." };
  if (!isValidDateRange(startDate, expiryDate)) {
    return { ok: false, error: "Insurance expiry date must be on or after the start date." };
  }

  demoAddInsuranceHistory(sessionId, {
    customer_id: customerId,
    vehicle_id: current.vehicles.id,
    insurance_company: company,
    policy_number: policyNumber,
    start_date: startDate,
    expiry_date: expiryDate,
    renewed_at: renewalDate,
    remark,
  });

  demoUpsertInsurance(sessionId, {
    customer_id: customerId,
    vehicle_id: current.vehicles.id,
    insurance_company: company,
    policy_number: policyNumber,
    start_date: startDate,
    expiry_date: expiryDate,
  });

  if (remark) {
    demoUpdateCustomer(sessionId, customerId, { latest_remark: remark });
  }

  return { ok: true, id: customerId };
}
