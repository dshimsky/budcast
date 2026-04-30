import { MapPin } from "lucide-react";
import { getPrimaryTrustBadge, type Badge } from "@budcast/shared";
import { cn } from "../../lib/utils";
import { TrustBadge } from "./trust-badge";

export type CreatorIdentityRowProps = {
  avatarUrl?: string | null;
  badges?: Array<Badge | string> | null;
  className?: string;
  handle?: string | null;
  location?: string | null;
  name: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalizeHandle(handle?: string | null) {
  const normalized = handle?.trim();
  if (!normalized) return "handle not added";
  return normalized.startsWith("@") ? normalized : `@${normalized}`;
}

export function CreatorIdentityRow({ avatarUrl, badges, className, handle, location, name }: CreatorIdentityRowProps) {
  const primaryBadge = getPrimaryTrustBadge({ badges, profileType: "creator" });

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className="premium-icon-surface relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-black text-[#fbfbf7]">
        {avatarUrl ? (
          <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
        ) : (
          <span>{getInitials(name) || "C"}</span>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="truncate text-sm font-black text-[#fbfbf7]">{name}</div>
          {primaryBadge ? <TrustBadge badge={primaryBadge} size="micro" /> : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#aeb5aa]">
          <span className="truncate">{normalizeHandle(handle)}</span>
          {location ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#83766e]" />
              <span className="truncate">{location}</span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
