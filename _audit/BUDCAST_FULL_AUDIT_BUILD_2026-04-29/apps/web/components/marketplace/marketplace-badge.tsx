import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export type MarketplaceBadgeTone = "money" | "content" | "status" | "urgent" | "neutral";

const toneClasses: Record<MarketplaceBadgeTone, string> = {
  money: "border-[#b8ff3d]/20 bg-[#b8ff3d]/12 text-[#e7ff9a] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  content: "border-white/[0.07] bg-white/[0.045] text-[#d8ded1]",
  status: "border-[#c8f060]/18 bg-[#c8f060]/10 text-[#dff7a8]",
  urgent: "border-[#d7ff72]/22 bg-[#d7ff72]/11 text-[#e7ff9a]",
  neutral: "border-white/[0.07] bg-white/[0.035] text-[#c7ccc2]"
};

export type MarketplaceBadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: MarketplaceBadgeTone;
};

export function MarketplaceBadge({ children, className, tone = "neutral" }: MarketplaceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[14px] border px-2.5 py-1.5 text-[11px] font-bold leading-none tracking-[-0.01em]",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
