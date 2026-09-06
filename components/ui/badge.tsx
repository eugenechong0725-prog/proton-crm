import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        sold: "bg-emerald-100 text-emerald-800",
        lead: "bg-sky-100 text-sky-800",
        follow: "bg-amber-100 text-amber-800",
        lost: "bg-slate-200 text-slate-700",
        overdue: "bg-red-100 text-red-800",
        urgent: "bg-orange-100 text-orange-800",
        today: "bg-blue-100 text-blue-800",
        upcoming: "bg-indigo-100 text-indigo-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
