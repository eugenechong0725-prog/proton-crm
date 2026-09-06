import Link from "next/link";
import { InsuranceCard } from "@/components/insurance/insurance-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import type { InsuranceFilter } from "@/lib/constants";
import { matchesInsuranceFilter } from "@/lib/insurance";
import { getInsuranceAlerts } from "@/lib/queries";
import { cn } from "@/lib/utils";

const FILTERS: { id: "all" | InsuranceFilter; label: string; key?: "due_30" | "due_14" | "due_7" | "today" | "overdue" }[] = [
  { id: "all", label: "All alerts" },
  { id: "due_30", label: "Due in 30 Days", key: "due_30" },
  { id: "due_14", label: "Due in 14 Days", key: "due_14" },
  { id: "due_7", label: "Due in 7 Days", key: "due_7" },
  { id: "today", label: "Due Today", key: "today" },
  { id: "overdue", label: "Overdue", key: "overdue" },
];

export default async function InsurancePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const current = FILTERS.some((item) => item.id === filter) ? (filter as "all" | InsuranceFilter) : "all";
  const { counts, alerts } = await getInsuranceAlerts();

  const visible =
    current === "all"
      ? alerts
      : alerts.filter((alert) => matchesInsuranceFilter(alert.insurance.expiry_date, current));

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-bold">Insurance Renewal</h1>
        <p className="text-sm text-muted-foreground">Only sold customers. Reminders use the official expiry date.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {FILTERS.filter((item) => item.key).map((item) => (
          <Link key={item.id} href={`/insurance?filter=${item.id}`}>
            <Card className={cn("p-4", current === item.id && "border-primary")}>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-3xl font-bold">{counts[item.key!]}</p>
            </Card>
          </Link>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Link
            key={item.id}
            href={item.id === "all" ? "/insurance" : `/insurance?filter=${item.id}`}
            className={cn(
              "min-h-10 rounded-full border px-3 text-sm font-semibold leading-10",
              current === item.id ? "border-primary bg-primary text-primary-foreground" : "bg-card",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No sold customers in this reminder stage"
          description="Non-sold leads never appear here."
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visible.map((alert) => (
            <InsuranceCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
