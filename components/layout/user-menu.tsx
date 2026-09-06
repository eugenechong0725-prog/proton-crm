"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { navigateTo } from "@/lib/client-nav";
import { Button } from "@/components/ui/button";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    await logoutAction();
    navigateTo("/login");
  }

  return (
    <Button
      type="button"
      variant={compact ? "ghost" : "outline"}
      className={compact ? "text-sidebar-foreground hover:bg-white/10 hover:text-white" : ""}
      onClick={onLogout}
      disabled={pending}
    >
      <LogOut />
      {pending ? "Signing out..." : "Log out"}
    </Button>
  );
}
