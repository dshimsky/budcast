import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

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
  return (
    <article className="creator-feed-reveal overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0d0a08] shadow-[0_2px_4px_rgba(0,0,0,0.2),0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-[10px]">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-[#b8ff3d]/[0.15] bg-[#b8ff3d]/[0.08] text-xs font-black text-[#b8ff3d]">
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
          {urgencyLabel ? (
            <span className="shrink-0 rounded-full border border-[#ff6b4a]/[0.22] bg-[#ff6b4a]/[0.12] px-[10px] py-1 text-[10px] font-extrabold uppercase tracking-[0.10em] text-[#ff8f75]">
              {urgencyLabel}
            </span>
          ) : null}
        </div>

        <Link className="group mt-[14px] block" href={detailHref}>
          <div className="relative h-40 overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#1e2d12_0%,#0a0503_100%)]">
            {campaignImageUrl ? (
              <img
                alt="Campaign visual"
                className="h-full w-full object-cover opacity-70"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                src={campaignImageUrl}
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.75)_0%,transparent_55%)]" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="text-[15px] font-black text-[#b8ff3d]">{compensationValue}</span>
              <span className="rounded-md bg-black/40 px-2 py-[3px] text-[11px] font-bold text-white/70">
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
          <div className="rounded-[10px] border border-white/[0.07] bg-white/[0.03] p-[10px]">
            <div className="text-xs font-bold leading-tight text-[#fbfbf7]">{deadlineLabel}</div>
            <div className="mt-[2px] text-[10px] leading-tight text-[#aeb5aa]">Deadline</div>
          </div>
          <div className="rounded-[10px] border border-white/[0.07] bg-white/[0.03] p-[10px]">
            <div className="text-xs font-bold leading-tight text-[#fbfbf7]">{slotsLabel}</div>
            <div className="mt-[2px] text-[10px] leading-tight text-[#aeb5aa]">Spots</div>
          </div>
          <div className="rounded-[10px] border border-white/[0.07] bg-white/[0.03] p-[10px]">
            <div className="text-xs font-bold leading-tight text-[#fbfbf7]">
              {platformLabel.split(/\s*[·•,]\s*/)[0] || platformLabel}
            </div>
            <div className="mt-[2px] text-[10px] leading-tight text-[#aeb5aa]">Platform</div>
          </div>
        </div>

        <div className="mt-[14px] flex gap-2">
          <Link
            aria-label={`${applyLabel} for ${title}`}
            className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#b8ff3d] text-sm font-black text-[#071007] transition-all duration-150 hover:-translate-y-[1px] hover:bg-[#c8ff52]"
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
