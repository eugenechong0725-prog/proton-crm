import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getProfile } from "@/lib/queries";
import { isDemo } from "@/lib/demo/session";
import { hasSupabaseEnv } from "@/lib/supabase/server";
import { SetupScreen } from "@/components/setup-screen";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const demo = await isDemo();

  if (!demo && !hasSupabaseEnv()) {
    return <SetupScreen />;
  }

  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <AppShell demo={demo} userName={profile.full_name || profile.email || "Sales user"}>
      {children}
    </AppShell>
  );
}
