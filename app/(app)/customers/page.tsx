import Link from "next/link";
import { Plus } from "lucide-react";
import { CustomerFilters } from "@/components/customers/customer-filters";
import { CustomerListCard } from "@/components/customers/customer-list-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { getCustomers } from "@/lib/queries";
import { readInsuranceFilter, readModelFilter, readStatusFilter } from "@/lib/validation";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; model?: string; status?: string; insurance?: string; archived?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const model = readModelFilter(params.model);
  const status = readStatusFilter(params.status);
  const insurance = readInsuranceFilter(params.insurance);
  const includeArchived = params.archived === "1";

  const customers = await getCustomers({ query, model, status, insurance, includeArchived });

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">{customers.length} in your list</p>
        </div>
        <Button asChild>
          <Link href="/customers/new">
            <Plus />
            Add Customer
          </Link>
        </Button>
      </div>

      <CustomerFilters
        query={query}
        model={model}
        status={status}
        insurance={insurance}
        includeArchived={includeArchived}
      />

      {customers.length === 0 ? (
        <EmptyState title="No customers found" description="Add a Proton lead to start follow-up." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {customers.map((customer) => (
            <CustomerListCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}
    </div>
  );
}
