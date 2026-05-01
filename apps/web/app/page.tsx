"use client";

import Link from "next/link";
import { useAuth } from "@budcast/shared";
import { ArrowUpRight } from "lucide-react";
import {
  PublicMarketplaceHeader,
  PublicMarketplacePreview,
  PublicRoleCards,
  PublicSearchBar
} from "../components/public-marketplace-entry";
import { Button } from "../components/ui/button";
import { getWorkspaceHref } from "../lib/workspace-routing";

const metrics = [
  { label: "Active campaigns", value: "18" },
  { label: "Creator applications", value: "126" },
  { label: "Avg. brand response", value: "4h" }
];

export default function HomePage() {
  const { loading, profile, session } = useAuth();
  const workspaceHref = session ? getWorkspaceHref(profile) : "/sign-in";
  const accountLabel = loading ? "Checking" : session ? "Dashboard" : "Create account";

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-10 pt-3 text-[#fbfbf7] md:px-8 md:pt-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <PublicMarketplaceHeader accountHref={session ? workspaceHref : "/sign-up"} accountLabel={accountLabel} signedIn={Boolean(session)} />

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start">
          <div className="overflow-hidden rounded-[38px] border border-white/[0.07] bg-[radial-gradient(circle_at_20%_10%,rgba(184,255,61,0.18),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.46),0_1px_0_rgba(255,255,255,0.08)_inset] md:p-8">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">
                Cannabis creator marketplace
              </div>
              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] sm:text-6xl md:text-7xl">
                Campaigns, creators, and cannabis content in one network.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1] md:text-lg">
                BudCast is where cannabis brands post campaigns, creators apply, content gets approved,
                and manual payout or product status stays connected to the work.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={session ? workspaceHref : "/sign-up"}>
                    {session ? "Open BudCast" : "Create account"}
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {!session ? (
                  <Button asChild className="border-white/10 bg-white/[0.045] text-[#fbfbf7] hover:bg-white/[0.075]" size="lg" variant="secondary">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                ) : null}
              </div>

              <div className="mt-6 max-w-xl">
                <PublicSearchBar />
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                {metrics.map((metric) => (
                  <div className="rounded-[24px] border border-white/9 bg-[#101010]/80 p-4" key={metric.label}>
                    <div className="text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">{metric.value}</div>
                    <div className="mt-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#aeb5aa]">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <PublicMarketplacePreview />
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.78fr_1fr] lg:items-start">
          <div className="rounded-[34px] border border-white/[0.07] bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] md:p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">How BudCast works</div>
            <p className="mt-4 text-2xl font-black leading-tight tracking-[-0.04em] text-[#fbfbf7] md:text-3xl">
              Brands post campaigns. Creators apply. Content moves through approval and payment status.
            </p>
            <p className="mt-4 text-sm leading-7 text-[#c7ccc2]">
              Built around real cannabis workflows: paid creator services, product collaborations, and paid + product
              campaigns with messages for details, revisions, and manual payment coordination.
            </p>
          </div>
          <PublicRoleCards />
        </section>
      </div>
    </main>
  );
}
