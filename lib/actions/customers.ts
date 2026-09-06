"use server";

import { revalidatePath } from "next/cache";
import { CUSTOMER_STATUSES, PROTON_MODELS, type CustomerStatus, type ProtonModel } from "@/lib/constants";
import { resolveFollowUp } from "@/lib/follow-up";
import { normalizeMalaysiaPhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import { getDemoSessionId } from "@/lib/demo/session";
import * as demo from "@/lib/demo/actions";
import { isIsoDate, isUuid, isValidDateRange, readFollowUpPreset } from "@/lib/validation";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const MODEL_VALUES = PROTON_MODELS.map((item) => item.value);
const STATUS_VALUES = CUSTOMER_STATUSES.map((item) => item.value);

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, userId: null as string | null };
  return { supabase, userId: user.id };
}

function readModel(value: FormDataEntryValue | null): ProtonModel | null {
  const model = String(value ?? "");
  return MODEL_VALUES.includes(model as ProtonModel) ? (model as ProtonModel) : null;
}

function readStatus(value: FormDataEntryValue | null): CustomerStatus | null {
  const status = String(value ?? "");
  return STATUS_VALUES.includes(status as CustomerStatus) ? (status as CustomerStatus) : null;
}

export async function createCustomerAction(formData: FormData): Promise<ActionResult> {
  const demoSessionId = await getDemoSessionId();
  if (demoSessionId) return demo.createCustomer(demoSessionId, formData);

  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const phone = normalizeMalaysiaPhone(phoneRaw) ?? phoneRaw;
  const protonModel = readModel(formData.get("proton_model"));
  const status = readStatus(formData.get("customer_status")) ?? "new_lead";
  const preset = readFollowUpPreset(formData.get("follow_up_preset"));
  const customDate = String(formData.get("custom_follow_up_date") ?? "") || null;
  const remark = String(formData.get("remark") ?? "").trim();

  if (!name) return { ok: false, error: "Customer name is required." };
  if (!phoneRaw) return { ok: false, error: "Phone number is required." };
  if (!protonModel) return { ok: false, error: "Select a Proton model." };
  if (!preset) return { ok: false, error: "Select a valid follow-up option." };
  if (preset === "custom" && (!customDate || !isIsoDate(customDate))) {
    return { ok: false, error: "Enter a valid custom follow-up date." };
  }
  if (!normalizeMalaysiaPhone(phoneRaw)) {
    return { ok: false, error: "Enter a valid Malaysian mobile number." };
  }
  const followUp = resolveFollowUp(preset, customDate);

  if (status === "sold") {
    return markSoldInternal(supabase, {
      existingId: null,
      name,
      phone,
      protonModel,
      remark,
      formData,
    });
  }

  const { data, error } = await supabase.rpc("create_customer_with_history", {
    p_name: name,
    p_phone: phone,
    p_proton_model: protonModel,
    p_customer_status: status,
    p_next_follow_up_at: followUp.nextFollowUpAt,
    p_follow_up_enabled: followUp.enabled,
    p_remark: remark,
  });

  if (error || typeof data !== "string") {
    return { ok: false, error: error?.message ?? "Could not add customer." };
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  revalidatePath("/follow-ups");
  return { ok: true, id: data };
}

export async function updateCustomerAction(formData: FormData): Promise<ActionResult> {
  const demoSessionId = await getDemoSessionId();
  if (demoSessionId) return demo.updateCustomer(demoSessionId, formData);

  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const phone = normalizeMalaysiaPhone(phoneRaw) ?? phoneRaw;
  const protonModel = readModel(formData.get("proton_model"));
  const status = readStatus(formData.get("customer_status"));

  if (!isUuid(id)) return { ok: false, error: "Invalid customer." };
  if (!name || !protonModel || !status) {
    return { ok: false, error: "Name, model, and status are required." };
  }
  if (!normalizeMalaysiaPhone(phoneRaw)) {
    return { ok: false, error: "Enter a valid Malaysian mobile number." };
  }

  const { data: current, error: currentError } = await supabase
    .from("customers")
    .select("customer_status")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (currentError || !current) return { ok: false, error: "Customer not found." };

  if (status === "sold" && current?.customer_status !== "sold") {
    return { ok: false, error: "Use Mark as Sold to add vehicle and insurance details." };
  }
  if (current.customer_status === "sold" && status !== "sold") {
    return { ok: false, error: "A sold customer cannot be changed back to a lead." };
  }

  const { data: updated, error } = await supabase
    .from("customers")
    .update({
      name,
      phone,
      proton_model: protonModel,
      customer_status: status,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !updated) return { ok: false, error: error?.message ?? "Customer not found." };

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  revalidatePath("/dashboard");
  return { ok: true, id };
}

export async function archiveCustomerAction(customerId: string, archive: boolean): Promise<ActionResult> {
  const demoSessionId = await getDemoSessionId();
  if (demoSessionId) return demo.archiveCustomer(demoSessionId, customerId, archive);

  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "You must be signed in." };
  if (!isUuid(customerId)) return { ok: false, error: "Invalid customer." };

  const { data, error } = await supabase
    .from("customers")
    .update({ archived_at: archive ? new Date().toISOString() : null })
    .eq("id", customerId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) return { ok: false, error: error?.message ?? "Customer not found." };

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/dashboard");
  revalidatePath("/follow-ups");
  revalidatePath("/insurance");
  return { ok: true, id: customerId };
}

export async function recordFollowUpAction(formData: FormData): Promise<ActionResult> {
  const demoSessionId = await getDemoSessionId();
  if (demoSessionId) return demo.recordFollowUp(demoSessionId, formData);

  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const customerId = String(formData.get("customer_id") ?? "");
  const remark = String(formData.get("remark") ?? "").trim();
  const preset = readFollowUpPreset(formData.get("follow_up_preset"));
  const customDate = String(formData.get("custom_follow_up_date") ?? "") || null;

  if (!isUuid(customerId)) return { ok: false, error: "Invalid customer." };
  if (!remark) return { ok: false, error: "Add a new remark before saving." };
  if (!preset) return { ok: false, error: "Select a valid follow-up option." };
  if (preset === "custom" && (!customDate || !isIsoDate(customDate))) {
    return { ok: false, error: "Enter a valid custom follow-up date." };
  }
  const followUp = resolveFollowUp(preset, customDate);

  const { data, error } = await supabase.rpc("record_customer_follow_up", {
    p_customer_id: customerId,
    p_remark: remark,
    p_next_follow_up_at: followUp.nextFollowUpAt,
    p_follow_up_enabled: followUp.enabled,
  });

  if (error || data !== customerId) return { ok: false, error: error?.message ?? "Could not save follow-up." };

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/dashboard");
  revalidatePath("/follow-ups");
  return { ok: true, id: customerId };
}

type SoldPayload = {
  existingId: string | null;
  name: string;
  phone: string;
  protonModel: ProtonModel;
  remark: string;
  formData: FormData;
};

async function markSoldInternal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: SoldPayload,
): Promise<ActionResult> {
  const vehicleModel = readModel(payload.formData.get("vehicle_model")) ?? payload.protonModel;
  const registration = String(payload.formData.get("registration_number") ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  const deliveryDate = String(payload.formData.get("delivery_date") ?? "");
  const insuranceCompany = String(payload.formData.get("insurance_company") ?? "").trim() || null;
  const policyNumber = String(payload.formData.get("policy_number") ?? "").trim() || null;
  const startDate = String(payload.formData.get("insurance_start_date") ?? "");
  const expiryDate = String(payload.formData.get("insurance_expiry_date") ?? "");

  if (!registration) return { ok: false, error: "Car registration number is required." };
  if (!isIsoDate(deliveryDate)) return { ok: false, error: "Enter a valid sale / delivery date." };
  if (!isValidDateRange(startDate, expiryDate)) {
    return { ok: false, error: "Insurance expiry date must be on or after the start date." };
  }
  if (payload.existingId && !isUuid(payload.existingId)) {
    return { ok: false, error: "Invalid customer." };
  }
  if (!payload.existingId && (!payload.name || !normalizeMalaysiaPhone(payload.phone))) {
    return { ok: false, error: "Customer name and a valid Malaysian mobile number are required." };
  }

  const { data: customerId, error } = await supabase.rpc("mark_customer_sold", {
    p_customer_id: payload.existingId,
    p_name: payload.name,
    p_phone: payload.phone,
    p_proton_model: payload.protonModel,
    p_vehicle_model: vehicleModel,
    p_registration_number: registration,
    p_delivery_date: deliveryDate,
    p_insurance_company: insuranceCompany,
    p_policy_number: policyNumber,
    p_start_date: startDate,
    p_expiry_date: expiryDate,
    p_remark: payload.remark,
  });

  if (error || typeof customerId !== "string") {
    return { ok: false, error: error?.message ?? "Could not save sold customer." };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/dashboard");
  revalidatePath("/follow-ups");
  revalidatePath("/insurance");
  return { ok: true, id: customerId };
}

export async function markSoldAction(formData: FormData): Promise<ActionResult> {
  const demoSessionId = await getDemoSessionId();
  if (demoSessionId) return demo.markSoldAction(demoSessionId, formData);

  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const existingId = String(formData.get("customer_id") ?? "") || null;
  const { data: existing } = existingId
    ? await supabase.from("customers").select("*").eq("id", existingId).eq("user_id", userId).single()
    : { data: null };

  if (existingId && !existing) {
    return { ok: false, error: "Customer not found." };
  }

  return markSoldInternal(supabase, {
    existingId,
    name: existing?.name ?? String(formData.get("name") ?? "").trim(),
    phone: existing?.phone ?? String(formData.get("phone") ?? "").trim(),
    protonModel: (existing?.proton_model as ProtonModel) ?? readModel(formData.get("proton_model")) ?? "saga",
    remark: String(formData.get("remark") ?? "").trim(),
    formData,
  });
}

export async function renewInsuranceAction(formData: FormData): Promise<ActionResult> {
  const demoSessionId = await getDemoSessionId();
  if (demoSessionId) return demo.renewInsurance(demoSessionId, formData);

  const { supabase, userId } = await requireUserId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const customerId = String(formData.get("customer_id") ?? "");
  const renewalDate = String(formData.get("renewal_date") ?? "");
  const company = String(formData.get("insurance_company") ?? "").trim() || null;
  const policyNumber = String(formData.get("policy_number") ?? "").trim() || null;
  const startDate = String(formData.get("insurance_start_date") ?? "");
  const expiryDate = String(formData.get("insurance_expiry_date") ?? "");
  const remark = String(formData.get("remark") ?? "").trim() || null;

  if (!isUuid(customerId)) return { ok: false, error: "Invalid customer." };
  if (!isIsoDate(renewalDate)) return { ok: false, error: "Enter a valid renewal date." };
  if (!isValidDateRange(startDate, expiryDate)) {
    return { ok: false, error: "Insurance expiry date must be on or after the start date." };
  }

  const { data, error } = await supabase.rpc("renew_customer_insurance", {
    p_customer_id: customerId,
    p_renewal_date: renewalDate,
    p_insurance_company: company,
    p_policy_number: policyNumber,
    p_start_date: startDate,
    p_expiry_date: expiryDate,
    p_remark: remark,
  });

  if (error || data !== customerId) return { ok: false, error: error?.message ?? "Could not save renewal." };

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/dashboard");
  revalidatePath("/insurance");
  return { ok: true, id: customerId };
}
