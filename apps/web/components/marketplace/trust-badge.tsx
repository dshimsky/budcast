import { BadgeCheck, CircleDollarSign, ShieldCheck, Sparkle, Star, UserCheck, type LucideIcon } from "lucide-react";
import type { TrustBadgeDescriptor, TrustBadgeId } from "@budcast/shared";
import { cn } from "../../lib/utils";

export type TrustBadgeSize = "full" | "micro";

export type TrustBadgeProps = {
  badge: TrustBadgeDescriptor;
  className?: string;
  size?: TrustBadgeSize;
};

const toneClasses: Record<TrustBadgeDescriptor["tone"], string> = {
  aqua: "border-[#8ee6cf]/28 bg-[#8ee6cf]/12 text-[#d9fff6] shadow-[0_12px_30px_rgba(142,230,207,0.08)]",
  blue: "border-[#9dc8ff]/28 bg-[#9dc8ff]/12 text-[#deebff] shadow-[0_12px_30px_rgba(157,200,255,0.08)]",
  gold: "border-[#d8b66a]/30 bg-[#d8b66a]/13 text-[#f2db9e] shadow-[0_12px_30px_rgba(216,182,106,0.1)]",
  lime: "border-[#b8ff3d]/30 bg-[#b8ff3d]/13 text-[#e7ff9a] shadow-[0_12px_30px_rgba(184,255,61,0.1)]",
  violet: "border-[#b9a8ff]/28 bg-[#b9a8ff]/12 text-[#e6e0ff] shadow-[0_12px_30px_rgba(185,168,255,0.08)]"
};

const microToneClasses: Record<TrustBadgeDescriptor["tone"], string> = {
  aqua: "border-[#8ee6cf]/36 bg-[#8ee6cf]/14 text-[#d9fff6]",
  blue: "border-[#9dc8ff]/36 bg-[#9dc8ff]/14 text-[#deebff]",
  gold: "border-[#d8b66a]/38 bg-[#d8b66a]/14 text-[#f2db9e]",
  lime: "border-[#b8ff3d]/38 bg-[#b8ff3d]/14 text-[#e7ff9a]",
  violet: "border-[#b9a8ff]/36 bg-[#b9a8ff]/14 text-[#e6e0ff]"
};

const badgeIcons: Record<TrustBadgeId, LucideIcon> = {
  campaign_ready: Sparkle,
  highly_rated: Star,
  payment_ready: CircleDollarSign,
  social_verified: BadgeCheck,
  verified_brand: ShieldCheck,
  verified_budtender: BadgeCheck,
  verified_creator: UserCheck
};

export function TrustBadge({ badge, className, size = "full" }: TrustBadgeProps) {
  const Icon = badgeIcons[badge.id];

  if (size === "micro") {
    return (
      <span
        aria-label={badge.label}
        className={cn(
        "inline-grid h-5 w-5 shrink-0 place-items-center rounded-full border align-[-3px] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]",
          microToneClasses[badge.tone],
          className
        )}
        title={badge.description}
      >
        <Icon className="h-3 w-3" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-black leading-none tracking-[-0.01em]",
        "bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]",
        toneClasses[badge.tone],
        className
      )}
      title={badge.description}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {badge.label}
    </span>
  );
}

export function TrustBadgeRow({
  badges,
  className,
  limit = 4
}: {
  badges: TrustBadgeDescriptor[];
  className?: string;
  limit?: number;
}) {
  if (!badges.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {badges.slice(0, limit).map((badge) => (
        <TrustBadge badge={badge} key={badge.id} />
      ))}
    </div>
  );
}
