import * as React from "react";
import { cn } from "../../lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/[0.1] bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035)),rgba(3,3,3,0.86)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_24px_72px_rgba(0,0,0,0.38)] backdrop-blur-xl transition-[background,border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[#b8ff3d]/22 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.105),rgba(255,255,255,0.042)),rgba(3,3,3,0.9)]",
        className
      )}
      {...props}
    />
  );
}
