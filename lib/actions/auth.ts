"use server";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Enter your email and password." };
  }

  const { isDemo, clearDemoCookie } = await import("@/lib/demo/session");
  if (await isDemo()) {
    await clearDemoCookie();
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (/confirm/i.test(error.message)) {
      return { ok: false, error: "Email is not confirmed yet. Turn off Confirm email in Supabase Auth, then try again." };
    }
    return { ok: false, error: error.message || "Invalid email or password." };
  }

  return { ok: true };
}

export async function signupAction(formData: FormData): Promise<ActionResult> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { ok: false, error: "Name, email, and password are required." };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const { isDemo, clearDemoCookie } = await import("@/lib/demo/session");
  if (await isDemo()) {
    await clearDemoCookie();
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data.session) {
    return {
      ok: false,
      error: "Account created. Turn off Confirm email in Supabase Auth, then sign in.",
    };
  }

  return { ok: true };
}

export async function logoutAction(): Promise<ActionResult> {
  const { isDemo, clearDemoCookie } = await import("@/lib/demo/session");
  if (await isDemo()) {
    await clearDemoCookie();
    return { ok: true };
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return { ok: true };
}
