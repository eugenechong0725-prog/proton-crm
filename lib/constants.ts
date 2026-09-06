export const TIMEZONE = "Asia/Kuala_Lumpur" as const;

export const PROTON_MODELS = [
  { value: "saga", label: "Proton Saga" },
  { value: "x50", label: "Proton X50" },
  { value: "x70", label: "Proton X70" },
  { value: "x90", label: "Proton X90" },
  { value: "s70", label: "Proton S70" },
  { value: "emas_5", label: "Proton e.MAS 5" },
  { value: "emas_6", label: "Proton e.MAS 6" },
] as const;

export type ProtonModel = (typeof PROTON_MODELS)[number]["value"];

export const CUSTOMER_STATUSES = [
  { value: "new_lead", label: "New Lead" },
  { value: "follow_up", label: "Follow-up" },
  { value: "sold", label: "Sold" },
  { value: "not_interested", label: "Not Interested" },
] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number]["value"];

export const FOLLOW_UP_PRESETS = [
  { value: "none", label: "No Follow-up", days: null },
  { value: "1", label: "Tomorrow", days: 1 },
  { value: "3", label: "3 Days", days: 3 },
  { value: "5", label: "5 Days", days: 5 },
  { value: "7", label: "7 Days", days: 7 },
  { value: "14", label: "14 Days", days: 14 },
  { value: "custom", label: "Custom Date", days: null },
] as const;

export type FollowUpPreset = (typeof FOLLOW_UP_PRESETS)[number]["value"];

export const INSURANCE_FILTERS = [
  { value: "due_30", label: "Renewal Due Within 30 Days" },
  { value: "due_14", label: "Renewal Due Within 14 Days" },
  { value: "due_7", label: "Renewal Due Within 7 Days" },
  { value: "today", label: "Expiring Today" },
  { value: "overdue", label: "Overdue" },
] as const;

export type InsuranceFilter = (typeof INSURANCE_FILTERS)[number]["value"];
