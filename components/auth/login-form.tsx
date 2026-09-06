"use client";

import { useState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { navigateTo, onClientSubmit } from "@/lib/client-nav";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await loginAction(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigateTo("/dashboard");
  }

  return (
    <form onSubmit={onClientSubmit(onSubmit)} className="grid gap-4">
      <Field>
        <Label htmlFor="email">Email / User ID</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@dealership.com" />
      </Field>
      <Field>
        <Label htmlFor="password">Password</Label>
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </Field>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
