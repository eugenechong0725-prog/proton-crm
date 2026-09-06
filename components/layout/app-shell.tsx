import type { ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { BottomNav, SidebarLinks } from "@/components/layout/nav-links";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { LogoutButton } from "@/components/layout/user-menu";

export function AppShell({
  userName,
  demo = false,
  children,
}: {
  userName: string;
  demo?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col bg-sidebar p-5 text-sidebar-foreground lg:flex">
        <BrandMark light />
        <div className="mt-8 flex-1">
          <SidebarLinks />
        </div>
        <div className="rounded-2xl bg-white/8 p-4">
          <p className="text-sm font-semibold">{userName}</p>
          <p className="mb-3 text-xs text-sidebar-foreground/65">Your customers only</p>
          <LogoutButton compact />
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <MobileMenu userName={userName} />
          <BrandMark />
          <div className="size-11" />
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-5 pb-28 lg:px-8 lg:py-8 lg:pb-10">
          {demo ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              Demo mode — sample Proton customers only. Sign out anytime to leave.
            </div>
          ) : null}
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
