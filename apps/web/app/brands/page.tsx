"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Eye, ShieldCheck } from "lucide-react";
import { formatCompact, useBrands } from "@budcast/shared";
import { PublicMarketplaceHeader, PublicSearchBar } from "../../components/public-marketplace-entry";
import { MarketplaceBadge, MetadataStrip } from "../../components/marketplace";

function formatPercent(value?: number | null) {
  if (value == null) return "Pending";
  return `${Math.round(value)}%`;
}

function formatRating(score?: number | null, count?: number | null) {
  if (score == null) return "No reviews yet";
  return `${score.toFixed(1)} · ${formatCompact(count ?? 0)} reviews`;
}

export default function BrandsPage() {
  const brands = useBrands();
  const rows = brands.data ?? [];

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-10 pt-3 text-[#fbfbf7] md:px-8 md:pt-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <PublicMarketplaceHeader accountHref="/creator-dashboard" accountLabel="Creator app" signedIn />

        <section className="rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_18%_8%,rgba(184,255,61,0.16),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.48),0_1px_0_rgba(255,255,255,0.08)_inset] md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="inline-flex rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
                Brand discovery
              </div>
              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-7xl">
                Cannabis brands running creator campaigns.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
                Explore public brand profiles, active campaign history, creator trust signals, and the brands
                creators can work with on BudCast.
              </p>
            </div>
            <div className="grid gap-3">
              <PublicSearchBar />
              <div className="rounded-[24px] border border-white/10 bg-[#101010]/80 p-4">
                <div className="text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                  {brands.isLoading ? "..." : formatCompact(rows.length)}
                </div>
                <div className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#aeb5aa]">
                  Active brand profiles
                </div>
              </div>
            </div>
          </div>
        </section>

        {brands.isLoading ? (
          <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8 text-center">
            <p className="text-lg font-black text-[#fbfbf7]">Loading brand profiles...</p>
            <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
              BudCast is pulling public brand profiles and active campaign signals.
            </p>
          </section>
        ) : brands.isError ? (
          <section className="rounded-[34px] border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 p-8 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-[#e7ff9a]" />
            <p className="mt-4 text-lg font-black text-[#fbfbf7]">Brand directory could not be loaded.</p>
            <p className="mt-2 text-sm leading-6 text-[#d8ded1]">
              Refresh or return to the campaign feed while BudCast reconnects to brand profiles.
            </p>
          </section>
        ) : rows.length === 0 ? (
          <section className="rounded-[34px] border border-dashed border-white/12 bg-white/[0.025] p-8 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-[#e7ff9a]" />
            <p className="mt-4 text-lg font-black text-[#fbfbf7]">No brands are available yet.</p>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((brand) => {
              const displayName = brand.company_name || brand.name || "Cannabis brand";
              const initials = getInitials(displayName);
              return (
                <article
                  className="group flex min-h-full flex-col overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.024))] shadow-[0_22px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[#b8ff3d]/28 hover:bg-white/[0.055]"
                  key={brand.id}
                >
                  <div className="relative min-h-28 bg-[radial-gradient(circle_at_80%_8%,rgba(184,255,61,0.2),transparent_34%),linear-gradient(135deg,#16210f,#050604_68%)] p-5">
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#070807] to-transparent" />
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-[22px] border border-white/[0.12] bg-black/45 text-lg font-black text-[#fbfbf7] shadow-[0_16px_45px_rgba(0,0,0,0.34)]">
                        {brand.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt="" className="h-full w-full object-cover" src={brand.avatar_url} />
                        ) : (
                          initials
                        )}
                      </div>
                      <MarketplaceBadge tone="status">
                        <BadgeCheck className="mr-1 h-3 w-3" />
                        Active
                      </MarketplaceBadge>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="min-w-0">
                      <h2 className="truncate text-2xl font-black tracking-[-0.045em] text-[#fbfbf7]">{displayName}</h2>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm font-bold text-[#c7ccc2]">
                        <span>{brand.website ?? "Website pending"}</span>
                        <span>{brand.location ?? "Location pending"}</span>
                      </div>
                    </div>

                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-[#d8ded1]">
                      {brand.bio || "Brand profile details are being built out."}
                    </p>

                    <MetadataStrip
                      className="mt-5 grid-cols-3"
                      items={[
                        { label: "Completed", value: formatCompact(brand.successful_campaigns) },
                        { label: "Reviews", value: formatRating(brand.review_score, brand.review_count) },
                        { label: "Payment", value: formatPercent(brand.payment_rate) }
                      ]}
                    />

                    <div className="mt-5 flex flex-wrap gap-2">
                      <MarketplaceBadge tone="neutral">{formatCompact(brand.total_campaigns)} campaigns</MarketplaceBadge>
                      <MarketplaceBadge tone="content">
                        <Eye className="mr-1 h-3 w-3" />
                        Storefront
                      </MarketplaceBadge>
                    </div>

                    <Link
                      className="mt-6 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-black text-[#fbfbf7] transition group-hover:border-[#b8ff3d]/30 group-hover:bg-[#b8ff3d]/10 group-hover:text-[#e7ff9a]"
                      href={`/brands/${brand.id}`}
                    >
                      View brand profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function getInitials(value: string) {
  const parts = value
    .replace(/@.*/, "")
    .split(/\s+/)
    .filter(Boolean);
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : value.slice(0, 2);
  return initials.toUpperCase();
}
