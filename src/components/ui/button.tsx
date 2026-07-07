"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-(--color-primary) text-white hover:bg-(--color-primary-hover) shadow-sm shadow-(--color-primary-muted)",
        secondary:
          "bg-(--color-bg-elevated) text-(--color-text-primary) border border-(--color-border-default) hover:bg-(--color-bg-overlay) hover:border-(--color-border-strong)",
        ghost:
          "text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-elevated)",
        destructive:
          "bg-(--color-error)/10 text-(--color-error) border border-(--color-error)/20 hover:bg-(--color-error)/20",
        outline:
          "border border-(--color-border-default) bg-transparent text-(--color-text-secondary) hover:text-(--color-text-primary) hover:border-(--color-border-strong) hover:bg-(--color-bg-elevated)",
        link: "text-(--color-primary) underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
