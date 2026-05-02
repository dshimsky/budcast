import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  MobileDealTimeline,
  MobileMetricTile,
  MobileStatusPill,
  MobileTrustBadge
} from "../mobile-marketplace";

export type CampaignDropCardProps = {
  applyHref: string;
  applyLabel: string;
  brandAvatarUrl?: string | null;
  brandName: string;
  campaignImageUrl?: string | null;
  compensationLabel: string;
  compensationValue: string;
  contentTypeLabel: string;
  deadlineLabel: string;
  detailHref: string;
  locationLabel: string;
  platformLabel: string;
  slotsLabel: string;
  summary: string;
  title: string;
  urgencyLabel?: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function CampaignDropCard({
  applyHref,
  applyLabel,
  brandAvatarUrl,
  brandName,
  campaignImageUrl,
  compensationLabel,
  compensationValue,
  contentTypeLabel,
  deadlineLabel,
  detailHref,
  locationLabel,
  platformLabel,
  slotsLabel,
  summary,
  title,
  urgencyLabel
}: CampaignDropCardProps) {
  const primaryPlatform = platformLabel.split(/\s*[·•,]\s*/)[0] || platformLabel;

  return (
    <article className="creator-feed-reveal overflow-hidden rounded-[24px] border border-white/[0.08] bg-[linear-gradient(150deg,rgba(255,255,255,0.06),transparent_42%),#0c0f09] shadow-[0_2px_4px_rgba(0,0,0,0.2),0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-[10px]">
            <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[17px] border border-[#69d8d0]/[0.2] bg-[#69d8d0]/[0.08] text-xs font-black text-[#a7f5ef]">
              {brandAvatarUrl ? (
                <img alt="" className="h-full w-full object-cover" src={brandAvatarUrl} />
              ) : (
                getInitials(brandName) || "BC"
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-extrabold text-[#fbfbf7]">{brandName}</div>
              <div className="mt-[2px] truncate text-[11px] text-[#aeb5aa]">{locationLabel}</div>
            </div>
          </div>
          {urgencyLabel ? <MobileStatusPill tone="pending">{urgencyLabel}</MobileStatusPill> : null}
        </div>

        <Link className="group mt-[14px] block" href={detailHref}>
          <div className="relative h-40 overflow-hidden rounded-[22px] border border-white/[0.06] bg-[linear-gradient(160deg,#172611_0%,#0a0503_100%)]">
            {campaignImageUrl ? (
              <img
                alt="Campaign visual"
                className="h-full w-full object-cover opacity-80"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                src={campaignImageUrl}
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.75)_0%,transparent_55%)]" />
            <div className="absolute left-3 right-3 top-3 flex flex-wrap gap-2">
              <MobileStatusPill tone={compensationLabel.toLowerCase().includes("paid") ? "primary" : "premium"}>
                {compensationLabel}
              </MobileStatusPill>
              <MobileStatusPill tone="trust">{primaryPlatform}</MobileStatusPill>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
              <span className="text-[17px] font-black text-[#e7ff9a]">{compensationValue}</span>
              <span className="rounded-lg border border-white/[0.08] bg-black/45 px-2 py-1 text-[11px] font-bold text-white/74 backdrop-blur">
                {contentTypeLabel}
              </span>
            </div>
          </div>
          <h2 className="mt-[14px] text-lg font-black leading-[1.18] tracking-[-0.02em] text-[#fbfbf7] transition-colors duration-150 group-hover:text-[#e7ff9a]">
            {title}
          </h2>
        </Link>

        <p className="mt-2 text-[13px] leading-[1.6] text-[#c6b8ad]">{summary}</p>

        <div className="mt-[14px] grid grid-cols-3 gap-[6px]">
          <MobileMetricTile label="Deadline" tone="pending" value={deadlineLabel} />
          <MobileMetricTile label="Spots" tone="success" value={slotsLabel} />
          <MobileMetricTile label="Platform" tone="trust" value={primaryPlatform} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <MobileTrustBadge tone="trust">Payment protected</MobileTrustBadge>
          <MobileTrustBadge tone="success">Compliance fit</MobileTrustBadge>
          <MobileTrustBadge tone="premium">Usage rights set</MobileTrustBadge>
        </div>

        <div className="mt-3">
          <MobileDealTimeline
            currentIndex={1}
            steps={[
              { label: "Open", tone: "success" },
              { label: "Apply", tone: "primary" },
              { label: "Create", tone: "pending" },
              { label: "Review", tone: "trust" },
              { label: "Paid", tone: "success" }
            ]}
          />
        </div>

        <div className="mt-[14px] flex gap-2">
          <Link
            aria-label={`${applyLabel} for ${title}`}
            className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#b8ff3d] text-sm font-black text-[#071007] shadow-[0_14px_30px_rgba(184,255,61,0.2)] transition-all duration-150 hover:-translate-y-[1px] hover:bg-[#c8ff52]"
            href={applyHref}
          >
            {applyLabel}
          </Link>
          <Link
            aria-label={`View details for ${title}`}
            className="flex h-11 items-center gap-[6px] rounded-xl border border-white/[0.09] bg-transparent px-4 text-[13px] font-bold text-[#c6b8ad] transition-all duration-150 hover:border-[#b8ff3d]/20 hover:text-[#e7ff9a]"
            href={detailHref}
          >
            Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
