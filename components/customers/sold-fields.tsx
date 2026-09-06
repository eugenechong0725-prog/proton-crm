"use client";

import { PROTON_MODELS, type ProtonModel } from "@/lib/constants";
import { Field, NativeSelect } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SoldFields({
  defaultModel,
}: {
  defaultModel?: ProtonModel | "";
}) {
  return (
    <div className="grid gap-4 rounded-2xl border border-primary/20 bg-secondary/60 p-4">
      <div>
        <p className="text-sm font-semibold text-primary">Vehicle & insurance</p>
        <p className="text-sm text-muted-foreground">
          Insurance expiry is the date used for renewal reminders.
        </p>
      </div>
      <Field>
        <Label htmlFor="vehicle_model">Vehicle Model</Label>
        <NativeSelect id="vehicle_model" name="vehicle_model" defaultValue={defaultModel || ""} required>
          <option value="" disabled>
            Select model
          </option>
          {PROTON_MODELS.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <Label htmlFor="registration_number">Car Registration Number</Label>
        <Input
          id="registration_number"
          name="registration_number"
          placeholder="QAB1234"
          autoCapitalize="characters"
          required
        />
      </Field>
      <Field>
        <Label htmlFor="delivery_date">Sale / Delivery Date</Label>
        <Input id="delivery_date" name="delivery_date" type="date" required />
      </Field>
      <Field>
        <Label htmlFor="insurance_company">Insurance Company (optional)</Label>
        <Input id="insurance_company" name="insurance_company" placeholder="Allianz" />
      </Field>
      <Field>
        <Label htmlFor="policy_number">Insurance Policy Number (optional)</Label>
        <Input id="policy_number" name="policy_number" />
      </Field>
      <Field>
        <Label htmlFor="insurance_start_date">Insurance Start Date</Label>
        <Input id="insurance_start_date" name="insurance_start_date" type="date" required />
      </Field>
      <Field>
        <Label htmlFor="insurance_expiry_date">Insurance Expiry Date</Label>
        <Input id="insurance_expiry_date" name="insurance_expiry_date" type="date" required />
      </Field>
    </div>
  );
}
