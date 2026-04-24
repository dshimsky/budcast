"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none will-change-transform",
  {
    variants: {
      variant: {
        primary:
          "sheen bg-gradient-to-r from-herb-700 via-herb-600 to-herb-700 text-white shadow-[0_16px_40px_rgba(67,87,48,0.28)] hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(67,87,48,0.34)]",
        secondary:
          "bg-white/78 text-surface-900 ring-1 ring-white/80 shadow-[0_10px_30px_rgba(33,27,20,0.08)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_44px_rgba(33,27,20,0.12)]",
        ghost:
          "bg-transparent text-surface-900 hover:-translate-y-0.5 hover:bg-white/65 hover:shadow-[0_12px_28px_rgba(33,27,20,0.08)]"
      },
      size: {
        md: "h-11 px-5",
        lg: "h-12 px-6"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
