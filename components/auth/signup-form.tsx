"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signupAction } from "@/lib/actions/auth";
import { navigateTo, onClientSubmit } from "@/lib/client-nav";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await signupAction(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(
      result.signedIn
        ? "Account created successfully."
        : "Account created successfully. Sign in with your email and password.",
    );
    window.setTimeout(() => {
      navigateTo(result.signedIn ? "/dashboard" : "/login");
    }, 900);
  }

  return (
    <form onSubmit={onClientSubmit(onSubmit)} className="grid gap-4">
      <Field>
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" name="full_name" autoComplete="name" required />
      </Field>
      <Field>
        <Label htmlFor="email">Email / User ID</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field>
        <Label htmlFor="password">Password</Label>
        <PasswordInput id="password" name="password" autoComplete="new-password" required minLength={8} />
      </Field>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}
