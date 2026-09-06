"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { refreshPage } from "@/lib/client-nav";
import { archiveCustomerAction } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";

export function ArchiveButton({
  customerId,
  archived,
}: {
  customerId: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    await archiveCustomerAction(customerId, !archived);
    setPending(false);
    refreshPage(router);
  }

  return (
    <Button type="button" variant="outline" onClick={onClick} disabled={pending}>
      {archived ? "Restore" : "Archive"}
    </Button>
  );
}
