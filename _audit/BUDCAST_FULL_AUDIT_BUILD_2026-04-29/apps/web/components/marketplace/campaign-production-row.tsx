import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketplaceBadge } from "./marketplace-badge";

export type CampaignProductionRowProps = {
  actionHref: string;
  actionLabel: string;
  compensationLabel: string;
  contentLabel: string;
  metrics: string;
  statusLabel: string;
  title: string;
};

export function CampaignProductionRow({
  actionHref,
  actionLabel,
  compensationLabel,
  contentLabel,
  metrics,
  statusLabel,
  title
}: CampaignProductionRowProps) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-white/[0.035] p-4 transition duration-300 hover:border-white/14 hover:bg-white/[0.05]">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_0.8fr_0.8fr_0.9fr_auto] lg:items-center">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[#fbfbf7]">{title}</div>
          <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
            <MarketplaceBadge tone="status">{statusLabel}</MarketplaceBadge>
            <MarketplaceBadge tone="content">{contentLabel}</MarketplaceBadge>
            <MarketplaceBadge tone="money">{compensationLabel}</MarketplaceBadge>
            <MarketplaceBadge tone="neutral">{metrics}</MarketplaceBadge>
          </div>
        </div>
        <div className="hidden text-sm text-stone-300 lg:block">{statusLabel}</div>
        <div className="hidden text-sm text-stone-300 lg:block">{contentLabel}</div>
        <div className="hidden text-sm text-stone-300 lg:block">{metrics}</div>
        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <div className="hidden text-sm font-medium text-[#e7ff9a] lg:block">{compensationLabel}</div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-[#e7ff9a] transition hover:text-[#e7ff9a]"
            href={actionHref}
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
