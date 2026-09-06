import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CUSTOMER_STATUSES, PROTON_MODELS, type CustomerStatus, type ProtonModel } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function modelLabel(model: ProtonModel | string): string {
  return PROTON_MODELS.find((item) => item.value === model)?.label ?? model;
}

export function statusLabel(status: CustomerStatus | string): string {
  return CUSTOMER_STATUSES.find((item) => item.value === status)?.label ?? status;
}
