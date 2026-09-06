import { daysUntilInKL } from "@/lib/dates";
import type { CustomerStatus, InsuranceFilter } from "@/lib/constants";

export type InsuranceStage =
  | "upcoming"
  | "reminder"
  | "urgent"
  | "today"
  | "overdue"
  | null;

export type InsuranceBucket = "due_30" | "due_14" | "due_7" | "today" | "overdue";

export function canShowInsurance(status: CustomerStatus, archivedAt?: string | null) {
  return status === "sold" && !archivedAt;
}

export function daysRemaining(expiryDate: string, now: Date = new Date()): number {
  return daysUntilInKL(expiryDate, now);
}

export function insuranceStage(expiryDate: string, now: Date = new Date()): InsuranceStage {
  const days = daysRemaining(expiryDate, now);

  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 7) return "urgent";
  if (days <= 14) return "reminder";
  if (days <= 30) return "upcoming";
  return null;
}

export function insuranceBucket(expiryDate: string, now: Date = new Date()): InsuranceBucket | null {
  const days = daysRemaining(expiryDate, now);

  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 7) return "due_7";
  if (days <= 14) return "due_14";
  if (days <= 30) return "due_30";
  return null;
}

export function matchesInsuranceFilter(
  expiryDate: string,
  filter: InsuranceFilter,
  now: Date = new Date(),
): boolean {
  const days = daysRemaining(expiryDate, now);

  switch (filter) {
    case "overdue":
      return days < 0;
    case "today":
      return days === 0;
    case "due_7":
      return days >= 1 && days <= 7;
    case "due_14":
      return days >= 1 && days <= 14;
    case "due_30":
      return days >= 1 && days <= 30;
    default:
      return false;
  }
}

export function insuranceStageLabel(stage: InsuranceStage): string {
  switch (stage) {
    case "upcoming":
      return "Upcoming Renewal";
    case "reminder":
      return "Renewal Reminder";
    case "urgent":
      return "Urgent Renewal";
    case "today":
      return "Expires Today";
    case "overdue":
      return "Overdue";
    default:
      return "";
  }
}

export function remainingLabel(days: number): string {
  if (days < 0) {
    const overdue = Math.abs(days);
    return overdue === 1 ? "1 day overdue" : `${overdue} days overdue`;
  }
  if (days === 0) return "Expires today";
  if (days === 1) return "1 day remaining";
  return `${days} days remaining`;
}

export function insuranceWhatsAppMessage(input: {
  customerName: string;
  modelLabel: string;
  expiryDisplay: string;
}): string {
  return [
    `Hi ${input.customerName}, your ${input.modelLabel} insurance is approaching renewal.`,
    "",
    `Your current insurance expires on ${input.expiryDisplay}.`,
    "",
    "Let me know if you would like me to help you with the renewal.",
  ].join("\n");
}
