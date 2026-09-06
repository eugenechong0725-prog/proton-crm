import { Badge } from "@/components/ui/badge";
import type { CustomerStatus } from "@/lib/constants";
import { statusLabel } from "@/lib/utils";

const variants = {
  new_lead: "lead",
  follow_up: "follow",
  sold: "sold",
  not_interested: "lost",
} as const;

export function StatusBadge({ status }: { status: CustomerStatus }) {
  return <Badge variant={variants[status]}>{statusLabel(status)}</Badge>;
}
