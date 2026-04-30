"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Heart,
  MessageCircle,
  Radio,
  Search,
  Send,
  Sparkles,
  UserRound,
  WalletCards
} from "lucide-react";
import { InternalEyebrow, InternalPanel, InternalShell, InternalSubPanel, InternalTopBar } from "../../../components/internal-console";

const palettes = [
  {
    name: "Burnt Vermilion",
    verdict: "Recommended first test",
    primary: "#c8462f",
    highlight: "#f06f4f",
    soft: "#ffb199",
    ink: "#150706",
    note: "Best balance of premium, social energy, and cannabis-market warmth."
  },
  {
    name: "Oxide Red",
    verdict: "Most grounded",
    primary: "#b6422e",
    highlight: "#e06b52",
    soft: "#f0a18d",
    ink: "#130706",
    note: "Earthier and more mature. Feels less techy, more premium cannabis."
  },
  {
    name: "Persimmon Red",
    verdict: "Most UGC/social",
    primary: "#b8ff3d",
    highlight: "#ff8a6c",
    soft: "#e7ff9a",
    ink: "#170805",
    note: "Creator-forward and lively. Strong for mobile actions and feed engagement."
  },
  {
    name: "Cherry Lacquer",
    verdict: "Most luxury",
    primary: "#9f1f24",
    highlight: "#e0444d",
    soft: "#ff9ca1",
    ink: "#120507",
    note: "High-end and dramatic. Risk: can drift into fashion/beauty if overused."
  }
];

function PaletteSwatch({
  color,
  label
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="min-w-0 rounded-[18px] border border-white/10 bg-white/[0.035] p-3">
      <div className="h-10 rounded-[13px] border border-white/10" style={{ backgroundColor: color }} />
      <div className="mt-2 truncate text-[10px] font-black uppercase tracking-[0.16em] text-[#aeb5aa]">{label}</div>
      <div className="mt-1 text-xs font-black text-[#fbfbf7]">{color}</div>
    </div>
  );
}

