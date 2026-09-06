import { FollowUpCard } from "@/components/customers/follow-up-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getFollowUpLists } from "@/lib/queries";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const lists = await getFollowUpLists();
  const current = tab === "overdue" || tab === "upcoming" ? tab : "today";
  const tabs = [
    { id: "today", label: "Today's Follow-up", count: lists.today.length, items: lists.today, tone: "today" as const },
    { id: "overdue", label: "Overdue Follow-up", count: lists.overdue.length, items: lists.overdue, tone: "overdue" as const },
    { id: "upcoming", label: "Upcoming Follow-up", count: lists.upcoming.length, items: lists.upcoming, tone: "upcoming" as const },
  ];
  const active = tabs.find((item) => item.id === current) ?? tabs[0];

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-bold">Follow-ups</h1>
        <p className="text-sm text-muted-foreground">Active customers scheduled in Malaysia time.</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((item) => (
          <Link
            key={item.id}
            href={`/follow-ups?tab=${item.id}`}
            className={cn(
              "min-h-16 rounded-2xl border px-3 py-3 text-center",
              current === item.id ? "border-primary bg-primary text-primary-foreground" : "bg-card",
            )}
          >
            <p className="text-lg font-bold">{item.count}</p>
            <p className="text-[11px] font-semibold leading-4 sm:text-sm">{item.label}</p>
          </Link>
        ))}
      </div>
      {active.items.length === 0 ? (
        <EmptyState title={`No ${active.label.toLowerCase()}`} description="Nothing waiting in this list." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {active.items.map((customer) => (
            <FollowUpCard key={customer.id} customer={customer} tone={active.tone} />
          ))}
        </div>
      )}
    </div>
  );
}
