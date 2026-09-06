import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveButton } from "@/components/customers/archive-button";
import { CustomerEditForm } from "@/components/customers/customer-edit-form";
import { FollowedUpDialog } from "@/components/customers/followed-up-dialog";
import { SoldDialog } from "@/components/customers/sold-dialog";
import { RenewedDialog } from "@/components/insurance/renewed-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { InterestLevelBadge } from "@/components/shared/interest-level-badge";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayDate, formatDisplayDateTime, yearOfDate } from "@/lib/dates";
import { daysRemaining, insuranceWhatsAppMessage, remainingLabel } from "@/lib/insurance";
import { formatMalaysiaPhone } from "@/lib/phone";
import { getCustomer } from "@/lib/queries";
import { modelLabel } from "@/lib/utils";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { customer, followUps, insuranceHistory } = await getCustomer(id);

  if (!customer) notFound();

  const sold = customer.customer_status === "sold";
  const days = customer.insurance ? daysRemaining(customer.insurance.expiry_date) : null;
  const expiryDisplay = customer.insurance ? formatDisplayDate(customer.insurance.expiry_date) : "";

  return (
    <div className="grid gap-5">
      <div>
        <Link href="/customers" className="text-sm font-semibold text-primary">
          Back to customers
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {modelLabel(customer.proton_model)} · {formatMalaysiaPhone(customer.phone)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <InterestLevelBadge level={customer.interest_level} />
              <StatusBadge status={customer.customer_status} />
              {customer.archived_at ? <span className="text-sm font-semibold text-muted-foreground">Archived</span> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <WhatsAppButton
              phone={customer.phone}
              message={
                sold && customer.insurance
                  ? insuranceWhatsAppMessage({
                      customerName: customer.name,
                      modelLabel: modelLabel(customer.vehicles?.proton_model ?? customer.proton_model),
                      expiryDisplay,
                    })
                  : undefined
              }
            />
            <FollowedUpDialog customerId={customer.id} customerName={customer.name} />
            {!sold ? <SoldDialog customerId={customer.id} customerName={customer.name} model={customer.proton_model} /> : null}
            {sold ? <RenewedDialog customerId={customer.id} customerName={customer.name} /> : null}
            <ArchiveButton customerId={customer.id} archived={Boolean(customer.archived_at)} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer details</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerEditForm key={customer.updated_at} customer={customer} />
          </CardContent>
        </Card>

        {!sold ? (
          <Card>
            <CardHeader>
              <CardTitle>Follow-up</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>
                <span className="text-muted-foreground">Enabled: </span>
                {customer.follow_up_enabled ? "Yes" : "No"}
              </p>
              <p>
                <span className="text-muted-foreground">Next follow-up: </span>
                {formatDisplayDate(customer.next_follow_up_at)}
              </p>
              <p>
                <span className="text-muted-foreground">Latest remark: </span>
                {customer.latest_remark || "—"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                <p>Model: {modelLabel(customer.vehicles?.proton_model ?? customer.proton_model)}</p>
                <p>Registration Number: {customer.vehicles?.registration_number ?? "—"}</p>
                <p>Delivery Date: {formatDisplayDate(customer.vehicles?.delivery_date)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Insurance Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                <p>Insurance Company: {customer.insurance?.insurance_company || "—"}</p>
                <p>Policy Number: {customer.insurance?.policy_number || "—"}</p>
                <p>Insurance Start Date: {formatDisplayDate(customer.insurance?.start_date)}</p>
                <p>Insurance Expiry Date: {formatDisplayDate(customer.insurance?.expiry_date)}</p>
                <p className="font-semibold">Days Until Expiry: {days === null ? "—" : remainingLabel(days)}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Follow-up History</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {followUps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No follow-up remarks yet.</p>
          ) : (
            followUps.map((item) => (
              <div key={item.id} className="rounded-xl border px-4 py-3">
                <p className="text-sm font-semibold">{formatDisplayDateTime(item.followed_up_at)}</p>
                <p className="mt-1 text-sm leading-6">{item.remark}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Next follow-up: {formatDisplayDate(item.next_follow_up_at)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {sold ? (
        <Card>
          <CardHeader>
            <CardTitle>Insurance History</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {insuranceHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No insurance history yet.</p>
            ) : (
              insuranceHistory.map((item, index) => (
                <div key={item.id} className="rounded-xl border px-4 py-3">
                  <p className="text-lg font-bold">{yearOfDate(item.expiry_date) || yearOfDate(item.renewed_at)}</p>
                  {item.renewed_at ? <p className="mt-1 text-sm">Renewed: {formatDisplayDate(item.renewed_at)}</p> : null}
                  <p className="text-sm">Insurance: {item.insurance_company || "—"}</p>
                  <p className="text-sm">Expiry: {formatDisplayDate(item.expiry_date)}</p>
                  {item.remark ? <p className="mt-2 text-sm leading-6">Remark: {item.remark}</p> : null}
                  {index < insuranceHistory.length - 1 ? <div className="mt-3 border-t" /> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
