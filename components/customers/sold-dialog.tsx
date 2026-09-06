"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { onClientSubmit, refreshPage } from "@/lib/client-nav";
import { markSoldAction } from "@/lib/actions/customers";
import type { ProtonModel } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SoldFields } from "@/components/customers/sold-fields";

export function SoldDialog({
  customerId,
  customerName,
  model,
}: {
  customerId: string;
  customerName: string;
  model: ProtonModel;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await markSoldAction(formData);
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
        <Button variant="success">Mark as Sold</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark {customerName} as Sold</DialogTitle>
          <DialogDescription>
            Enter the official insurance expiry date. Do not estimate it from the sale date.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onClientSubmit(onSubmit)} className="grid gap-4">
          <input type="hidden" name="customer_id" value={customerId} />
          <SoldFields defaultModel={model} />
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <Button type="submit" variant="success" disabled={pending}>
            {pending ? "Saving..." : "Save Sold Record"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
