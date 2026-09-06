import Link from "next/link";
import { FollowedUpDialog } from "@/components/customers/followed-up-dialog";
import { InterestLevelBadge } from "@/components/shared/interest-level-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Card } from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/dates";
import type { CustomerRecord } from "@/lib/types";
import { modelLabel } from "@/lib/utils";
import { formatMalaysiaPhone } from "@/lib/phone";

export function CustomerListCard({ customer }: { customer: CustomerRecord }) {
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
          {customer.vehicles?.registration_number ? (
            <p className="text-sm font-semibold">Plate: {customer.vehicles.registration_number}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1">
          <InterestLevelBadge level={customer.interest_level} />
          <StatusBadge status={customer.customer_status} />
          {customer.archived_at ? (
            <span className="text-xs font-semibold text-muted-foreground">Archived</span>
          ) : null}
        </div>
      </div>
      {customer.latest_remark ? (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">“{customer.latest_remark}”</p>
      ) : null}
      {customer.follow_up_enabled && customer.next_follow_up_at ? (
        <p className="mt-2 text-sm font-medium">Next follow-up: {formatDisplayDate(customer.next_follow_up_at)}</p>
      ) : null}
      <div className="mt-4 flex gap-2">
        <WhatsAppButton phone={customer.phone} className="flex-1" />
        <FollowedUpDialog customerId={customer.id} customerName={customer.name} />
      </div>
    </Card>
  );
}
