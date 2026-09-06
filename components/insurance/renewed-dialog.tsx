"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { onClientSubmit, refreshPage } from "@/lib/client-nav";
import { renewInsuranceAction } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RenewedDialog({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await renewInsuranceAction(formData);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setOpen(false);
    refreshPage(router);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="success" className="flex-1">
          Renewed
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insurance renewed — {customerName}</DialogTitle>
          <DialogDescription>
            Enter the new official expiry date. Previous insurance history is kept.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onClientSubmit(onSubmit)} className="grid gap-4">
          <input type="hidden" name="customer_id" value={customerId} />
          <Field>
            <Label htmlFor={`renewal-date-${customerId}`}>Renewal Date</Label>
            <Input id={`renewal-date-${customerId}`} name="renewal_date" type="date" required />
          </Field>
          <Field>
            <Label htmlFor={`company-${customerId}`}>New Insurance Company</Label>
            <Input id={`company-${customerId}`} name="insurance_company" placeholder="Allianz" />
          </Field>
          <Field>
            <Label htmlFor={`policy-${customerId}`}>New Policy Number</Label>
            <Input id={`policy-${customerId}`} name="policy_number" />
          </Field>
          <Field>
            <Label htmlFor={`start-${customerId}`}>New Insurance Start Date</Label>
            <Input id={`start-${customerId}`} name="insurance_start_date" type="date" required />
          </Field>
          <Field>
            <Label htmlFor={`expiry-${customerId}`}>New Insurance Expiry Date</Label>
            <Input id={`expiry-${customerId}`} name="insurance_expiry_date" type="date" required />
          </Field>
          <Field>
            <Label htmlFor={`remark-${customerId}`}>Remark</Label>
            <Textarea
              id={`remark-${customerId}`}
              name="remark"
              placeholder="Customer renewed insurance with Allianz."
            />
          </Field>
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <Button type="submit" variant="success" disabled={pending}>
            {pending ? "Saving..." : "Save Renewal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
