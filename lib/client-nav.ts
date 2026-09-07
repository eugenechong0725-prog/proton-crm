"use client";

import { startTransition, type FormEvent } from "react";

export function refreshPage(router: { refresh: () => void }) {
  startTransition(() => {
    try {
      router.refresh();
    } catch {
      window.location.reload();
    }
  });
}

export function onClientSubmit(handler: (formData: FormData) => Promise<void>) {
  return async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handler(new FormData(event.currentTarget));
  };
}
