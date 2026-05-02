"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { CalendarClock, FileCheck2, Image, ShieldCheck, Tags } from "lucide-react";
import type { ContentLibraryAssetRow, ContentLibraryUsageTerms } from "@budcast/shared";

type ContentLibraryPanelProps = {
  rows?: ContentLibraryAssetRow[];
  loading?: boolean;
  error?: unknown;
};

function formatDate(value: string | null) {
  if (!value) return "Perpetual";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date pending";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatUsageTerms(value: ContentLibraryUsageTerms) {
  if (!value) return "Standard repost rights";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Standard repost rights";

  const enabledTerms = Object.entries(value)
    .filter(([, termValue]) => termValue === true)
    .map(([key]) => key.replace(/_/g, " "));

  return enabledTerms.length ? enabledTerms.join(", ") : "Custom usage terms";
}

function uniqueLabels(rows: ContentLibraryAssetRow[], getValues: (row: ContentLibraryAssetRow) => string[]) {
  return Array.from(new Set(rows.flatMap(getValues).filter(Boolean))).slice(0, 5);
}

function FilterLabel({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 text-xs font-black text-[#d8ded1]">
      <span className="text-[10px] uppercase tracking-[0.18em] text-[#7d7068]">{label}</span>
      <span className="max-w-[160px] truncate text-[#fbfbf7]">{value}</span>
    </span>
  );
}

function MetadataLabel({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7d7068]">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-[#d8ded1]">{value}</div>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="border-y border-dashed border-white/[0.12] bg-white/[0.025] px-5 py-8 text-center text-sm font-semibold text-[#aeb5aa]">
      {children}
    </div>
  );
}

export function ContentLibraryPanel({ rows = [], loading = false, error }: ContentLibraryPanelProps) {
  const facets = useMemo(
    () => ({
      campaigns: uniqueLabels(rows, (row) => (row.campaign?.title ? [row.campaign.title] : [])),
      categories: uniqueLabels(rows, (row) => row.product_category_tags),
      creators: uniqueLabels(rows, (row) => (row.creator?.name ? [row.creator.name] : [])),
      markets: uniqueLabels(rows, (row) => row.market_tags),
      platforms: uniqueLabels(rows, (row) => row.platform_tags)
    }),
    [rows]
  );

  return (
    <section className="rounded-[32px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.058),rgba(255,255,255,0.026))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.34),0_1px_0_rgba(255,255,255,0.05)_inset]">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#e7ff9a]">
            <ShieldCheck className="h-4 w-4" />
            Rights vault
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#fbfbf7]">Approved content library</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c7ccc2]">
            Campaign assets cleared for brand reuse with creator, territory, platform, category, and expiration context.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5 border-y border-white/10 py-3 sm:flex lg:border-y-0 lg:py-0">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#aeb5aa]">Assets</div>
            <div className="mt-1 text-xl font-black text-[#fbfbf7]">{rows.length}</div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#aeb5aa]">Approved</div>
            <div className="mt-1 text-xl font-black text-[#e7ff9a]">
              {rows.filter((row) => row.approval_status === "approved").length}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 py-4">
        {facets.creators.slice(0, 2).map((value) => (
          <FilterLabel key={`creator-${value}`} label="Creator" value={value} />
        ))}
        {facets.campaigns.slice(0, 2).map((value) => (
          <FilterLabel key={`campaign-${value}`} label="Campaign" value={value} />
        ))}
        {facets.markets.slice(0, 3).map((value) => (
          <FilterLabel key={`market-${value}`} label="Market" value={value} />
        ))}
        {facets.categories.slice(0, 3).map((value) => (
          <FilterLabel key={`category-${value}`} label="Category" value={value} />
        ))}
        {facets.platforms.slice(0, 3).map((value) => (
          <FilterLabel key={`platform-${value}`} label="Platform" value={value} />
        ))}
        {!loading && !error && rows[0] ? (
          <>
            <FilterLabel label="Terms" value={formatUsageTerms(rows[0].usage_terms)} />
            <FilterLabel label="Expires" value={formatDate(rows[0].rights_expires_at)} />
          </>
        ) : null}
        {!loading && !error && rows.length === 0 ? <FilterLabel label="Status" value="No approved assets" /> : null}
      </div>

      <div className="mt-5">
        {loading ? <EmptyState>Loading approved campaign assets...</EmptyState> : null}
        {!loading && error ? <EmptyState>Content library assets could not be loaded.</EmptyState> : null}
        {!loading && !error && rows.length === 0 ? <EmptyState>No approved assets are in the vault yet.</EmptyState> : null}

        {!loading && !error
          ? rows.map((row) => {
              const creatorName = row.creator?.name ?? "Creator";
              const campaignTitle = row.campaign?.title ?? "Campaign";
              const usageTerms = formatUsageTerms(row.usage_terms);
              const rightsExpiration = formatDate(row.rights_expires_at);

              return (
                <article
                  className="grid gap-4 border-t border-white/10 py-4 transition duration-300 first:border-t-0 hover:bg-white/[0.025] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)_auto] lg:items-center"
                  key={row.id}
                >
                  <div className="flex min-w-0 gap-3">
                    <a
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-white/[0.08] bg-[#b8ff3d]/10 text-[#e7ff9a] transition hover:bg-[#b8ff3d]/16"
                      href={row.asset_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Image className="h-5 w-5" />
                    </a>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-[#fbfbf7]">{creatorName}</div>
                      <div className="mt-1 truncate text-sm font-semibold text-[#c7ccc2]">{campaignTitle}</div>
                      <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#7d7068]">
                        <FileCheck2 className="h-3.5 w-3.5 text-[#e7ff9a]" />
                        {row.asset_type}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-3">
                    <div className="flex min-w-0 items-center gap-2 text-sm text-[#d8ded1]">
                      <Tags className="h-4 w-4 shrink-0 text-[#7d7068]" />
                      <span className="truncate">
                        {[...row.market_tags, ...row.product_category_tags, ...row.platform_tags].join(" / ") ||
                          "No library tags"}
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <MetadataLabel label="Market" value={row.market_tags.join(", ") || "Unassigned"} />
                      <MetadataLabel label="Category" value={row.product_category_tags.join(", ") || "Unassigned"} />
                      <MetadataLabel label="Platform" value={row.platform_tags.join(", ") || "Unassigned"} />
                      <MetadataLabel label="Usage terms" value={usageTerms} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#b8ff3d]/10 px-3 text-xs font-black text-[#e7ff9a]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {row.approval_status}
                    </span>
                    <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 text-xs font-black text-[#d8ded1]">
                      <CalendarClock className="h-3.5 w-3.5 text-[#7d7068]" />
                      {rightsExpiration}
                    </span>
                  </div>
                </article>
              );
            })
          : null}
      </div>
    </section>
  );
}
