import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandIdentityRow } from "./brand-identity-row";
import { MarketplaceBadge } from "./marketplace-badge";
import { MetadataStrip, type MetadataItem } from "./metadata-strip";
import type { Badge } from "@budcast/shared";

export type CampaignFeedCardProps = {
  applyHref?: string;
  applyLabel?: string;
  brandAvatarUrl?: string | null;
  brandLocation?: string | null;
  brandName: string;
  brandBadges?: Array<Badge | string> | null;
  brandWebsite?: string | null;
  compensationLabel: string;
  compensationValue: string;
  contentTypeLabel: string;
  detailHref: string;
  metadata: MetadataItem[];
  platformLabel: string;
  summary: string;
  title: string;
  urgencyLabel?: string;
};

export function CampaignFeedCard({
  applyHref,
  applyLabel = "Apply",
  brandAvatarUrl,
  brandLocation,
  brandName,
  brandBadges,
  brandWebsite,
  compensationLabel,
  compensationValue,
  contentTypeLabel,
  detailHref,
  metadata,
  platformLabel,
  summary,
  title,
  urgencyLabel
}: CampaignFeedCardProps) {
  return (
    <article className="group overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#0d0a08] shadow-[0_2px_4px_rgba(0,0,0,0.2),0_16px_48px_rgba(0,0,0,0.28)] transition-all duration-200 hover:-translate-y-[3px] hover:border-[#b8ff3d]/[0.18] hover:shadow-[0_4px_8px_rgba(0,0,0,0.24),0_24px_64px_rgba(0,0,0,0.36)]">
      <div className="border-b border-white/[0.06] bg-[linear-gradient(160deg,#16210f_0%,#060504_70%)] p-[18px] md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <BrandIdentityRow
            avatarUrl={brandAvatarUrl}
            badges={brandBadges}
            location={brandLocation}
            name={brandName}
            website={brandWebsite}
          />
          {urgencyLabel ? <MarketplaceBadge tone="urgent">{urgencyLabel}</MarketplaceBadge> : null}
        </div>
      </div>

      <div className="p-5">
        <Link className="group/title block" href={detailHref}>
          <h3 className="text-lg font-extrabold leading-[1.2] text-[#fbfbf7] transition-colors duration-150 group-hover/title:text-[#e7ff9a]">
            {title}
          </h3>
        </Link>
        <p className="mt-2 text-[13px] leading-[1.6] text-[#c6b8ad]">{summary}</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-[10px] border border-white/[0.07] bg-white/[0.03] p-[10px]">
            <div className="text-[13px] font-bold leading-tight text-[#e7ff9a]">{compensationValue}</div>
            <div className="mt-[2px] text-[11px] leading-tight text-[#aeb5aa]">{compensationLabel}</div>
          </div>
          <div className="rounded-[10px] border border-white/[0.07] bg-white/[0.03] p-[10px]">
            <div className="text-[13px] font-bold leading-tight text-[#fbfbf7]">{contentTypeLabel}</div>
            <div className="mt-[2px] text-[11px] leading-tight text-[#aeb5aa]">Content type</div>
          </div>
          <div className="rounded-[10px] border border-white/[0.07] bg-white/[0.03] p-[10px]">
            <div className="text-[13px] font-bold leading-tight text-[#fbfbf7]">
              {metadata.find(m => m.label.toLowerCase().includes('spot'))?.value || 'Open'}
            </div>
            <div className="mt-[2px] text-[11px] leading-tight text-[#aeb5aa]">Spots</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-[#aeb5aa]">
            {platformLabel} · {metadata.find(m => m.label.toLowerCase().includes('deadline'))?.value || 'Open'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {applyHref ? (
            <Link
              aria-label={`${applyLabel} for ${title}`}
              className="flex h-[38px] flex-1 items-center justify-center rounded-[10px] bg-[#b8ff3d] px-[18px] text-[13px] font-extrabold text-[#071007] transition-all duration-150 hover:-translate-y-[1px] hover:bg-[#c8ff52]"
              href={applyHref}
            >
              {applyLabel}
            </Link>
          ) : null}
          <Link
            aria-label={`View details for ${title}`}
            className="flex h-[38px] items-center gap-[6px] rounded-[10px] border border-white/[0.09] bg-transparent px-4 text-[13px] font-bold text-[#c6b8ad] transition-all duration-150 hover:border-[#b8ff3d]/20 hover:text-[#e7ff9a]"
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
