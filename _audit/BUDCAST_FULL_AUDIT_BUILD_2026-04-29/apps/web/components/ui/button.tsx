"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full align-middle text-sm font-semibold leading-none tracking-[-0.01em] transition-[background,border-color,box-shadow,color,opacity,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8ff3d]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303] disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-45 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border border-[#b8ff3d]/42 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.045)),linear-gradient(180deg,rgba(184,255,61,0.92),rgba(184,255,61,0.72))] text-[#071007] shadow-[inset_0_1px_0_rgba(255,255,255,0.42),inset_0_-1px_0_rgba(0,0,0,0.18),0_18px_42px_rgba(184,255,61,0.16)] backdrop-blur-xl hover:border-[#e7ff9a]/58 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.06)),linear-gradient(180deg,rgba(215,255,114,0.95),rgba(184,255,61,0.78))] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.14),0_20px_48px_rgba(184,255,61,0.2)] active:translate-y-px active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.22),0_10px_22px_rgba(184,255,61,0.14)]",
        secondary:
          "border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.045))] text-[#f8f8f2] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_14px_34px_rgba(0,0,0,0.2)] backdrop-blur-xl hover:border-[#b8ff3d]/32 hover:bg-[linear-gradient(180deg,rgba(184,255,61,0.13),rgba(255,255,255,0.055))] hover:text-[#e7ff9a] active:translate-y-px active:bg-white/[0.065] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]",
        ghost:
          "border border-transparent bg-transparent text-[#e7ff9a]/84 hover:border-[#b8ff3d]/18 hover:bg-[#b8ff3d]/[0.08] hover:text-[#f8f8f2] active:translate-y-px active:bg-[#b8ff3d]/[0.12]"
      },
      size: {
        md: "h-11 min-h-11 px-5 py-0",
        lg: "h-12 min-h-12 px-6 py-0 text-[0.95rem]"
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
