import Link from "next/link";
import { CustomerForm } from "@/components/customers/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto grid max-w-2xl gap-5">
      <div>
        <Link href="/customers" className="text-sm font-semibold text-primary">
          Back to customers
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Add Customer</h1>
        <p className="text-sm text-muted-foreground">Create a Proton lead or sold customer.</p>
      </div>
      <div className="rounded-2xl border bg-card p-5">
        <CustomerForm />
      </div>
    </div>
  );
}
