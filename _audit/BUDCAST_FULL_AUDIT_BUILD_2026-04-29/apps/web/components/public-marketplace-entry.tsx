import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, MessageCircle, Radio, Search, Sparkles } from "lucide-react";
import { BudCastLogo } from "./budcast-logo";
import { Button } from "./ui/button";

export type PublicMarketplaceHeaderProps = {
  accountHref?: string;
  accountLabel?: string;
  signedIn?: boolean;
};

const sampleCampaigns = [
  {
    brand: "Shiminsky Cannabis",
    copy: "Looking for creator-shot product review reels for a premium flower drop.",
    meta: "Paid + Product · Instagram Reel · Detroit"
  },
  {
    brand: "North Coast Supply",
    copy: "Lifestyle UGC around a weekend launch. Raw clips and edited reel needed.",
    meta: "Paid · UGC Video · Remote"
  },
  {
    brand: "Kind Harbor",
    copy: "Creators needed for storefront pickup, product education, and social proof.",
    meta: "Product · Review · Local pickup"
  }
];

const socialUpdates = [
  "Creator posted approved reel for White Runtz launch",
  "Brand opened 4 new campaign spots",
  "Payment confirmed on product review assignment"
];

export function PublicMarketplaceHeader({
  accountHref = "/sign-up",
  accountLabel = "Create account",
  signedIn = false
}: PublicMarketplaceHeaderProps) {
  return (
    <header className="sticky top-3 z-30 rounded-[30px] border border-white/[0.08] bg-[#030303]/80 px-4 py-3 shadow-[0_20px_70px_rgba(0,0,0,0.38),0_1px_0_rgba(231,255,154,0.1)_inset] backdrop-blur-2xl md:top-5 md:px-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <BudCastLogo className="drop-shadow-[0_10px_26px_rgba(184,255,61,0.12)]" href="/" size="md" variant="lockup" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {signedIn ? null : (
            <Link
              className="hidden rounded-full px-4 py-2 text-xs font-black text-[#c7ccc2] transition hover:bg-white/[0.055] hover:text-[#fbfbf7] sm:inline-flex"
              href="/sign-in"
            >
              Sign In
            </Link>
          )}
          <Button asChild size="md">
            <Link href={accountHref}>
              {accountLabel}
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function PublicMarketplacePreview() {
  return (
    <aside className="overflow-hidden rounded-[34px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.024))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.38),0_1px_0_rgba(255,255,255,0.07)_inset] md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">Live marketplace</div>
          <div className="mt-1 text-xl font-black text-[#fbfbf7]">Campaigns + Feed</div>
        </div>
        <div className="premium-icon-surface grid h-11 w-11 place-items-center rounded-[17px] text-[#e7ff9a]">
          <Radio className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-1 rounded-[22px] bg-black/24 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        {["Campaigns", "Feed", "Work"].map((item, index) => (
          <div
            className={`rounded-[18px] px-3 py-2 text-center text-[11px] font-black ${
              index === 0
                ? "bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_10px_24px_rgba(184,255,61,0.22),0_1px_0_rgba(255,255,255,0.24)_inset]"
                : "text-[#c7ccc2]"
            }`}
            key={item}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {sampleCampaigns.map((campaign, index) => (
          <div
            className="rounded-[26px] border border-white/[0.06] bg-[#101010]/78 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition hover:border-[#e7ff9a]/16 hover:bg-white/[0.055]"
            key={campaign.brand}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-white/10 bg-white/[0.055] text-xs font-black text-[#fbfbf7]">
                {campaign.brand
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate text-sm font-black text-[#fbfbf7]">{campaign.brand}</div>
                  {index === 0 ? (
                    <span className="rounded-full bg-[#c8f060]/12 px-2 py-1 text-[10px] font-bold text-[#dff7a8]">
                      New
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-[#d8ded1]">{campaign.copy}</p>
                <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#e7ff9a]">
                  {campaign.meta}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[26px] border border-white/[0.06] bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
        <div className="flex items-center gap-2 text-sm font-black text-[#fbfbf7]">
          <MessageCircle className="h-4 w-4 text-[#e7ff9a]" />
          Network activity
        </div>
        <div className="mt-3 space-y-2">
          {socialUpdates.map((update) => (
            <div className="text-sm leading-6 text-[#c7ccc2]" key={update}>
              {update}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function PublicRoleCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        {
          copy: "Browse campaigns, apply from your phone, submit content, and track payment status.",
          href: "/sign-up",
          icon: Sparkles,
          label: "Creators",
          title: "Find paid cannabis campaigns"
        },
        {
          copy: "Post briefs, review applicants, approve content, and coordinate payment or pickup details.",
          href: "/sign-up",
          icon: BriefcaseBusiness,
          label: "Brands",
          title: "Hire creators for UGC"
        }
      ].map((card) => {
        const Icon = card.icon;
        return (
          <Link
            className="group rounded-[28px] border border-white/[0.07] bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-[#e7ff9a]/16 hover:bg-white/[0.06]"
            href={card.href}
            key={card.label}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">{card.label}</div>
              <Icon className="h-4 w-4 text-[#c7ccc2] transition group-hover:text-[#e7ff9a]" />
            </div>
            <div className="mt-4 text-lg font-black text-[#fbfbf7]">{card.title}</div>
            <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">{card.copy}</p>
          </Link>
        );
      })}
    </div>
  );
}

export function PublicSearchBar() {
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/[0.07] bg-white/[0.045] px-4 py-3 text-sm text-[#aeb5aa] shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
      <Search className="h-4 w-4 text-[#e7ff9a]" />
      Search campaigns, creators, brands
    </div>
  );
}
