"use client";

import Link from "next/link";
import { ArrowRight, MoonStar, Radio, Sparkles } from "lucide-react";
import { InternalEyebrow, InternalPanel, InternalShell, InternalSubPanel, InternalTopBar } from "../../components/internal-console";

const variants = [
  {
    href: "/design-review/palette-preview",
    title: "Premium red palette test",
    eyebrow: "Live color exploration",
    description:
      "Four polished red systems tested inside BudCast campaign cards, feed actions, mobile nav, and brand workflow surfaces.",
    bullets: ["Burnt Vermilion", "Oxide Red", "Persimmon", "Cherry Lacquer"],
    icon: Sparkles
  },
  {
    href: "/design-review/dark-moody",
    title: "Social marketplace OS",
    eyebrow: "Current approved direction",
    description:
      "Dark creator-network energy with Persimmon action states, feed-native cards, and marketplace workflows for brands and creators.",
    bullets: ["Campaign feed", "Social activity", "Mobile-first creator app"],
    icon: Radio
  },
  {
    href: "/design-review/editorial-operator",
    title: "Previous editorial direction",
    eyebrow: "Archived comparison",
    description:
      "The earlier premium SaaS/editorial system. Kept as a reference only so we can see what BudCast moved away from.",
    bullets: ["More static", "More dashboard-like", "Lower social energy"],
    icon: MoonStar
  }
];

export default function DesignReviewHubPage() {
  return (
    <InternalShell>
      <InternalTopBar label="Design review" />

      <InternalPanel className="overflow-hidden p-6 md:p-8">
        <div className="max-w-4xl">
          <InternalEyebrow>BudCast design review</InternalEyebrow>
          <h1 className="mt-4 text-5xl font-black leading-[0.9] tracking-[-0.075em] text-[#fbfbf7] md:text-7xl">
            Design review now tracks the approved social marketplace system.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
            This area is no longer a gold/editorial comparison hub. It documents the visual reset toward a cannabis-native
            creator network: Campaigns, Feed, Messages, Work, and profile-first trust.
          </p>
        </div>
      </InternalPanel>

      <section className="grid gap-5 lg:grid-cols-2">
        {variants.map((variant) => {
          const Icon = variant.icon;
          return (
            <InternalPanel className="flex h-full flex-col p-5 md:p-6" key={variant.href}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <InternalEyebrow>{variant.eyebrow}</InternalEyebrow>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7] md:text-4xl">{variant.title}</h2>
                </div>
                <div className="premium-icon-surface grid h-12 w-12 place-items-center rounded-full text-[#e7ff9a]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-[#d8ded1]">{variant.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {variant.bullets.map((bullet) => (
                  <span
                    className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#c7ccc2]"
                    key={bullet}
                  >
                    {bullet}
                  </span>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  className="inline-flex min-h-12 items-center rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d_62%,#b93c28)] px-5 py-0 text-sm font-black text-[#071007] shadow-[0_18px_45px_rgba(184,255,61,0.24),0_1px_0_rgba(255,255,255,0.26)_inset] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
                  href={variant.href}
                >
                  Open concept
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </InternalPanel>
          );
        })}
      </section>

      <InternalSubPanel className="p-5">
        <div className="flex items-center gap-2 text-[#e7ff9a]">
          <Sparkles className="h-5 w-5" />
          <span className="text-[11px] font-black uppercase tracking-[0.24em]">Design rule</span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#d8ded1]">
          Any page that feels like old SaaS, light editorial, or generic dashboard should be pulled into the social
          marketplace OS before launch.
        </p>
      </InternalSubPanel>
    </InternalShell>
  );
}
