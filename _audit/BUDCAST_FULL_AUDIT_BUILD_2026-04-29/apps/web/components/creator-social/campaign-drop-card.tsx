import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";

export type CampaignDropCardProps = {
  applyHref: string;
  applyLabel: string;
  brandAvatarUrl?: string | null;
  brandName: string;
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
    <article className="creator-feed-reveal overflow-hidden rounded-[30px] border border-white/[0.075] bg-[#0d0a08] shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="premium-icon-surface grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-black text-[#e7ff9a]">
              {brandAvatarUrl ? (
                <img alt="" className="h-full w-full object-cover" src={brandAvatarUrl} />
              ) : (
                getInitials(brandName) || "BC"
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-[#fbfbf7]">{brandName}</div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#aeb5aa]">
                <MapPin className="h-3.5 w-3.5 text-[#b8ff3d]" />
                <span className="truncate">{locationLabel}</span>
              </div>
            </div>
          </div>
          {urgencyLabel ? (
            <span className="creator-drop-pulse rounded-full border border-[#b8ff3d]/24 bg-[#b8ff3d]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#e7ff9a]">
              {urgencyLabel}
            </span>
          ) : null}
        </div>

        <Link className="group mt-4 block" href={detailHref}>
          <div className="relative h-36 overflow-hidden rounded-[24px] border border-white/[0.075] bg-[linear-gradient(135deg,#2b120c,#0a0503_62%,#b8ff3d)]">
            <div className="absolute inset-4 rounded-[20px] border border-white/[0.075]" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[linear-gradient(135deg,#d7ff72,#b8ff3d)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#071007] shadow-[0_10px_28px_rgba(184,255,61,0.24)]">
                {compensationLabel}
              </span>
              <span className="rounded-full border border-white/14 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#fbfbf7]">
                {contentTypeLabel}
              </span>
            </div>
          </div>
          <h2 className="mt-4 text-[1.42rem] font-black leading-[1.14] tracking-[-0.025em] text-[#fbfbf7] transition group-hover:text-[#e7ff9a]">
            {title}
          </h2>
        </Link>

        <p className="mt-3 text-sm font-medium leading-6 text-[#c6b8ad]">{summary}</p>

        <div className="mt-4 grid grid-cols-2 gap-2.5 text-[11px] font-bold text-[#aeb5aa]">
          <div className="rounded-[18px] border border-white/8 bg-white/[0.035] p-3">
            <span className="line-clamp-2 block leading-4 text-[#fbfbf7]">{compensationValue}</span>
            <span className="mt-1 block">Compensation</span>
          </div>
          <div className="rounded-[18px] border border-white/8 bg-white/[0.035] p-3">
            <span className="line-clamp-2 block leading-4 text-[#fbfbf7]">{platformLabel}</span>
            <span className="mt-1 block">Platform</span>
          </div>
          <div className="rounded-[18px] border border-white/8 bg-white/[0.035] p-3">
            <span className="line-clamp-2 block leading-4 text-[#fbfbf7]">{deadlineLabel}</span>
            <span className="mt-1 block">Deadline</span>
          </div>
          <div className="rounded-[18px] border border-white/8 bg-white/[0.035] p-3">
            <span className="line-clamp-2 block leading-4 text-[#fbfbf7]">{slotsLabel}</span>
            <span className="mt-1 block">Creator spots</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex min-w-0 items-center gap-2 text-[11px] font-bold text-[#e7ff9a]">
            <MessageCircle className="h-4 w-4" />
            <span className="min-w-0">Messages open after acceptance</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              aria-label={`${applyLabel} for ${title}`}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#d7ff72,#b8ff3d_62%,#b93c28)] px-4 py-2 text-sm font-black text-[#071007] shadow-[0_16px_42px_rgba(184,255,61,0.24),0_1px_0_rgba(255,255,255,0.22)_inset] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
              href={applyHref}
            >
              {applyLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
