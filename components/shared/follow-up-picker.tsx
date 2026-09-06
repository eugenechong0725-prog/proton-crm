"use client";

import { FOLLOW_UP_PRESETS, type FollowUpPreset } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FollowUpPicker({
  preset,
  customDate,
  onPresetChange,
  onCustomDateChange,
}: {
  preset: FollowUpPreset;
  customDate: string;
  onPresetChange: (value: FollowUpPreset) => void;
  onCustomDateChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3">
      <Label>Next Follow-up</Label>
      <input type="hidden" name="follow_up_preset" value={preset} />
      <input type="hidden" name="custom_follow_up_date" value={customDate} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FOLLOW_UP_PRESETS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPresetChange(option.value)}
            className={cn(
              "min-h-11 rounded-xl border px-3 text-sm font-semibold transition-colors",
              preset === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {preset === "custom" ? (
        <Field>
          <Label htmlFor="custom-date">Custom Date</Label>
          <Input
            id="custom-date"
            type="date"
            value={customDate}
            onChange={(event) => onCustomDateChange(event.target.value)}
            required
          />
        </Field>
      ) : null}
    </div>
  );
}