function PalettePreviewCard({ palette }: { palette: (typeof palettes)[number] }) {
  const style = {
    "--accent": palette.primary,
    "--accent-hi": palette.highlight,
    "--accent-soft": palette.soft,
    "--accent-ink": palette.ink
  } as React.CSSProperties;

  return (
    <div style={style}>
      <InternalPanel className="overflow-hidden p-0">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_14%_0%,color-mix(in_srgb,var(--accent)_26%,transparent),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.024))] p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-xl">
            <div className="inline-flex rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--accent)_13%,transparent)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent-soft)]">
              {palette.verdict}
            </div>
            <h2 className="mt-4 text-4xl font-black leading-[0.9] tracking-[-0.065em] text-[#fbfbf7] md:text-5xl">
              {palette.name}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-[#d8ded1]">{palette.note}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <PaletteSwatch color={palette.primary} label="Primary" />
            <PaletteSwatch color={palette.highlight} label="Highlight" />
            <PaletteSwatch color={palette.soft} label="Soft" />
            <PaletteSwatch color={palette.ink} label="Ink" />
          </div>
        </div>
        </div>

        <div className="grid gap-5 p-5 md:p-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[#090706] shadow-[0_24px_80px_rgba(0,0,0,0.36)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent-soft)]">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black text-[#fbfbf7]">BudCast</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#aeb5aa]">Creator marketplace</div>
              </div>
            </div>
            <button className="min-h-10 rounded-full border border-white/10 bg-[linear-gradient(180deg,var(--accent-hi),var(--accent)_62%,color-mix(in_srgb,var(--accent)_78%,black))] px-4 py-0 text-xs font-black text-[var(--accent-ink)] shadow-[0_16px_38px_color-mix(in_srgb,var(--accent)_24%,transparent),0_1px_0_rgba(255,255,255,0.26)_inset] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0">
              Apply
            </button>
          </div>

          <div className="p-4">
            <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.045]">
              <div className="min-h-[138px] bg-[radial-gradient(circle_at_26%_10%,color-mix(in_srgb,var(--accent)_52%,transparent),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_34%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent-soft)]">
                    Paid + Product
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#d8ded1]">
                    UGC Video
                  </span>
                </div>
                <h3 className="mt-4 text-3xl font-black leading-[0.96] tracking-[-0.04em] text-[#fbfbf7]">
                  Create a product review reel for a premium flower drop.
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#d8ded1]">
                  Build a 30-90 sec creator-led video with lifestyle footage, product context, and brand-safe talking points.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    ["8", "creators accepted"],
                    ["3d", "left to apply"],
                    ["$250", "creator rate"]
                  ].map(([value, label]) => (
                    <div className="rounded-[18px] border border-white/10 bg-black/20 p-3" key={label}>
                      <div className="text-xl font-black text-[#fbfbf7]">{value}</div>
                      <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#8d7f76]">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-1.5 rounded-[28px] border border-[color-mix(in_srgb,var(--accent-soft)_10%,transparent)] bg-[linear-gradient(180deg,rgba(18,11,9,0.84),rgba(5,4,3,0.74))] p-1.5 shadow-[0_18px_54px_rgba(0,0,0,0.38),0_1px_0_rgba(255,255,255,0.07)_inset] backdrop-blur-xl">
              {[
                [BriefcaseBusiness, "Campaigns", true],
                [Radio, "Feed", false],
                [MessageCircle, "Messages", false],
                [WalletCards, "Work", false],
                [UserRound, "Profile", false]
              ].map(([Icon, label, active]) => {
                const TypedIcon = Icon as typeof BriefcaseBusiness;
                return (
                  <button
                    className={`grid min-h-14 place-items-center rounded-[20px] text-[10px] font-black transition ${
                      active
                        ? "bg-[linear-gradient(180deg,var(--accent-hi),var(--accent))] text-[var(--accent-ink)] shadow-[0_14px_34px_color-mix(in_srgb,var(--accent)_22%,transparent),0_1px_0_rgba(255,255,255,0.24)_inset]"
                        : "text-[#c7ccc2] hover:bg-white/[0.045] hover:text-[#fbfbf7]"
                    }`}
                    key={label as string}
                  >
                    <TypedIcon className="h-4 w-4" />
                    <span>{label as string}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-[color-mix(in_srgb,var(--accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-sm font-black text-[var(--accent-soft)]">
                  SC
                </div>
                <div>
                  <div className="font-black text-[#fbfbf7]">Shiminsky Cannabis</div>
                  <div className="mt-1 text-xs text-[#aeb5aa]">posted a new campaign · Detroit</div>
                </div>
              </div>
              <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent-soft)]">
                New
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#d8ded1]">
              Looking for creators who can shoot clean product education with a lifestyle angle. Paid + Product campaign, pickup coordinated in messages.
            </p>
            <div className="mt-4 flex items-center gap-3 text-[#c7ccc2]">
              <button className="flex min-h-10 items-center gap-2 rounded-full border border-white/[0.075] bg-white/[0.035] px-3 py-0 text-xs font-black transition hover:border-[color-mix(in_srgb,var(--accent)_26%,transparent)] hover:bg-white/[0.055]">
                <Heart className="h-4 w-4 text-[var(--accent-soft)]" />
                Save
              </button>
              <button className="flex min-h-10 items-center gap-2 rounded-full border border-white/[0.075] bg-white/[0.035] px-3 py-0 text-xs font-black transition hover:border-[color-mix(in_srgb,var(--accent)_26%,transparent)] hover:bg-white/[0.055]">
                <MessageCircle className="h-4 w-4 text-[var(--accent-soft)]" />
                Ask brand
              </button>
              <button className="ml-auto flex min-h-10 items-center gap-2 rounded-full bg-[linear-gradient(180deg,var(--accent-hi),var(--accent)_62%,color-mix(in_srgb,var(--accent)_78%,black))] px-4 py-0 text-xs font-black text-[var(--accent-ink)] shadow-[0_14px_34px_color-mix(in_srgb,var(--accent)_22%,transparent),0_1px_0_rgba(255,255,255,0.24)_inset] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0">
                Apply
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-2 text-[var(--accent-soft)]">
                <BadgeCheck className="h-5 w-5" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Brand control</span>
              </div>
              <div className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">12 applicants</div>
              <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">Review creator profiles, pitches, and portfolio clips before accepting.</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-2 text-[var(--accent-soft)]">
                <Send className="h-5 w-5" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Messages</span>
              </div>
              <div className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">4 active</div>
              <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">Coordinate pickup, campaign details, payment, and approval timing.</p>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[#090706] p-5">
            <div className="flex items-center gap-2 text-[#fbfbf7]">
              <Search className="h-4 w-4 text-[var(--accent-soft)]" />
              <div className="text-sm font-black">Marketplace search</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["UGC Video", "Flower", "Detroit", "Paid", "Lifestyle", "Closing soon"].map((tag) => (
                <span
                  className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#d8ded1]"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
        </div>
      </InternalPanel>
    </div>
  );
}

export default function PalettePreviewPage() {
  return (
    <InternalShell>
      <InternalTopBar label="Palette preview" />

      <InternalPanel className="overflow-hidden p-6 md:p-8">
        <Link className="inline-flex items-center gap-2 text-sm font-black text-[#d8ded1] transition hover:text-[#e7ff9a]" href="/design-review">
          <ArrowLeft className="h-4 w-4" />
          Back to design review
        </Link>
        <div className="mt-6 max-w-5xl">
          <InternalEyebrow>Premium red direction test</InternalEyebrow>
          <h1 className="mt-4 text-5xl font-black leading-[0.9] tracking-[-0.075em] text-[#fbfbf7] md:text-7xl">
            Testing reds inside real BudCast marketplace surfaces.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#d8ded1]">
            Each palette is shown as if it already powered BudCast: campaign cards, social feed actions, mobile nav,
            brand control states, badges, and marketplace search.
          </p>
        </div>
      </InternalPanel>

      <InternalSubPanel className="p-5">
        <div className="flex items-center gap-2 text-[#e7ff9a]">
          <Sparkles className="h-5 w-5" />
          <span className="text-[11px] font-black uppercase tracking-[0.24em]">What to judge</span>
        </div>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-[#d8ded1]">
          Look for the red that feels premium, social, creator-native, and trustworthy without becoming loud, generic,
          or gimmicky. Green remains reserved for logo/success states.
        </p>
      </InternalSubPanel>

      <section className="grid gap-6">
        {palettes.map((palette) => (
          <PalettePreviewCard key={palette.name} palette={palette} />
        ))}
      </section>
    </InternalShell>
  );
}
