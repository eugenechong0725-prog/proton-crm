"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { requestPasswordResetAction, updatePasswordAction } from "@/lib/actions/auth";
import { onClientSubmit } from "@/lib/client-nav";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function ForgotPasswordForm({ recoveryMode = false }: { recoveryMode?: boolean }) {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function requestReset(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await requestPasswordResetAction(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEmailSent(true);
  }

  async function updatePassword(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await updatePasswordAction(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Password updated successfully.");
    router.replace("/login");
  }

  if (recoveryMode) {
    return (
      <form onSubmit={onClientSubmit(updatePassword)} className="grid gap-4">
        <p className="text-sm text-muted-foreground">Your reset link is verified. Choose a new password.</p>
        <Field>
          <Label htmlFor="new-password">New Password</Label>
          <PasswordInput id="new-password" name="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field>
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <PasswordInput
            id="confirm-password"
            name="confirm_password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Updating..." : "Update password"}
        </Button>
      </form>
    );
  }

  if (emailSent) {
    return (
      <div className="grid gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Check your inbox. If the email is registered, a secure password reset link has been sent.
        </div>
        <Button type="button" variant="outline" onClick={() => setEmailSent(false)}>
          Send again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onClientSubmit(requestReset)} className="grid gap-4">
      <Field>
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@dealership.com"
        />
      </Field>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
