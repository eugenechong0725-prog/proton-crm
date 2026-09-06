import type { FollowUpPreset } from "@/lib/constants";
import { addDaysInKL } from "@/lib/dates";

export type FollowUpResolution = {
  enabled: boolean;
  nextFollowUpAt: string | null;
};

export function resolveFollowUp(
  preset: FollowUpPreset,
  customDate?: string | null,
  now: Date = new Date(),
): FollowUpResolution {
  if (preset === "none") {
    return { enabled: false, nextFollowUpAt: null };
  }

  if (preset === "custom") {
    const date = customDate?.trim() || null;
    return { enabled: Boolean(date), nextFollowUpAt: date };
  }

  const days = Number(preset);
  return {
    enabled: true,
    nextFollowUpAt: addDaysInKL(days, now),
  };
}

export type FollowUpBucket = "today" | "overdue" | "upcoming";

export function followUpBucket(
  nextFollowUpAt: string | null,
  enabled: boolean,
  now: Date = new Date(),
): FollowUpBucket | null {
  if (!enabled || !nextFollowUpAt) return null;

  const today = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
  if (nextFollowUpAt < today) return "overdue";
  if (nextFollowUpAt === today) return "today";
  return "upcoming";
}
