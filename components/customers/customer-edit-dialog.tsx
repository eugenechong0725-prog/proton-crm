"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { CustomerEditForm } from "@/components/customers/customer-edit-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Customer } from "@/lib/types";

export function CustomerEditDialog({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 min-h-9 shrink-0"
          aria-label={`Edit ${customer.name}`}
          title="Edit customer"
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {customer.name}</DialogTitle>
          <DialogDescription>Update customer details, interest level, or status.</DialogDescription>
        </DialogHeader>
        <CustomerEditForm customer={customer} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
