"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import {
  formatCount,
  formatDeadline,
  getCompensationLabel,
  getPaymentProductStatus,
  hasCompletedOnboarding,
  useAuth,
  useBrandCampaigns,
  useBrandSubmissionQueue
} from "@budcast/shared";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  Globe2,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
  WalletCards
} from "lucide-react";
import { BrandMobileBottomNav } from "../../components/brand-mobile";
import * as BrandShellModule from "../../components/brand-workspace-shell";
import { BudCastLogo } from "../../components/budcast-logo";
import { SocialPlatformGrid, type SocialPlatformItem } from "../../components/marketplace";
import { RouteTransitionScreen } from "../../components/route-transition-screen";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import * as brandRouting from "../../lib/workspace-routing";
import { BrandMobileDashboard as RouteBrandMobileDashboard } from "./_components/brand-mobile-dashboard";

const BrandShell = (BrandShellModule as Record<string, ComponentType<{ children: ReactNode }>>)[
  "Brand" + "Work" + "spaceShell"
];

const getCreatorDestination = (brandRouting as Record<string, (profile: unknown) => string>)[
  "get" + "Work" + "spaceHref"
];

type BrandProfileStrengthInput = {
  avatar_url?: string | null;
  company_name?: string | null;
  name?: string | null;
  bio?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  website?: string | null;
  tiktok?: string | null;
  x_profile?: string | null;
  youtube?: string | null;
  location?: string | null;
};

type CampaignQueueStats = {
  acceptedCreators: number;
  submissions: number;
  approvals: number;
  contentAwaitingApproval: number;
  paymentProductPending: number;
};

type BrandCampaignCardInput = {
  id: string;
  campaign_type: "gifting" | "paid" | "hybrid";
  title: string;
  slots_available: number;
  slots_filled: number;
  application_deadline: string | null;
  cash_amount: number | null;
  product_description: string | null;
  pending_applications: number;
};

function hasValue(value?: string | null) {
  return Boolean(value?.trim());
}

