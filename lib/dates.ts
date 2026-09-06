import { TIMEZONE } from "@/lib/constants";

const MS_PER_DAY = 86_400_000;

export function todayInKL(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

export function addDaysInKL(days: number, now: Date = new Date()): string {
  const today = todayInKL(now);
  const date = new Date(`${today}T00:00:00+08:00`);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

export function daysUntilInKL(dateStr: string, now: Date = new Date()): number {
  const today = new Date(`${todayInKL(now)}T00:00:00+08:00`);
  const target = new Date(`${dateStr}T00:00:00+08:00`);
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}

export function formatDisplayDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(`${dateStr}T00:00:00+08:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIMEZONE,
  }).format(date);
}

export function formatDisplayDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  }).format(new Date(iso));
}

export function yearOfDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return dateStr.slice(0, 4);
}

export function compareDateToToday(
  dateStr: string,
  now: Date = new Date(),
): "past" | "today" | "future" {
  const days = daysUntilInKL(dateStr, now);
  if (days < 0) return "past";
  if (days === 0) return "today";
  return "future";
}
