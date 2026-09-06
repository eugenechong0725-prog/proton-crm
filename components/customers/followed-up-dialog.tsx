"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FollowUpPreset } from "@/lib/constants";
import { onClientSubmit, refreshPage } from "@/lib/client-nav";
import { recordFollowUpAction } from "@/lib/actions/customers";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FollowUpPicker } from "@/components/shared/follow-up-picker";

export function FollowedUpDialog({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<FollowUpPreset>("3");
  const [customDate, setCustomDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await recordFollowUpAction(formData);
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
        <Button className="flex-1">Followed Up</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Followed up {customerName}</DialogTitle>
          <DialogDescription>Add a new remark. Previous remarks stay in history.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onClientSubmit(onSubmit)} className="grid gap-4">
          <input type="hidden" name="customer_id" value={customerId} />
          <Field>
            <Label htmlFor={`remark-${customerId}`}>New Remark</Label>
            <Textarea
              id={`remark-${customerId}`}
              name="remark"
              required
              placeholder="Customer submitted documents today."
            />
          </Field>
          <FollowUpPicker
            preset={preset}
            customDate={customDate}
            onPresetChange={setPreset}
            onCustomDateChange={setCustomDate}
          />
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Follow-up"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
