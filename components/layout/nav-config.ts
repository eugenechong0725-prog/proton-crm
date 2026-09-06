import { Car, LayoutDashboard, ShieldCheck, Users } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/follow-ups", label: "Follow-ups", icon: Car },
  { href: "/insurance", label: "Insurance", icon: ShieldCheck },
] as const;
