import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default:   "bg-(--color-primary-muted) text-(--color-primary-hover) border border-(--color-primary)/20",
        secondary: "bg-(--color-bg-overlay) text-(--color-text-secondary) border border-(--color-border-default)",
        success:   "bg-(--color-success)/10 text-(--color-success) border border-(--color-success)/20",
        warning:   "bg-(--color-warning)/10 text-(--color-warning) border border-(--color-warning)/20",
        error:     "bg-(--color-error)/10 text-(--color-error) border border-(--color-error)/20",
        info:      "bg-(--color-info)/10 text-(--color-info) border border-(--color-info)/20",
        outline:   "border border-(--color-border-strong) text-(--color-text-secondary) bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