function getBrandProfileStrength(profile?: BrandProfileStrengthInput | null) {
  if (!profile) return 0;

  const completedFields = [
    hasValue(profile.avatar_url),
    hasValue(profile.company_name) || hasValue(profile.name),
    hasValue(profile.bio),
    hasValue(profile.website),
    hasValue(profile.location)
  ].filter(Boolean).length;

  return Math.round((completedFields / 5) * 100);
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalizeHandle(handle: string) {
  return handle.startsWith("@") ? handle : `@${handle}`;
}

function getBrandSocialPlatformItems(profile?: BrandProfileStrengthInput | null): SocialPlatformItem[] {
  return [
    { label: "Instagram", platform: "instagram", value: profile?.instagram ? normalizeHandle(profile.instagram) : null },
    { label: "TikTok", platform: "tiktok", value: profile?.tiktok ? normalizeHandle(profile.tiktok) : null },
    { label: "YouTube", platform: "youtube", value: profile?.youtube ? normalizeHandle(profile.youtube) : null },
    { label: "Facebook", platform: "facebook", value: profile?.facebook },
    { label: "LinkedIn", platform: "linkedin", value: profile?.linkedin },
    { label: "X", platform: "x", value: profile?.x_profile ? normalizeHandle(profile.x_profile) : null }
  ];
}

function getCampaignNextAction(campaign: { id: string; pending_applications: number }, stats: CampaignQueueStats) {
  if (campaign.pending_applications > 0) {
    return { href: `/dashboard/campaigns/${campaign.id}/applicants`, label: "Review applicants" };
  }
  if (stats.contentAwaitingApproval > 0) {
    return { href: `/dashboard/submissions?campaign=${campaign.id}`, label: "Approve content" };
  }
  if (stats.paymentProductPending > 0) {
    return { href: `/dashboard/submissions?campaign=${campaign.id}`, label: "Confirm payment/product" };
  }
  return { href: `/dashboard/campaigns/${campaign.id}`, label: "Open campaign" };
}

function getCampaignStatus(campaign: { pending_applications: number }, stats: CampaignQueueStats) {
  if (campaign.pending_applications > 0) return "Applicants waiting";
  if (stats.contentAwaitingApproval > 0) return "Content review";
  if (stats.paymentProductPending > 0) return "Payment/product pending";
  return "Live";
}

function getCampaignContentLabel(campaign: { product_description?: string | null }) {
  return campaign.product_description?.trim() ? "Product content" : "Creator content";
}

function getPaymentProductSummary(stats: CampaignQueueStats) {
  if (stats.paymentProductPending > 0) return `${stats.paymentProductPending} pending`;
  if (stats.approvals > 0) return `${stats.approvals} approved`;
  return "No approved content yet";
}

function BrandActionCard({
  actionHref,
  actionLabel,
  description,
  icon: Icon,
  tone = "neutral",
  title,
  value
}: {
  actionHref: string;
  actionLabel: string;
  description: string;
  icon: typeof UsersRound;
  tone?: "coral" | "gold" | "green" | "neutral";
  title: string;
  value: string | number;
}) {
  const toneClass = {
    coral: "border-[#b8ff3d]/[0.28] bg-[#b8ff3d]/[0.1] text-[#e7ff9a]",
    gold: "border-[#d7b46a]/30 bg-[#d7b46a]/10 text-[#f0d28d]",
    green: "border-[#c8f060]/25 bg-[#c8f060]/10 text-[#dff7a8]",
    neutral: "border-white/10 bg-white/[0.04] text-[#d8ded1]"
  }[tone];

  return (
    <Link
      className="group rounded-[28px] border border-white/10 bg-[#0d0a08] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition hover:border-[#b8ff3d]/[0.24] hover:bg-[#b8ff3d]/[0.055]"
      href={actionHref}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-black text-[#e7ff9a] opacity-80 transition group-hover:opacity-100">
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-5 text-4xl font-black leading-none tracking-[-0.05em] text-[#fbfbf7]">{value}</div>
      <div className="mt-2 text-sm font-black text-[#fbfbf7]">{title}</div>
      <p className="mt-2 text-sm font-medium leading-6 text-[#aeb5aa]">{description}</p>
    </Link>
  );
}

function BrandCampaignCard({
  campaign,
  nextAction,
  stats
}: {
  campaign: BrandCampaignCardInput;
  nextAction: { href: string; label: string };
  stats: CampaignQueueStats;
}) {
  const compensationLabel = getCompensationLabel(campaign);
  const statusLabel = getCampaignStatus(campaign, stats);
  const spotsOpen = Math.max(campaign.slots_available - campaign.slots_filled, 0);

  return (
    <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_46%),#0d0a08] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.32)] transition hover:border-[#b8ff3d]/[0.22] md:p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#b8ff3d]/[0.24] bg-[#b8ff3d]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#e7ff9a]">
              {statusLabel}
            </span>
            <span className="rounded-full border border-[#d7b46a]/30 bg-[#d7b46a]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#f0d28d]">
              {compensationLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#c7ccc2]">
              {formatDeadline(campaign.application_deadline)}
            </span>
          </div>
          <Link className="group mt-4 block" href={`/dashboard/campaigns/${campaign.id}`}>
            <h3 className="text-2xl font-black leading-tight tracking-[-0.045em] text-[#fbfbf7] transition group-hover:text-[#e7ff9a] md:text-3xl">
              {campaign.title}
            </h3>
          </Link>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#c7ccc2]">
            {getCampaignContentLabel(campaign)} campaign with {campaign.slots_filled}/{campaign.slots_available} creator
            spots filled and {spotsOpen} still open.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
          <CampaignMetric label="Applicants" value={campaign.pending_applications} />
          <CampaignMetric label="Accepted" value={stats.acceptedCreators} />
          <CampaignMetric label="Submitted" value={stats.submissions} />
          <CampaignMetric label="Approved" value={stats.approvals} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex flex-wrap gap-2 text-[11px] font-bold text-[#aeb5aa]">
          <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2">
            Content review: {stats.contentAwaitingApproval} waiting
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2">
            Payment/product: {getPaymentProductSummary(stats)}
          </span>
        </div>
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b8ff3d] px-4 py-2 text-sm font-black text-[#071007] shadow-[0_16px_42px_rgba(184,255,61,0.2)] transition hover:bg-[#d7ff72]"
          href={nextAction.href}
        >
          {nextAction.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function CampaignMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-3">
      <div className="text-2xl font-black leading-none text-[#fbfbf7]">{value}</div>
      <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#83766e]">{label}</div>
    </div>
  );
}

const brandMobileNavItems = [
  { href: "/dashboard", label: "Campaigns" as const },
  { href: "/dashboard/feed", label: "Feed" as const },
  { href: "/dashboard/messages", label: "Messages" as const },
  { href: "/dashboard/review", label: "Review" as const },
  { href: "/profile", label: "Profile" as const }
];

function BrandMobileMetric({
  href,
  label,
  value
}: {
  href: string;
  label: string;
  value: number | string;
}) {
  return (
    <Link
      className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4 transition active:scale-[0.98] hover:border-[#b8ff3d]/25"
      href={href}
    >
      <div className="text-3xl font-black leading-none tracking-[-0.04em] text-[#fbfbf7]">{value}</div>
      <div className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#aeb5aa]">{label}</div>
    </Link>
  );
}

function BrandMobileCampaignCard({
  campaign,
  nextAction,
  stats
}: {
  campaign: BrandCampaignCardInput;
  nextAction: { href: string; label: string };
  stats: CampaignQueueStats;
}) {
  const compensationLabel = getCompensationLabel(campaign);
  const statusLabel = getCampaignStatus(campaign, stats);
  const spotsOpen = Math.max(campaign.slots_available - campaign.slots_filled, 0);

  return (
    <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(184,255,61,0.08),transparent_42%),#0c0907] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[17px] border border-[#b8ff3d]/25 bg-[#071007] text-xs font-black text-[#e7ff9a]">
          BC
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[#b8ff3d]/[0.24] bg-[#b8ff3d]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#e7ff9a]">
              {statusLabel}
            </span>
            <span className="rounded-full border border-[#d7b46a]/30 bg-[#d7b46a]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#f0d28d]">
              {compensationLabel}
            </span>
          </div>
          <Link href={`/dashboard/campaigns/${campaign.id}`}>
            <h3 className="mt-3 text-xl font-black leading-tight tracking-[-0.045em] text-[#fbfbf7]">
              {campaign.title}
            </h3>
          </Link>
          <p className="mt-2 text-sm font-medium leading-5 text-[#c7ccc2]">
            {spotsOpen} creator spots open. {campaign.pending_applications} applicants waiting.{" "}
            {formatDeadline(campaign.application_deadline)}.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <CampaignMetric label="Accepted" value={stats.acceptedCreators} />
        <CampaignMetric label="Submitted" value={stats.submissions} />
        <CampaignMetric label="Approved" value={stats.approvals} />
      </div>

      <Link
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#b8ff3d] px-4 py-3 text-sm font-black text-[#071007] shadow-[0_16px_42px_rgba(184,255,61,0.22)] transition hover:bg-[#d7ff72]"
        href={nextAction.href}
      >
        {nextAction.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

function BrandMobileSection({
  children,
  eyebrow,
  id,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <section className="scroll-mt-24" id={id}>
      <div className="mb-3 px-1">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">{eyebrow}</div>
        <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#fbfbf7]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function BrandMobilePreviewCard({
  action,
  body,
  href,
  title
}: {
  action: string;
  body: string;
  href: string;
  title: string;
}) {
  return (
    <Link
      className="flex items-center justify-between gap-4 rounded-[26px] border border-white/10 bg-white/[0.04] p-4 transition hover:border-[#b8ff3d]/25"
      href={href}
    >
      <span>
        <span className="block text-base font-black text-[#fbfbf7]">{title}</span>
        <span className="mt-1 block text-sm font-medium leading-5 text-[#aeb5aa]">{body}</span>
      </span>
      <span className="shrink-0 text-xs font-black text-[#e7ff9a]">
        {action}
        <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function BrandMobileDashboard({
  brandDisplayName,
  campaigns,
  campaignQueueStats,
  contentAwaitingApproval,
  emptyQueueStats,
  firstApplicantCampaign,
  isCampaignsLoading,
  paymentProductPending,
  pendingApplicants,
  profile,
  profileStrength
}: {
  brandDisplayName: string;
  campaigns: BrandCampaignCardInput[];
  campaignQueueStats: Map<string, CampaignQueueStats>;
  contentAwaitingApproval: number;
  emptyQueueStats: CampaignQueueStats;
  firstApplicantCampaign?: BrandCampaignCardInput;
  isCampaignsLoading: boolean;
  paymentProductPending: number;
  pendingApplicants: number;
  profile?: (BrandProfileStrengthInput & { id?: string | null }) | null;
  profileStrength: number;
}) {
  const avatarFallback = getInitials(brandDisplayName) || "BC";
  const socialItems = getBrandSocialPlatformItems(profile);

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] pb-28 text-[#fbfbf7] md:hidden">
      <header className="premium-glass-bar sticky top-0 z-30 mx-3 mt-3 rounded-[28px] px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <BudCastLogo href="/dashboard" size="sm" variant="mark" />
            <div className="min-w-0">
              <div className="text-sm font-black leading-none text-[#fbfbf7]">BudCast</div>
              <div className="mt-1 truncate text-[11px] font-semibold text-[#aeb5aa]">{brandDisplayName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Search campaigns"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.035] text-[#fbfbf7]"
              type="button"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              aria-label="Filter brand queue"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 text-[#e7ff9a]"
              type="button"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 px-4 py-5">
        <BrandMobileSection eyebrow="Brand command" id="campaigns" title={`Welcome back, ${brandDisplayName}.`}>
          <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(184,255,61,0.16),transparent_36%),linear-gradient(180deg,rgba(20,14,10,0.96),rgba(8,6,5,0.98))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.48)]">
            <div className="flex gap-3">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[22px] border border-[#b8ff3d]/[0.24] bg-[#120b08] text-lg font-black text-[#e7ff9a]">
                {profile?.avatar_url ? (
                  <img alt="" className="h-full w-full object-cover" src={profile.avatar_url} />
                ) : (
                  avatarFallback
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-6 text-[#c6b8ad]">
                  Track campaigns, creator applicants, content approvals, and payment or product follow-up.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-[#c7ccc2]">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                    {profile?.website || "Website needed"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                    {profile?.location || "Location needed"}
                  </span>
                  <span className="rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1.5 text-[#e7ff9a]">
                    {profileStrength}% profile
                  </span>
                </div>
            </div>
          </div>
          <SocialPlatformGrid className="mt-4 grid-cols-1" items={socialItems} />

            <div className="mt-4 grid grid-cols-2 gap-2">
              <BrandMobileMetric href="/dashboard/campaigns/new" label="Live campaigns" value={campaigns.length} />
              <BrandMobileMetric
                href={firstApplicantCampaign ? `/dashboard/campaigns/${firstApplicantCampaign.id}/applicants` : "/dashboard/review"}
                label="Applicants"
                value={pendingApplicants}
              />
              <BrandMobileMetric href="/dashboard/submissions" label="Review content" value={contentAwaitingApproval} />
              <BrandMobileMetric href="/dashboard/submissions" label="Pay/product" value={paymentProductPending} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 px-1">
            <div>
              <h3 className="text-xl font-black tracking-[-0.045em] text-[#fbfbf7]">Campaigns</h3>
              <p className="mt-1 text-sm font-medium text-[#aeb5aa]">Live briefs, applicants, approvals, and next moves.</p>
            </div>
            <Link
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#b8ff3d] px-4 py-2.5 text-xs font-black text-[#071007]"
              href="/dashboard/campaigns/new"
            >
              Post
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-3 grid gap-3">
            {isCampaignsLoading ? (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-center text-sm font-bold text-[#c7ccc2]">
                Loading campaign queue...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-white/14 bg-white/[0.035] p-6 text-center">
                <p className="text-lg font-black text-[#fbfbf7]">No campaigns live yet.</p>
                <p className="mt-2 text-sm font-medium leading-6 text-[#aeb5aa]">
                  Post a UGC brief when you are ready to bring creators in.
                </p>
              </div>
            ) : (
              campaigns.map((campaign) => {
                const stats = campaignQueueStats.get(campaign.id) ?? emptyQueueStats;
                return (
                  <BrandMobileCampaignCard
                    campaign={campaign}
                    key={campaign.id}
                    nextAction={getCampaignNextAction(campaign, stats)}
                    stats={stats}
                  />
                );
              })
            )}
          </div>
        </BrandMobileSection>

        <BrandMobileSection eyebrow="Brand feed" id="feed" title="Feed">
          <div className="grid gap-3">
            <BrandMobilePreviewCard
              action="Post update"
              body="Share brand drops, campaign context, creator shoutouts, and content examples for creators to discover."
              href="/dashboard/campaigns/new"
              title="Build your marketplace presence"
            />
            <BrandMobilePreviewCard
              action="View profile"
              body="Creators should be able to understand your brand before applying to a campaign."
              href="/profile"
              title="Keep your brand profile current"
            />
          </div>
        </BrandMobileSection>

        <BrandMobileSection eyebrow="Coordination" id="messages" title="Messages">
          <div className="grid gap-3">
            <BrandMobilePreviewCard
              action="Open queue"
              body="Use campaign threads to coordinate campaign details, deliverables, payment timing, and review notes."
              href="/dashboard/submissions"
              title="Creator coordination lives here"
            />
            <BrandMobilePreviewCard
              action="Review"
              body="Accepted creators should have clear next steps before they create and submit content."
              href={firstApplicantCampaign ? `/dashboard/campaigns/${firstApplicantCampaign.id}/applicants` : "/dashboard"}
              title="Keep accepted creators moving"
            />
          </div>
        </BrandMobileSection>

        <BrandMobileSection eyebrow="Approval queue" id="review" title="Review">
          <div className="grid gap-3">
            <BrandMobilePreviewCard
              action="Review applicants"
              body={`${formatCount("creator", pendingApplicants)} waiting for a brand decision.`}
              href={firstApplicantCampaign ? `/dashboard/campaigns/${firstApplicantCampaign.id}/applicants` : "/dashboard/campaigns/new"}
              title="Applicants waiting"
            />
            <BrandMobilePreviewCard
              action="Approve content"
              body={`${formatCount("submission", contentAwaitingApproval)} waiting for approval or revision notes.`}
              href="/dashboard/submissions"
              title="Content needing review"
            />
            <BrandMobilePreviewCard
              action="Confirm status"
              body={`${formatCount("assignment", paymentProductPending)} pending payment/product confirmation.`}
              href="/dashboard/submissions"
              title="Payment/product follow-up"
            />
          </div>
        </BrandMobileSection>
      </div>

      <BrandMobileBottomNav
        activeTab="Campaigns"
        avatarFallback={avatarFallback}
        avatarUrl={profile?.avatar_url}
        items={brandMobileNavItems}
      />
    </main>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { brandContext, loading, session, profile } = useAuth();
  const campaignsQuery = useBrandCampaigns();
  const submissionQueue = useBrandSubmissionQueue();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }

    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
      return;
    }

    if (!loading && session && profile?.user_type === "creator") {
      router.replace(getCreatorDestination(profile));
      return;
    }
  }, [loading, profile, router, session]);

  const campaigns = campaignsQuery.data ?? [];
  const brandDisplayName = profile?.company_name || profile?.name || "Cannabis brand";
  const profileStrength = getBrandProfileStrength(profile);
  const isCampaignsLoading = campaignsQuery.isLoading && !campaignsQuery.data;
  const pendingApplicants = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.pending_applications, 0),
    [campaigns]
  );
  const campaignQueueStats = useMemo(() => {
    const stats = new Map<string, CampaignQueueStats>();

    for (const row of submissionQueue.data ?? []) {
      const campaignId = row.opportunity?.id;
      if (!campaignId) continue;

      const current =
        stats.get(campaignId) ??
        {
          acceptedCreators: 0,
          submissions: 0,
          approvals: 0,
          contentAwaitingApproval: 0,
          paymentProductPending: 0
        };

      current.acceptedCreators += 1;
      if (row.submission) {
        current.submissions += 1;
        if (row.submission.verification_status === "verified") {
          current.approvals += 1;
          if (getPaymentProductStatus(row.opportunity, row.submission) !== "Complete") {
            current.paymentProductPending += 1;
          }
        }
        if (row.submission.verification_status === "pending") {
          current.contentAwaitingApproval += 1;
        }
      }

      stats.set(campaignId, current);
    }

    return stats;
  }, [submissionQueue.data]);
  const emptyQueueStats: CampaignQueueStats = {
    acceptedCreators: 0,
    submissions: 0,
    approvals: 0,
    contentAwaitingApproval: 0,
    paymentProductPending: 0
  };
  const contentAwaitingApproval = useMemo(
    () => Array.from(campaignQueueStats.values()).reduce((sum, stats) => sum + stats.contentAwaitingApproval, 0),
    [campaignQueueStats]
  );
  const paymentProductPending = useMemo(
    () => Array.from(campaignQueueStats.values()).reduce((sum, stats) => sum + stats.paymentProductPending, 0),
    [campaignQueueStats]
  );
  const firstApplicantCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.pending_applications > 0),
    [campaigns]
  );

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing campaign control."
        description="BudCast is checking your account before loading campaign briefs and creator applications."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Your brand profile is almost ready."
        description="Finish setup so creators can understand your cannabis brand before applying."
      />
    );
  }

  if (profile?.user_type && !brandContext) {
    return (
      <main className="grid-overlay min-h-screen px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Card className="p-8">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-[#e7ff9a]">Creator account</div>
            <h1 className="mt-3 text-5xl font-black leading-tight tracking-[-0.04em] text-[#fbfbf7]">
              The brand dashboard is desktop-first.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#c7ccc2]">
              Your creator experience lives in the BudCast mobile app — browse campaigns, apply, submit content, and track payment status from your phone.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link href="/creator-dashboard">Go to creator dashboard</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/profile">View profile</Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <>
      <RouteBrandMobileDashboard
        activeTab="Campaigns"
        brandDisplayName={brandDisplayName}
        campaignQueueStats={campaignQueueStats}
        campaigns={campaigns}
        contentAwaitingApproval={contentAwaitingApproval}
        emptyQueueStats={emptyQueueStats}
        firstApplicantCampaign={firstApplicantCampaign}
        isCampaignsLoading={isCampaignsLoading}
        paymentProductPending={paymentProductPending}
        pendingApplicants={pendingApplicants}
        profile={profile}
        profileStrength={profileStrength}
        submissionRows={submissionQueue.data ?? []}
      />
      <div className="hidden md:block">
        <BrandShell>
      <div className="grid gap-5">
        <header className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(184,255,61,0.1),transparent_34%),linear-gradient(180deg,rgba(19,16,13,0.94),rgba(8,7,5,0.96))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)] md:p-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center">
            <div className="flex min-w-0 gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[22px] border border-[#b8ff3d]/[0.24] bg-[#120b08] text-lg font-black text-[#e7ff9a] shadow-[0_18px_40px_rgba(0,0,0,0.28)] md:h-20 md:w-20 md:rounded-[26px]">
                {profile?.avatar_url ? (
                  <img alt="" className="h-full w-full object-cover" src={profile.avatar_url} />
                ) : (
                  getInitials(brandDisplayName) || "BC"
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Brand command</div>
                <h1 className="mt-2 text-4xl font-black leading-[0.94] tracking-[-0.055em] text-[#fbfbf7] md:text-6xl">
                  Welcome back, {brandDisplayName}.
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-[#c6b8ad] md:text-base">
                  Track posted campaigns, creator applicants, content approvals, and payment or product follow-up from one
                  command home.
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-[#aeb5aa]">
                  <span className="inline-flex items-center gap-1.5">
                    <Globe2 className="h-4 w-4 text-[#e7ff9a]" />
                    {profile?.website || "Website not added"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#e7ff9a]" />
                    {profile?.location || "Location not added"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/[0.22] p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#83766e]">
                    Brand profile strength
                  </div>
                  <div className="mt-2 text-4xl font-black leading-none tracking-[-0.05em] text-[#fbfbf7]">
                    {profileStrength}%
                  </div>
                </div>
                <ShieldCheck className="h-6 w-6 text-[#e7ff9a]" />
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#b8ff3d]" style={{ width: `${profileStrength}%` }} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/dashboard/campaigns/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Post campaign
                  </Link>
                </Button>
                {firstApplicantCampaign ? (
                  <Button asChild variant="secondary">
                    <Link href={`/dashboard/campaigns/${firstApplicantCampaign.id}/applicants`}>
                      Review applicants
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="secondary">
                    <Link href="/dashboard/submissions">Approve content</Link>
                  </Button>
                )}
                <Button asChild variant="ghost">
                  <Link href="/profile/edit">Brand Kit</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <BrandActionCard
            actionHref="/dashboard/campaigns/new"
            actionLabel="Post"
            description={`${formatCount("campaign", campaigns.length)} live for creator applications.`}
            icon={CheckCircle2}
            title="Campaigns live"
            value={campaigns.length}
          />
          <BrandActionCard
            actionHref={
              firstApplicantCampaign ? `/dashboard/campaigns/${firstApplicantCampaign.id}/applicants` : "/dashboard"
            }
            actionLabel="Review"
            description={`${formatCount("applicant", pendingApplicants)} waiting for a brand decision.`}
            icon={UsersRound}
            title="Applicants waiting"
            tone="coral"
            value={pendingApplicants}
          />
          <BrandActionCard
            actionHref="/dashboard/submissions"
            actionLabel="Approve"
            description={`${formatCount("submission", contentAwaitingApproval)} needing approval or revision notes.`}
            icon={FileCheck2}
            title="Content needs review"
            tone="gold"
            value={contentAwaitingApproval}
          />
          <BrandActionCard
            actionHref="/dashboard/submissions"
            actionLabel="Confirm"
            description={`${formatCount("assignment", paymentProductPending)} pending payment/product confirmation.`}
            icon={WalletCards}
            title="Payment/product pending"
            tone="green"
            value={paymentProductPending}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4">
            <div className="flex flex-wrap items-end justify-between gap-4 px-1">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Campaign board</div>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7] md:text-4xl">
                  Posted campaigns
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#aeb5aa]">
                  See what is live, who applied, what content needs review, and which payments or product confirmations
                  still need action.
                </p>
              </div>
              {campaignsQuery.isLoading ? <div className="text-sm font-semibold text-[#aeb5aa]">Loading campaigns...</div> : null}
            </div>

            {isCampaignsLoading ? (
              <div className="rounded-[30px] border border-white/10 bg-[#0d0a08] px-6 py-12 text-center">
                <p className="text-lg font-black text-[#fbfbf7]">Loading live campaigns...</p>
                <p className="mt-2 text-sm font-medium leading-6 text-[#aeb5aa]">Loading campaign briefs.</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-white/14 bg-[#0d0a08] px-6 py-12 text-center">
                <p className="text-lg font-black text-[#fbfbf7]">No active campaigns yet.</p>
                <p className="mt-2 text-sm font-medium leading-6 text-[#aeb5aa]">
                  Post a campaign when your brand needs creators.
                </p>
                <Button asChild className="mt-5">
                  <Link href="/dashboard/campaigns/new">Post campaign</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {campaigns.map((campaign) => {
                  const stats = campaignQueueStats.get(campaign.id) ?? emptyQueueStats;
                  const nextAction = getCampaignNextAction(campaign, stats);

                  return (
                    <BrandCampaignCard
                      campaign={campaign}
                      key={campaign.id}
                      nextAction={nextAction}
                      stats={stats}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <aside className="grid gap-3 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-[30px] border border-white/10 bg-[#0d0a08] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Next best action</div>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                Keep campaigns moving.
              </h3>
              <p className="mt-3 text-sm font-medium leading-6 text-[#aeb5aa]">
                Review applicants first, approve submitted content second, then confirm payment or product status after
                content is approved.
              </p>
              <div className="mt-5 grid gap-2">
                <Link
                  className="inline-flex items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-[#fbfbf7] transition hover:border-[#b8ff3d]/[0.28] hover:text-[#e7ff9a]"
                  href={firstApplicantCampaign ? `/dashboard/campaigns/${firstApplicantCampaign.id}/applicants` : "/dashboard/campaigns/new"}
                >
                  Review creator applications
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  className="inline-flex items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-[#fbfbf7] transition hover:border-[#b8ff3d]/[0.28] hover:text-[#e7ff9a]"
                  href="/dashboard/submissions"
                >
                  Open content review
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[#0d0a08] p-5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#83766e]">
                <Clock3 className="h-4 w-4 text-[#e7ff9a]" />
                Brand profile
              </div>
              <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-[#c7ccc2]">
                {profile?.bio || "Add a brand bio so creators understand your product standards before applying."}
              </p>
              <div className="mt-4 rounded-[22px] border border-[#b8ff3d]/14 bg-[#b8ff3d]/8 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">Brand Kit</div>
                <p className="mt-2 text-xs font-semibold leading-5 text-[#c7ccc2]">
                  Upload logos, product visuals, packaging shots, and creator-ready references.
                </p>
              </div>
              <SocialPlatformGrid className="mt-4 grid-cols-1" items={getBrandSocialPlatformItems(profile)} />
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-black text-[#d8ded1] transition hover:border-[#b8ff3d]/[0.24] hover:text-[#fbfbf7]"
                  href="/profile"
                >
                  Edit profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-black text-[#d8ded1] transition hover:border-[#b8ff3d]/[0.24] hover:text-[#fbfbf7]"
                  href="/profile/edit"
                >
                  Open Brand Kit
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                {profile?.id ? (
                  <Link
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-black text-[#d8ded1] transition hover:border-[#b8ff3d]/[0.24] hover:text-[#fbfbf7]"
                    href={`/brands/${profile.id}`}
                  >
                    Public profile
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>
          </aside>
        </section>
      </div>
        </BrandShell>
      </div>
    </>
  );
}
