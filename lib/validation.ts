import {
  CUSTOMER_STATUSES,
  FOLLOW_UP_PRESETS,
  INSURANCE_FILTERS,
  INTEREST_LEVELS,
  PROTON_MODELS,
  type CustomerStatus,
  type FollowUpPreset,
  type InsuranceFilter,
  type InterestLevel,
  type ProtonModel,
} from "@/lib/constants";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FOLLOW_UP_VALUES = new Set(FOLLOW_UP_PRESETS.map((item) => item.value));
const MODEL_VALUES = new Set(PROTON_MODELS.map((item) => item.value));
const STATUS_VALUES = new Set(CUSTOMER_STATUSES.map((item) => item.value));
const INSURANCE_VALUES = new Set(INSURANCE_FILTERS.map((item) => item.value));
const INTEREST_LEVEL_VALUES = new Set(INTEREST_LEVELS.map((item) => item.value));

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidDateRange(startDate: string, expiryDate: string): boolean {
  return isIsoDate(startDate) && isIsoDate(expiryDate) && expiryDate >= startDate;
}

export function readFollowUpPreset(value: FormDataEntryValue | null): FollowUpPreset | null {
  const preset = String(value ?? "none") || "none";
  return FOLLOW_UP_VALUES.has(preset as FollowUpPreset) ? (preset as FollowUpPreset) : null;
}

export function readInterestLevel(value: FormDataEntryValue | null): InterestLevel | null {
  const level = String(value ?? "");
  return INTEREST_LEVEL_VALUES.has(level as InterestLevel) ? (level as InterestLevel) : null;
}

export function readModelFilter(value: string | undefined): ProtonModel | "all" {
  return value && MODEL_VALUES.has(value as ProtonModel) ? (value as ProtonModel) : "all";
}

export function readStatusFilter(value: string | undefined): CustomerStatus | "all" {
  return value && STATUS_VALUES.has(value as CustomerStatus) ? (value as CustomerStatus) : "all";
}

export function readInsuranceFilter(value: string | undefined): InsuranceFilter | "all" {
  return value && INSURANCE_VALUES.has(value as InsuranceFilter) ? (value as InsuranceFilter) : "all";
}
