import { Globe2, MapPin } from "lucide-react";
import { getPrimaryTrustBadge, type Badge } from "@budcast/shared";
import { cn } from "../../lib/utils";
import { TrustBadge } from "./trust-badge";

export type BrandIdentityRowProps = {
  avatarUrl?: string | null;
  badges?: Array<Badge | string> | null;
  className?: string;
  location?: string | null;
  name: string;
  website?: string | null;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function BrandIdentityRow({ avatarUrl, badges, className, location, name, website }: BrandIdentityRowProps) {
  const primaryBadge = getPrimaryTrustBadge({ badges, profileType: "brand" });

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[17px] border border-white/[0.11] bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(184,255,61,0.08))] text-sm font-black text-[#fbfbf7] shadow-[0_14px_34px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.08)_inset]">
        {avatarUrl ? (
          <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
        ) : (
          <span>{getInitials(name) || "B"}</span>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="truncate text-sm font-black text-[#fbfbf7]">{name}</div>
          {primaryBadge ? <TrustBadge badge={primaryBadge} size="micro" /> : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#aeb5aa]">
          {location ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#83766e]" />
              <span className="truncate">{location}</span>
            </span>
          ) : null}
          {website ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 shrink-0 text-[#83766e]" />
              <span className="truncate">{website}</span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
