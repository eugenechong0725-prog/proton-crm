import Link from "next/link";
import { FollowUpCard } from "@/components/customers/follow-up-card";
import { InsuranceCard } from "@/components/insurance/insurance-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/queries";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const insuranceTotal =
    data.insurance.counts.due_30 +
    data.insurance.counts.due_14 +
    data.insurance.counts.due_7 +
    data.insurance.counts.today +
    data.insurance.counts.overdue;

  const stats = [
    { label: "Today's Follow-up", value: data.followUps.today.length, href: "/follow-ups" },
    { label: "Overdue Follow-up", value: data.followUps.overdue.length, href: "/follow-ups?tab=overdue" },
    { label: "Insurance Renewals", value: insuranceTotal, href: "/insurance" },
    { label: "Total Customers", value: data.totalCustomers, href: "/customers" },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Malaysia time · today {data.today}</p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="min-h-[112px] p-4 transition-colors hover:border-primary/40">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold">{stat.value}</p>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Follow Up Today</h2>
          <Link href="/follow-ups" className="text-sm font-semibold text-primary">
            View all
          </Link>
        </div>
        {data.followUps.today.length === 0 ? (
          <EmptyState title="No follow-ups today" description="You are clear for today." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {data.followUps.today.slice(0, 4).map((customer) => (
              <FollowUpCard key={customer.id} customer={customer} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Insurance Renewal Alerts</h2>
          <Link href="/insurance" className="text-sm font-semibold text-primary">
            View all
          </Link>
        </div>
        {data.insurance.alerts.length === 0 ? (
          <EmptyState
            title="No insurance renewals due"
            description="Sold customers appear here when expiry is within 30 days or overdue."
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {data.insurance.alerts.slice(0, 4).map((alert) => (
              <InsuranceCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
