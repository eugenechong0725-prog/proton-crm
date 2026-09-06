"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarLinks } from "@/components/layout/nav-links";
import { LogoutButton } from "@/components/layout/user-menu";
import { BrandMark } from "@/components/layout/brand-mark";

export function MobileMenu({ userName }: { userName: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-card lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left">
        <BrandMark light />
        <p className="mt-4 mb-6 text-sm text-sidebar-foreground/70">{userName}</p>
        <SidebarLinks />
        <div className="mt-auto pt-6">
          <LogoutButton compact />
        </div>
      </SheetContent>
    </Sheet>
  );
}
