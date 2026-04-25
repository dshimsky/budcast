import * as React from "react";
import { cn } from "../../lib/utils";

export function LacquerSurface({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(19,21,19,0.92),rgba(11,12,11,0.92))] shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}

export function SmokedPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/8 bg-white/[0.04] shadow-[0_18px_40px_rgba(0,0,0,0.22)]",
        className
      )}
      {...props}
    />
  );
}
