"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, MessageCircle, Radio, Sparkles, WalletCards } from "lucide-react";
import { PublicMarketplaceHeader } from "../../components/public-marketplace-entry";

const campaigns = [
  {
    brand: "Shiminsky Cannabis",
    copy: "Create a 30-90 sec product review reel for a premium flower drop.",
    meta: "Paid + Product · Instagram Reel · Detroit",
    title: "White Runtz creator drop"
  },
  {
    brand: "North Coast Supply",
    copy: "Lifestyle UGC around a weekend launch. Raw clips and edited reel needed.",
    meta: "Paid · UGC Video · Remote",
    title: "Launch-week UGC package"
  },
  {
    brand: "Kind Harbor",
    copy: "Creators needed for storefront pickup, product education, and social proof.",
    meta: "Product · Review · Local pickup",
    title: "Dispensary review series"
  }
];

const signals = [
  "2 brands viewed your profile today",
  "1 accepted campaign is ready for content",
  "Payment confirmed on product review assignment"
];

export default function CreatorPreviewPage() {
  return (
    <main className="min-h-screen bg-[#030303] px-4 pb-10 pt-4 text-[#fbfbf7] sm:px-6 md:px-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_16%_6%,rgba(184,255,61,0.13),transparent_31%),radial-gradient(circle_at_85%_0%,rgba(231,255,154,0.07),transparent_30%),linear-gradient(180deg,#030303,#090706_54%,#030303)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <PublicMarketplaceHeader accountHref="/sign-in" accountLabel="Open auth" />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-[34px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.024))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.44),0_1px_0_rgba(255,255,255,0.06)_inset] md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#b8ff3d]/25 bg-[#b8ff3d]/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#e7ff9a]">
                Creator mobile preview
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c7ccc2]">
                Campaigns · Feed · Messages · Work
              </span>
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.075em] text-[#fbfbf7] md:text-7xl">
              A creator home that feels like a market feed, not a SaaS dashboard.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1] md:text-lg">
              This preview shows the creator-side product direction: campaign discovery first, social activity close by,
              and work status always visible after a creator accepts a brief.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center rounded-full bg-[#b8ff3d] px-5 py-3 text-sm font-black text-[#071007] shadow-[0_18px_45px_rgba(184,255,61,0.24)] transition hover:bg-[#d7ff72]"
                href="/creator-dashboard"
              >
                Open creator demo
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-black text-[#fbfbf7] transition hover:bg-white/[0.09]"
                href="/"
              >
                Back to marketplace
              </Link>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {[
                ["14", "Fresh matches", "new opportunities"],
                ["6", "Live applications", "awaiting brand review"],
                ["1", "Payment pending", "creator work queue"]
              ].map(([value, label, hint]) => (
                <div className="rounded-[24px] border border-white/[0.08] bg-black/25 p-4" key={label}>
                  <div className="text-3xl font-black tracking-[-0.05em] text-[#fbfbf7]">{value}</div>
                  <div className="mt-2 text-sm font-black text-[#fbfbf7]">{label}</div>
                  <div className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#7d7068]">{hint}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[34px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.024))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
            <div className="grid grid-cols-4 gap-1 rounded-full border border-[#b8ff3d]/20 bg-black/25 p-1">
              {["Campaigns", "Feed", "Messages", "Work"].map((item, index) => (
                <div
                  className={`rounded-full px-2 py-2 text-center text-[10px] font-black ${
                    index === 0 ? "bg-[#b8ff3d] text-[#071007]" : "text-[#c7ccc2]"
                  }`}
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {campaigns.map((campaign, index) => (
                <div className="rounded-[26px] border border-white/[0.08] bg-[#101010]/80 p-4" key={campaign.title}>
                  <div className="flex gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-white/10 bg-white/[0.055] text-xs font-black text-[#fbfbf7]">
                      {campaign.brand
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-black text-[#fbfbf7]">{campaign.brand}</div>
                        {index === 0 ? <span className="rounded-full bg-[#c8f060]/12 px-2 py-1 text-[10px] font-black text-[#dff7a8]">New</span> : null}
                      </div>
                      <div className="mt-2 text-lg font-black leading-tight tracking-[-0.03em] text-[#fbfbf7]">{campaign.title}</div>
                      <p className="mt-2 text-sm leading-6 text-[#d8ded1]">{campaign.copy}</p>
                      <div className="mt-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#e7ff9a]">{campaign.meta}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-[30px] border border-white/[0.09] bg-white/[0.035] p-5 md:p-6">
            <div className="flex items-center gap-2 text-[#e7ff9a]">
              <Radio className="h-5 w-5" />
              <span className="text-[11px] font-black uppercase tracking-[0.24em]">Creator social feed</span>
            </div>
            <div className="mt-5 grid gap-3">
              {signals.map((signal) => (
                <div className="rounded-[22px] border border-white/[0.08] bg-black/25 p-4 text-sm font-black text-[#fbfbf7]" key={signal}>
                  {signal}
                  <p className="mt-2 text-sm font-normal leading-6 text-[#c7ccc2]">
                    Activity like profile views, accepted work, creator posts, brand updates, and payment confirmations
                    should make the app feel worth checking daily.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/[0.09] bg-white/[0.035] p-5 md:p-6">
            <div className="flex items-center gap-2 text-[#e7ff9a]">
              <BadgeCheck className="h-5 w-5" />
              <span className="text-[11px] font-black uppercase tracking-[0.24em]">Work queue</span>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                [WalletCards, "Payment pending", "Approved content waiting on brand confirmation."],
                [MessageCircle, "Coordinate pickup", "Use messages to confirm timing, product, payment, and content context."],
                [BriefcaseBusiness, "Accepted campaign", "Submit content from the work tab once the creator is ready."],
                [Sparkles, "Profile matters", "Brands evaluate social links, niches, portfolio, and fit before accepting."]
              ].map(([Icon, title, copy]) => {
                const TypedIcon = Icon as typeof Sparkles;
                return (
                  <div className="rounded-[22px] border border-white/[0.08] bg-black/25 p-4" key={title as string}>
                    <div className="flex items-center gap-2 text-sm font-black text-[#fbfbf7]">
                      <TypedIcon className="h-4 w-4 text-[#e7ff9a]" />
                      {title as string}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">{copy as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
