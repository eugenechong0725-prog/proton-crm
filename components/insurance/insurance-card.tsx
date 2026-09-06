import Link from "next/link";
import { RenewedDialog } from "@/components/insurance/renewed-dialog";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/dates";
import {
  insuranceStage,
  insuranceStageLabel,
  insuranceWhatsAppMessage,
  remainingLabel,
  daysRemaining,
} from "@/lib/insurance";
import type { InsuranceAlert } from "@/lib/types";
import { modelLabel } from "@/lib/utils";
import { formatMalaysiaPhone } from "@/lib/phone";

const stageBadge = {
  upcoming: "upcoming",
  reminder: "today",
  urgent: "urgent",
  today: "today",
  overdue: "overdue",
} as const;

export function InsuranceCard({ alert }: { alert: InsuranceAlert }) {
  const days = daysRemaining(alert.insurance.expiry_date);
  const stage = insuranceStage(alert.insurance.expiry_date);
  const model = modelLabel(alert.vehicles.proton_model);
  const expiry = formatDisplayDate(alert.insurance.expiry_date);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/customers/${alert.id}`} className="text-lg font-semibold hover:underline">
            {alert.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{model}</p>
          <p className="text-sm font-semibold">Plate: {alert.vehicles.registration_number}</p>
        </div>
        {stage ? <Badge variant={stageBadge[stage]}>{insuranceStageLabel(stage)}</Badge> : null}
      </div>
      <div className="mt-4 rounded-xl bg-muted px-3 py-3">
        <p className="text-sm text-muted-foreground">Insurance Expiry</p>
        <p className="text-base font-semibold">{expiry}</p>
        <p className={`mt-1 text-sm font-semibold ${days < 0 ? "text-destructive" : days <= 7 ? "text-urgent" : "text-primary"}`}>
          {remainingLabel(days)}
        </p>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Phone: {formatMalaysiaPhone(alert.phone)}</p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <WhatsAppButton
          phone={alert.phone}
          message={insuranceWhatsAppMessage({
            customerName: alert.name,
            modelLabel: model,
            expiryDisplay: expiry,
          })}
        />
        <Button asChild variant="outline">
          <Link href={`/customers/${alert.id}`}>View Customer</Link>
        </Button>
        <RenewedDialog customerId={alert.id} customerName={alert.name} />
      </div>
    </Card>
  );
}
