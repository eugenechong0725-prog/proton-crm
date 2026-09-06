import Link from "next/link";
import { FollowedUpDialog } from "@/components/customers/followed-up-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Card } from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/dates";
import type { Customer } from "@/lib/types";
import { modelLabel } from "@/lib/utils";
import { formatMalaysiaPhone } from "@/lib/phone";

export function FollowUpCard({
  customer,
  tone = "today",
}: {
  customer: Customer;
  tone?: "today" | "overdue" | "upcoming";
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/customers/${customer.id}`} className="text-lg font-semibold hover:underline">
            {customer.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            {modelLabel(customer.proton_model)} · {formatMalaysiaPhone(customer.phone)}
          </p>
        </div>
        <StatusBadge status={customer.customer_status} />
      </div>
      {customer.latest_remark ? (
        <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm leading-6">
          “{customer.latest_remark}”
        </p>
      ) : null}
      <p className={`mt-3 text-sm font-semibold ${tone === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>
        {tone === "overdue" ? "Overdue · " : tone === "upcoming" ? "Upcoming · " : "Today · "}
        {formatDisplayDate(customer.next_follow_up_at)}
      </p>
      <div className="mt-4 flex gap-2">
        <WhatsAppButton phone={customer.phone} className="flex-1" />
        <FollowedUpDialog customerId={customer.id} customerName={customer.name} />
      </div>
    </Card>
  );
}
