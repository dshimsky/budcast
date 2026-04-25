import * as React from "react";
import { cn } from "../../lib/utils";

export function Eyebrow({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-[11px] uppercase tracking-[0.3em] text-stone-500",
        className
      )}
      {...props}
    />
  );
}
