import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { BrandMark } from "@/components/layout/brand-mark";
import { SetupScreen } from "@/components/setup-screen";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ recovery?: string }>;
}) {
  if (!hasSupabaseEnv()) return <SetupScreen />;
  const { recovery } = await searchParams;
  let recoveryMode = false;

  if (recovery === "1") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    recoveryMode = Boolean(user);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[linear-gradient(180deg,#0b1f3a_0%,#123a73_45%,#f3f5f8_45%)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-lg">
        <BrandMark />
        <h1 className="mt-6 text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {recoveryMode ? "Enter and confirm your new password." : "Use your email to receive a secure reset link."}
        </p>
        <div className="mt-6">
          <ForgotPasswordForm recoveryMode={recoveryMode} />
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
