import { CUSTOMER_STATUSES, INSURANCE_FILTERS, PROTON_MODELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, NativeSelect } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerFilters({
  query,
  model,
  status,
  insurance,
  includeArchived,
}: {
  query: string;
  model: string;
  status: string;
  insurance: string;
  includeArchived: boolean;
}) {
  return (
    <form className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-2 xl:grid-cols-5">
      <Field className="xl:col-span-2">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          name="q"
          defaultValue={query}
          placeholder="Name, phone, or registration"
        />
      </Field>
      <Field>
        <Label htmlFor="model">Proton Model</Label>
        <NativeSelect id="model" name="model" defaultValue={model}>
          <option value="all">All</option>
          {PROTON_MODELS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label.replace("Proton ", "")}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <Label htmlFor="status">Customer Status</Label>
        <NativeSelect id="status" name="status" defaultValue={status}>
          <option value="all">All</option>
          {CUSTOMER_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <Label htmlFor="insurance">Insurance</Label>
        <NativeSelect id="insurance" name="insurance" defaultValue={insurance}>
          <option value="all">All</option>
          {INSURANCE_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <label className="flex min-h-12 items-center gap-2 text-sm font-medium xl:col-span-4">
        <input
          type="checkbox"
          name="archived"
          value="1"
          defaultChecked={includeArchived}
          className="size-4 accent-primary"
        />
        Show archived customers
      </label>
      <div className="flex items-end">
        <Button type="submit" className="w-full">
          Apply
        </Button>
      </div>
    </form>
  );
}
