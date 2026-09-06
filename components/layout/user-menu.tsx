"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant={compact ? "ghost" : "outline"} className={compact ? "text-sidebar-foreground hover:bg-white/10 hover:text-white" : ""}>
        <LogOut />
        Log out
      </Button>
    </form>
  );
}
