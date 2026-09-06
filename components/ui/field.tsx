import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("grid gap-2", className)}>{children}</div>;
}

export function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-12 w-full appearance-none rounded-xl border border-input bg-card px-3.5 text-base text-foreground shadow-sm focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
