"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { onClientSubmit } from "@/lib/client-nav";
import {
  CUSTOMER_STATUSES,
  INTEREST_LEVELS,
  PROTON_MODELS,
  type CustomerStatus,
  type FollowUpPreset,
  type ProtonModel,
} from "@/lib/constants";
import { createCustomerAction } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Field, NativeSelect } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FollowUpPicker } from "@/components/shared/follow-up-picker";
import { SoldFields } from "@/components/customers/sold-fields";

export function CustomerForm() {
  const router = useRouter();
  const [status, setStatus] = useState<CustomerStatus>("new_lead");
  const [model, setModel] = useState<ProtonModel | "">("");
  const [preset, setPreset] = useState<FollowUpPreset>("none");
  const [customDate, setCustomDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await createCustomerAction(formData);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.success("Customer saved successfully.");
    router.push(result.id ? `/customers/${result.id}` : "/customers");
  }

  return (
    <form onSubmit={onClientSubmit(onSubmit)} className="grid gap-5">
      <Field>
        <Label htmlFor="name">Customer Name</Label>
        <Input id="name" name="name" autoComplete="name" required placeholder="John Tan" />
      </Field>
      <Field>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="0162246868"
        />
      </Field>
      <Field>
        <Label htmlFor="proton_model">Proton Model</Label>
        <NativeSelect
          id="proton_model"
          name="proton_model"
          value={model}
          onChange={(event) => setModel(event.target.value as ProtonModel)}
          required
        >
          <option value="" disabled>
            Select model
          </option>
          {PROTON_MODELS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <Label htmlFor="interest_level">Interest Level</Label>
        <NativeSelect id="interest_level" name="interest_level" defaultValue="warm">
          {INTEREST_LEVELS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <Label htmlFor="customer_status">Customer Status</Label>
        <NativeSelect
          id="customer_status"
          name="customer_status"
          value={status}
          onChange={(event) => setStatus(event.target.value as CustomerStatus)}
        >
          {CUSTOMER_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </NativeSelect>
      </Field>

      {status === "sold" ? <SoldFields defaultModel={model} /> : (
        <FollowUpPicker
          preset={preset}
          customDate={customDate}
          onPresetChange={setPreset}
          onCustomDateChange={setCustomDate}
        />
      )}

      <Field>
        <Label htmlFor="remark">Remark</Label>
        <Textarea
          id="remark"
          name="remark"
          placeholder="Customer interested in X50 Premium, waiting for loan approval."
        />
      </Field>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving..." : "Save Customer"}
      </Button>
    </form>
  );
}
