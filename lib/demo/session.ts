import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { Profile } from "@/lib/types";

export const DEMO_COOKIE = "proton_demo";
export const DEMO_USER_ID = "demo-user";

export const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  full_name: "Demo Sales",
  email: "demo@proton-sales.local",
  created_at: "2026-01-15T02:00:00.000Z",
  updated_at: "2026-01-15T02:00:00.000Z",
};

export function isDemoRequest(request: NextRequest) {
  return Boolean(request.cookies.get(DEMO_COOKIE)?.value);
}

export async function getDemoSessionId() {
  const jar = await cookies();
  return jar.get(DEMO_COOKIE)?.value ?? null;
}

export async function isDemo() {
  return Boolean(await getDemoSessionId());
}

export async function clearDemoCookie() {
  const jar = await cookies();
  jar.delete(DEMO_COOKIE);
}
