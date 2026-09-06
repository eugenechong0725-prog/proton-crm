"use server";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true; signedIn?: boolean } | { ok: false; error: string };

function readEmail(formData: FormData) {
  return String(formData.get("email") ?? "").trim().toLowerCase();
}

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

  return { ok: true, signedIn: Boolean(data.session) };
}

export async function requestPasswordResetAction(formData: FormData): Promise<ActionResult> {
  const email = readEmail(formData);
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const { isDemo, clearDemoCookie } = await import("@/lib/demo/session");
  if (await isDemo()) await clearDemoCookie();

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://proton-crm.vercel.app/auth/confirm?next=/forgot-password",
  });

  if (error) {
    if (/rate|seconds|too many/i.test(error.message)) {
      return { ok: false, error: "Please wait before requesting another reset email." };
    }
    return { ok: false, error: "Could not send the reset email. Please try again." };
  }

  // Supabase intentionally does not reveal whether the address is registered.
  return { ok: true };
}

export async function updatePasswordAction(formData: FormData): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { ok: false, error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Open a valid reset link before changing your password." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message || "Could not update password." };

  await supabase.auth.signOut();
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
