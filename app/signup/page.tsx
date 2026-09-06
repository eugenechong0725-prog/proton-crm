import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { SignupForm } from "@/components/auth/signup-form";
import { hasSupabaseEnv } from "@/lib/supabase/server";
import { SetupScreen } from "@/components/setup-screen";

export default function SignupPage() {
  if (!hasSupabaseEnv()) {
    return <SetupScreen />;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[linear-gradient(180deg,#0b1f3a_0%,#123a73_45%,#f3f5f8_45%)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-lg">
        <BrandMark />
        <h1 className="mt-6 text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">For Proton sales users only.</p>
        <div className="mt-6">
          <SignupForm />
        </div>
        <a
          href="/demo"
          className="mt-3 flex h-12 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold hover:bg-muted"
        >
          Open demo
        </a>
        <p className="mt-5 text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
