import * as React from "react";
import { cn } from "../../lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/75 bg-white/82 shadow-panel backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_100px_rgba(21,18,13,0.14)]",
        className
      )}
      {...props}
    />
  );
}
