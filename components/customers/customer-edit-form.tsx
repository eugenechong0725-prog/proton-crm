"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CUSTOMER_STATUSES, INTEREST_LEVELS, PROTON_MODELS, type CustomerStatus } from "@/lib/constants";
import { onClientSubmit, refreshPage } from "@/lib/client-nav";
import { updateCustomerAction } from "@/lib/actions/customers";
import type { Customer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, NativeSelect } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerEditForm({ customer }: { customer: Customer }) {
  return (
    <CustomerEditFormFields
      key={`${customer.updated_at}:${customer.customer_status}`}
      customer={customer}
    />
  );
}

function CustomerEditFormFields({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<CustomerStatus>(customer.customer_status);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await updateCustomerAction(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    refreshPage(router);
  }

  return (
    <form onSubmit={onClientSubmit(onSubmit)} className="grid gap-4">
      <input type="hidden" name="id" value={customer.id} />
      <Field>
        <Label htmlFor="edit-name">Customer Name</Label>
        <Input id="edit-name" name="name" defaultValue={customer.name} required />
      </Field>
      <Field>
        <Label htmlFor="edit-phone">Phone Number</Label>
        <Input id="edit-phone" name="phone" type="tel" inputMode="tel" defaultValue={customer.phone} required />
      </Field>
      <Field>
        <Label htmlFor="edit-model">Proton Model</Label>
        <NativeSelect id="edit-model" name="proton_model" defaultValue={customer.proton_model}>
          {PROTON_MODELS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <Label htmlFor="edit-interest-level">Interest Level</Label>
        <NativeSelect id="edit-interest-level" name="interest_level" defaultValue={customer.interest_level}>
          {INTEREST_LEVELS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <Label htmlFor="edit-status">Customer Status</Label>
        <NativeSelect
          id="edit-status"
          name="customer_status"
          value={status}
          onChange={(event) => setStatus(event.target.value as CustomerStatus)}
        >
          {CUSTOMER_STATUSES.filter((item) =>
            customer.customer_status === "sold" ? item.value === "sold" : item.value !== "sold",
          ).map(
            (item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ),
          )}
        </NativeSelect>
      </Field>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Saving..." : "Save Details"}
      </Button>
    </form>
  );
}
