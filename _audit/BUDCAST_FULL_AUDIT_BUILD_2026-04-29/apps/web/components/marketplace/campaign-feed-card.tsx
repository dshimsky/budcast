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
    <article className="group overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[#b8ff3d]/24 hover:bg-white/[0.052]">
      <div className="relative bg-[radial-gradient(circle_at_84%_0%,rgba(184,255,61,0.14),transparent_30%),linear-gradient(135deg,rgba(22,33,15,0.86),rgba(5,6,4,0.92)_68%)] p-5 md:p-6">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0b09] to-transparent" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
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

      <div className="p-5 pt-5 md:p-6">
        <Link className="group/title inline-block" href={detailHref}>
          <h3 className="font-display text-2xl leading-tight text-[#fbfbf7] transition group-hover/title:text-[#e7ff9a] md:text-3xl">
            {title}
          </h3>
        </Link>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">{summary}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <MarketplaceBadge tone="money">
            {compensationLabel}: {compensationValue}
          </MarketplaceBadge>
          <MarketplaceBadge tone="content">{contentTypeLabel}</MarketplaceBadge>
          <MarketplaceBadge tone="status">{platformLabel}</MarketplaceBadge>
        </div>

        <MetadataStrip className="mt-5" items={metadata} />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {applyHref ? (
            <Link
              aria-label={`${applyLabel} for ${title}`}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] px-4 py-2 text-sm font-black text-[#071007] shadow-[0_16px_40px_rgba(184,255,61,0.2),0_1px_0_rgba(255,255,255,0.25)_inset] transition hover:-translate-y-0.5 hover:brightness-110"
              href={applyHref}
            >
              {applyLabel}
            </Link>
          ) : null}
          <Link
            aria-label={`View details for ${title}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-black text-[#fbfbf7] transition hover:-translate-y-0.5 hover:border-[#b8ff3d]/24 hover:bg-[#b8ff3d]/10 hover:text-[#e7ff9a]"
            href={detailHref}
          >
            Details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
