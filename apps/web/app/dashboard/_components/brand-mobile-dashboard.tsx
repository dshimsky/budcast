"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Repeat2,
  Search,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import {
  formatCount,
  formatDeadline,
  formatPostType,
  getCompensationLabel,
  getPaymentProductStatus
} from "@budcast/shared";
import { BrandMobileBottomNav } from "../../../components/brand-mobile";
import { BudCastLogo } from "../../../components/budcast-logo";
import { BudCastSocialFeed } from "../../../components/social-feed";

export type BrandMobileTab = "Campaigns" | "Feed" | "Messages" | "Review";

export type BrandMobileProfile = {
  avatar_url?: string | null;
  company_name?: string | null;
  id?: string | null;
  location?: string | null;
  name?: string | null;
  website?: string | null;
};

export type BrandMobileCampaign = {
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

export type BrandMobileQueueStats = {
  acceptedCreators: number;
  submissions: number;
  approvals: number;
  contentAwaitingApproval: number;
  paymentProductPending: number;
};

export type BrandMobileSubmissionRow = {
  accepted_at?: string | null;
  completion_deadline?: string | null;
  id: string;
  message?: string | null;
  creator: {
    avatar_url?: string | null;
    id: string;
    instagram?: string | null;
    name?: string | null;
    niches?: string[] | null;
    review_count?: number | null;
    review_score?: number | null;
    tiktok?: string | null;
    youtube?: string | null;
  } | null;
  opportunity: {
    application_deadline?: string | null;
    campaign_type: "gifting" | "paid" | "hybrid";
    content_types?: string[] | null;
    id: string;
    title: string;
  } | null;
  submission: {
    created_at?: string | null;
    id: string;
    payment_confirmed_by_brand: boolean;
    payment_confirmed_by_creator: boolean;
    post_type?: string | null;
    post_url?: string | null;
    verification_status: "pending" | "verified" | "failed" | "needs_revision";
  } | null;
};

export type BrandMobileDashboardProps = {
  activeTab: BrandMobileTab;
  brandDisplayName: string;
  campaigns: BrandMobileCampaign[];
  campaignQueueStats: Map<string, BrandMobileQueueStats>;
  contentAwaitingApproval: number;
  emptyQueueStats: BrandMobileQueueStats;
  firstApplicantCampaign?: BrandMobileCampaign;
  isCampaignsLoading: boolean;
  paymentProductPending: number;
  pendingApplicants: number;
  profile?: BrandMobileProfile | null;
  profileStrength: number;
  submissionRows: BrandMobileSubmissionRow[];
};

const brandMobileNavItems = [
  { href: "/dashboard", label: "Campaigns" as const },
  { href: "/dashboard/feed", label: "Feed" as const },
  { href: "/dashboard/messages", label: "Messages" as const },
  { href: "/dashboard/review", label: "Review" as const },
  { href: "/profile", label: "Profile" as const }
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getCampaignNextAction(campaign: { id: string; pending_applications: number }, stats: BrandMobileQueueStats) {
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

function getCampaignStatus(campaign: { pending_applications: number }, stats: BrandMobileQueueStats) {
  if (campaign.pending_applications > 0) return "Applicants waiting";
  if (stats.contentAwaitingApproval > 0) return "Content review";
  if (stats.paymentProductPending > 0) return "Payment/product pending";
  return "Live";
}

function getCreatorDisplayName(row: BrandMobileSubmissionRow) {
  return row.creator?.name || row.creator?.instagram || row.creator?.tiktok || "Creator";
}

function getCreatorHandle(row: BrandMobileSubmissionRow) {
  return row.creator?.instagram || row.creator?.tiktok || row.creator?.youtube || "creator";
}

function getMobileBrandSubmissionStatus(submission: BrandMobileSubmissionRow["submission"]) {
  if (!submission) return "Submitted";
  if (submission.verification_status === "pending") return "Needs review";
  if (submission.verification_status === "needs_revision") return "Revision requested";
  if (submission.verification_status === "verified") return "Approved";
  if (submission.verification_status === "failed") return "Revision requested";
  return "Submitted";
}

function getThreadTimestamp(row: BrandMobileSubmissionRow) {
  const source = row.submission?.created_at || row.accepted_at;
  if (!source) return "Active";
  const time = new Date(source).getTime();
  if (Number.isNaN(time)) return "Active";

  const diff = Date.now() - time;
  const hour = 1000 * 60 * 60;
  const day = hour * 24;

  if (diff < hour) return "Now";
  if (diff < day) return `${Math.max(Math.floor(diff / hour), 1)}h`;
  if (diff < day * 7) return `${Math.max(Math.floor(diff / day), 1)}d`;
  return new Date(source).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getMessageThreadPreview(row: BrandMobileSubmissionRow) {
  if (!row.submission) return "Accepted creator. Coordinate campaign details, timing, deliverables, and payment expectations.";
  if (row.submission.verification_status === "pending") return "Content submitted. Review the link and approve or request changes.";
  if (row.submission.verification_status === "needs_revision" || row.submission.verification_status === "failed") {
    return "Revision requested. Keep notes clear so the creator can resubmit quickly.";
  }
  if (row.submission.verification_status === "verified") {
    const paymentStatus = getPaymentProductStatus(row.opportunity, row.submission);
    if (paymentStatus !== "Complete") return `${paymentStatus}. Confirm next steps with the creator.`;
    return "Assignment complete. Keep the relationship warm for future campaigns.";
  }
  return row.message || "Campaign coordination thread.";
}

function getMessageThreadAction(row: BrandMobileSubmissionRow) {
  if (!row.submission) return "Coordinate";
  if (row.submission.verification_status === "pending") return "Review";
  if (row.submission.verification_status === "verified") return "Confirm";
  return "Open";
}

function getMessageThreadTone(row: BrandMobileSubmissionRow) {
  if (!row.submission) return "Accepted";
  if (row.submission.verification_status === "pending") return "Content sent";
  if (row.submission.verification_status === "verified") return getPaymentProductStatus(row.opportunity, row.submission);
  return getMobileBrandSubmissionStatus(row.submission);
}

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

function CampaignMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-3">
      <div className="text-2xl font-black leading-none text-[#fbfbf7]">{value}</div>
      <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#83766e]">{label}</div>
    </div>
  );
}

function BrandMobileCampaignCard({
  campaign,
  stats
}: {
  campaign: BrandMobileCampaign;
  stats: BrandMobileQueueStats;
}) {
  const compensationLabel = getCompensationLabel(campaign);
  const statusLabel = getCampaignStatus(campaign, stats);
  const spotsOpen = Math.max(campaign.slots_available - campaign.slots_filled, 0);
  const nextAction = getCampaignNextAction(campaign, stats);

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
  title
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <section>
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

function BrandReviewSummaryCard({
  contentAwaitingApproval,
  paymentProductPending,
  pendingApplicants
}: {
  contentAwaitingApproval: number;
  paymentProductPending: number;
  pendingApplicants: number;
}) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(184,255,61,0.15),transparent_38%),linear-gradient(180deg,rgba(20,14,10,0.96),rgba(8,6,5,0.98))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.46)]">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">Needs a brand decision</div>
      <h3 className="mt-2 text-2xl font-black leading-tight tracking-[-0.055em] text-[#fbfbf7]">
        Move creators from application to approval.
      </h3>
      <p className="mt-2 text-sm font-medium leading-6 text-[#c7ccc2]">
        Review creator applicants first, then approve submitted content and confirm payment or product status.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <CampaignMetric label="Applicants" value={pendingApplicants} />
        <CampaignMetric label="Content" value={contentAwaitingApproval} />
        <CampaignMetric label="Pay/product" value={paymentProductPending} />
      </div>
    </div>
  );
}

function BrandReviewLane({
  children,
  count,
  title
}: {
  children: ReactNode;
  count: number;
  title: string;
}) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-black tracking-[-0.04em] text-[#fbfbf7]">{title}</h3>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#c7ccc2]">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function BrandReviewEmptyCard({ body }: { body: string }) {
  return (
    <div className="rounded-[26px] border border-dashed border-white/14 bg-white/[0.035] p-5 text-sm font-medium leading-6 text-[#aeb5aa]">
      {body}
    </div>
  );
}

function BrandApplicantReviewCard({ campaign }: { campaign: BrandMobileCampaign }) {
  return (
    <Link
      className="rounded-[28px] border border-[#b8ff3d]/20 bg-[linear-gradient(135deg,rgba(184,255,61,0.1),transparent_44%),#0c0907] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.32)] transition hover:border-[#b8ff3d]/35"
      href={`/dashboard/campaigns/${campaign.id}/applicants`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full border border-[#b8ff3d]/25 bg-[#b8ff3d]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#e7ff9a]">
          Applicants waiting
        </span>
        <span className="text-xs font-black text-[#e7ff9a]">
          Review
          <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
        </span>
      </div>
      <h4 className="mt-3 text-xl font-black leading-tight tracking-[-0.045em] text-[#fbfbf7]">{campaign.title}</h4>
      <p className="mt-2 text-sm font-medium leading-5 text-[#c7ccc2]">
        {formatCount("creator", campaign.pending_applications)} waiting. {formatDeadline(campaign.application_deadline)}.
      </p>
    </Link>
  );
}

function BrandSubmissionReviewCard({
  actionLabel,
  row,
  statusLabel
}: {
  actionLabel: string;
  row: BrandMobileSubmissionRow;
  statusLabel: string;
}) {
  const creatorName = getCreatorDisplayName(row);
  const creatorHandle = getCreatorHandle(row);
  const creatorInitials = getInitials(creatorName) || "CR";
  const campaignId = row.opportunity?.id;

  return (
    <Link
      className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_45%),#0c0907] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.32)] transition hover:border-[#b8ff3d]/25"
      href={campaignId ? `/dashboard/submissions?campaign=${campaignId}` : "/dashboard/submissions"}
    >
      <div className="flex gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.045] text-xs font-black text-[#e7ff9a]">
          {row.creator?.avatar_url ? (
            <img alt="" className="h-full w-full object-cover" src={row.creator.avatar_url} />
          ) : (
            creatorInitials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#c7ccc2]">
              {statusLabel}
            </span>
            <span className="rounded-full border border-[#d7b46a]/30 bg-[#d7b46a]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#f0d28d]">
              {formatPostType(row.submission?.post_type)}
            </span>
          </div>
          <h4 className="mt-3 text-lg font-black leading-tight tracking-[-0.035em] text-[#fbfbf7]">{creatorName}</h4>
          <p className="mt-1 text-xs font-bold text-[#aeb5aa]">@{creatorHandle}</p>
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-[#c7ccc2]">
            {row.opportunity?.title || "Campaign assignment"}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-xs font-bold text-[#aeb5aa]">Open submission queue</span>
        <span className="text-xs font-black text-[#e7ff9a]">
          {actionLabel}
          <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

function BrandCampaignsView({
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
}: BrandMobileDashboardProps) {
  const avatarFallback = getInitials(brandDisplayName) || "BC";

  return (
    <BrandMobileSection eyebrow="Brand command" title={`Welcome back, ${brandDisplayName}.`}>
      <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(184,255,61,0.16),transparent_36%),linear-gradient(180deg,rgba(20,14,10,0.96),rgba(8,6,5,0.98))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.48)]">
        <div className="flex gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[22px] border border-[#b8ff3d]/[0.24] bg-[#120b08] text-lg font-black text-[#e7ff9a]">
            {profile?.avatar_url ? <img alt="" className="h-full w-full object-cover" src={profile.avatar_url} /> : avatarFallback}
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

        <Link
          className="mt-3 flex items-center justify-between gap-3 rounded-[24px] border border-[#b8ff3d]/16 bg-[#b8ff3d]/10 px-4 py-3 text-left shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
          href="/profile/edit"
        >
          <span>
            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">Brand Kit</span>
            <span className="mt-1 block text-sm font-semibold leading-5 text-[#d8ded1]">
              Logos, product visuals, packaging shots, and creator-ready references.
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-[#e7ff9a]" />
        </Link>
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
            return <BrandMobileCampaignCard campaign={campaign} key={campaign.id} stats={stats} />;
          })
        )}
      </div>
    </BrandMobileSection>
  );
}

function FeedActionRow({ primaryAction, primaryHref }: { primaryAction?: string; primaryHref?: string }) {
  return (
    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
      <div className="flex items-center gap-5 text-[#83766e]">
        <span className="inline-flex items-center gap-1.5 text-xs font-black">
          <MessageCircle className="h-4 w-4" />
          12
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-black">
          <Repeat2 className="h-4 w-4" />
          4
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-black">
          <Heart className="h-4 w-4" />
          38
        </span>
        <Bookmark className="h-4 w-4" />
      </div>
      {primaryAction && primaryHref ? (
        <Link className="text-xs font-black text-[#e7ff9a]" href={primaryHref}>
          {primaryAction}
          <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

function FeedPostShell({
  avatar,
  avatarFallback,
  children,
  handle,
  name,
  timestamp
}: {
  avatar?: string | null;
  avatarFallback: string;
  children: ReactNode;
  handle: string;
  name: string;
  timestamp: string;
}) {
  return (
    <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_42%),#0c0907] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.045] text-xs font-black text-[#e7ff9a]">
          {avatar ? <img alt="" className="h-full w-full object-cover" src={avatar} /> : avatarFallback}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[15px] font-black text-[#fbfbf7]">{name}</div>
              <div className="mt-0.5 truncate text-xs font-bold text-[#83766e]">
                @{handle} · {timestamp}
              </div>
            </div>
            <button
              aria-label="Post actions"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#83766e] transition hover:bg-white/[0.055] hover:text-[#fbfbf7]"
              type="button"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </article>
  );
}

function CreatorWorkFeedPost({ row }: { row: BrandMobileSubmissionRow }) {
  const creatorName = getCreatorDisplayName(row);
  const creatorHandle = getCreatorHandle(row);
  const creatorInitials = getInitials(creatorName) || "CR";

  return (
    <FeedPostShell
      avatar={row.creator?.avatar_url}
      avatarFallback={creatorInitials}
      handle={creatorHandle}
      name={creatorName}
      timestamp={getThreadTimestamp(row)}
    >
      <p className="mt-3 text-sm font-medium leading-6 text-[#d8ded1]">
        Wrapped content for{" "}
        <span className="font-black text-[#fbfbf7]">{row.opportunity?.title || "a BudCast campaign"}</span>. Brand
        review is moving through BudCast.
      </p>
      <div className="mt-3 overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(184,255,61,0.18),transparent_34%),linear-gradient(135deg,#20120d,#090706)]">
        <div className="grid aspect-[4/5] place-items-center">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-black/25 text-[#e7ff9a] backdrop-blur">
            <Sparkles className="h-7 w-7" />
          </div>
        </div>
        <div className="border-t border-white/10 p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e7ff9a]">
            {formatPostType(row.submission?.post_type)}
          </div>
          <div className="mt-1 text-sm font-black text-[#fbfbf7]">Creator content preview</div>
        </div>
      </div>
      <FeedActionRow primaryAction="Open review" primaryHref="/dashboard/review" />
    </FeedPostShell>
  );
}

function BrandOpportunityFeedPost({ campaign }: { campaign: BrandMobileCampaign }) {
  const compensationLabel = getCompensationLabel(campaign);

  return (
    <FeedPostShell avatar={null} avatarFallback="BC" handle="budcast-brand" name="BudCast Opportunity" timestamp="Live">
      <p className="mt-3 text-sm font-medium leading-6 text-[#d8ded1]">
        New creator campaign is live: <span className="font-black text-[#fbfbf7]">{campaign.title}</span>
      </p>
      <div className="mt-3 rounded-[24px] border border-[#b8ff3d]/20 bg-[#071007] p-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#d7b46a]/30 bg-[#d7b46a]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#f0d28d]">
            {compensationLabel}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#c7ccc2]">
            {formatDeadline(campaign.application_deadline)}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <CampaignMetric label="Open spots" value={Math.max(campaign.slots_available - campaign.slots_filled, 0)} />
          <CampaignMetric label="Applicants" value={campaign.pending_applications} />
        </div>
      </div>
      <FeedActionRow primaryAction="View campaign" primaryHref={`/dashboard/campaigns/${campaign.id}`} />
    </FeedPostShell>
  );
}

function BrandUpdateFeedPost({ brandDisplayName, profile }: Pick<BrandMobileDashboardProps, "brandDisplayName" | "profile">) {
  const avatarFallback = getInitials(brandDisplayName) || "BC";

  return (
    <FeedPostShell
      avatar={profile?.avatar_url}
      avatarFallback={avatarFallback}
      handle={(brandDisplayName || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "brand"}
      name={brandDisplayName}
      timestamp="Today"
    >
      <p className="mt-3 text-sm font-medium leading-6 text-[#d8ded1]">
        Posting campaign updates, new drops, store news, and creator opportunities here helps creators understand what
        your brand is building before they apply.
      </p>
      <div className="mt-3 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e7ff9a]">Brand update</div>
        <h4 className="mt-2 text-lg font-black leading-tight tracking-[-0.04em] text-[#fbfbf7]">
          Launch posts, new deals, store openings, and creator calls belong in the feed.
        </h4>
      </div>
      <FeedActionRow primaryAction="Edit profile" primaryHref="/profile" />
    </FeedPostShell>
  );
}

function MarketplaceSignalFeedPost({ campaigns }: Pick<BrandMobileDashboardProps, "campaigns">) {
  const applicantCount = campaigns.reduce((sum, campaign) => sum + campaign.pending_applications, 0);

  return (
    <FeedPostShell avatar={null} avatarFallback="BC" handle="budcast" name="BudCast Network" timestamp="Now">
      <p className="mt-3 text-sm font-medium leading-6 text-[#d8ded1]">
        Marketplace signal: {formatCount("creator application", applicantCount)} across live brand campaigns. Keep review
        times fast to maintain creator momentum.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-[24px] border border-white/10 bg-white/[0.035] p-3">
        <CampaignMetric label="Live campaigns" value={campaigns.length} />
        <CampaignMetric label="Applications" value={applicantCount} />
      </div>
      <FeedActionRow primaryAction="Review queue" primaryHref="/dashboard/review" />
    </FeedPostShell>
  );
}

export function BrandFeedView({
  brandDisplayName,
  campaigns,
  profile,
  submissionRows
}: Pick<BrandMobileDashboardProps, "brandDisplayName" | "campaigns" | "profile" | "submissionRows">) {
  const completedRows = submissionRows.filter((row) => row.submission?.verification_status === "verified").slice(0, 2);
  const campaignPosts = campaigns.slice(0, 2);

  return (
    <BrandMobileSection eyebrow="Brand feed" title="Feed">
      <div className="grid gap-4">
        <BudCastSocialFeed
          viewer={{
            avatarFallback: getInitials(brandDisplayName) || "BC",
            avatarUrl: profile?.avatar_url,
            displayName: brandDisplayName,
            handle:
              (brandDisplayName || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
              "brand"
          }}
        >
          <BrandUpdateFeedPost brandDisplayName={brandDisplayName} profile={profile} />
          {campaignPosts.map((campaign) => (
            <BrandOpportunityFeedPost campaign={campaign} key={campaign.id} />
          ))}
          {completedRows.map((row) => (
            <CreatorWorkFeedPost key={row.id} row={row} />
          ))}
          <MarketplaceSignalFeedPost campaigns={campaigns} />
        </BudCastSocialFeed>
      </div>
    </BrandMobileSection>
  );
}

function BrandMessageThreadCard({ row }: { row: BrandMobileSubmissionRow }) {
  const creatorName = getCreatorDisplayName(row);
  const creatorHandle = getCreatorHandle(row);
  const creatorInitials = getInitials(creatorName) || "CR";
  const campaignId = row.opportunity?.id;
  const hasAction =
    !row.submission ||
    row.submission.verification_status === "pending" ||
    (row.submission.verification_status === "verified" &&
      getPaymentProductStatus(row.opportunity, row.submission) !== "Complete");

  return (
    <Link
      className="group flex gap-3 border-b border-white/10 px-1 py-4 transition last:border-b-0 active:scale-[0.99]"
      href={campaignId ? `/dashboard/submissions?campaign=${campaignId}` : "/dashboard/submissions"}
    >
      <div className="relative h-14 w-14 shrink-0">
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.045] text-xs font-black text-[#e7ff9a]">
          {row.creator?.avatar_url ? (
            <img alt="" className="h-full w-full object-cover" src={row.creator.avatar_url} />
          ) : (
            creatorInitials
          )}
        </div>
        {hasAction ? (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#030303] bg-[#b8ff3d] shadow-[0_0_18px_rgba(184,255,61,0.5)]" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[15px] font-black text-[#fbfbf7]">{creatorName}</div>
            <div className="mt-0.5 truncate text-xs font-bold text-[#83766e]">@{creatorHandle}</div>
          </div>
          <div className="shrink-0 text-[11px] font-black text-[#83766e]">{getThreadTimestamp(row)}</div>
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-[#c7ccc2]">{getMessageThreadPreview(row)}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="min-w-0 truncate rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#c7ccc2]">
            {getMessageThreadTone(row)}
          </span>
          <span className="shrink-0 text-xs font-black text-[#e7ff9a]">
            {getMessageThreadAction(row)}
            <ArrowRight className="ml-1 inline h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BrandMessagesView({
  firstApplicantCampaign,
  submissionRows
}: Pick<BrandMobileDashboardProps, "firstApplicantCampaign" | "submissionRows">) {
  const activeThreads = submissionRows.filter((row) => row.opportunity);
  const priorityThreadCount = activeThreads.filter(
    (row) =>
      !row.submission ||
      row.submission.verification_status === "pending" ||
      (row.submission.verification_status === "verified" &&
        getPaymentProductStatus(row.opportunity, row.submission) !== "Complete")
  ).length;

  return (
    <BrandMobileSection eyebrow="Coordination" title="Messages">
      <div className="grid gap-4">
        <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(184,255,61,0.14),transparent_38%),linear-gradient(180deg,rgba(20,14,10,0.96),rgba(8,6,5,0.98))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.46)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black leading-tight tracking-[-0.055em] text-[#fbfbf7]">Campaign inbox</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-[#c7ccc2]">
                Coordinate campaign details, deliverables, review notes, and payment expectations with accepted creators.
              </p>
            </div>
            <span className="rounded-full border border-[#b8ff3d]/25 bg-[#b8ff3d]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#e7ff9a]">
              {priorityThreadCount} active
            </span>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {["Priority", "Creators", "Product status", "Payments"].map((filter, index) => (
              <span
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${
                  index === 0
                    ? "bg-[#b8ff3d] text-[#071007]"
                    : "border border-white/10 bg-white/[0.04] text-[#c7ccc2]"
                }`}
                key={filter}
              >
                {filter}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0c0907] px-4 shadow-[0_24px_70px_rgba(0,0,0,0.36)]">
          {activeThreads.length > 0 ? (
            activeThreads.map((row) => <BrandMessageThreadCard key={row.id} row={row} />)
          ) : (
            <div className="py-8 text-center">
              <div className="text-lg font-black text-[#fbfbf7]">No active creator threads yet.</div>
              <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-6 text-[#aeb5aa]">
                Accept creators from campaign applications to start coordination threads.
              </p>
              <Link
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#b8ff3d] px-4 py-2.5 text-xs font-black text-[#071007]"
                href={firstApplicantCampaign ? `/dashboard/campaigns/${firstApplicantCampaign.id}/applicants` : "/dashboard"}
              >
                Review applicants
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        <BrandMobilePreviewCard
          action="Open review"
          body="Need to approve content or confirm payment/product status? Open the review queue."
          href="/dashboard/review"
          title="Move threads into decisions"
        />
      </div>
    </BrandMobileSection>
  );
}

export function BrandReviewView({
  campaigns,
  contentAwaitingApproval,
  firstApplicantCampaign,
  paymentProductPending,
  pendingApplicants,
  submissionRows
}: Pick<
  BrandMobileDashboardProps,
  | "campaigns"
  | "contentAwaitingApproval"
  | "firstApplicantCampaign"
  | "paymentProductPending"
  | "pendingApplicants"
  | "submissionRows"
>) {
  const applicantCampaigns = campaigns.filter((campaign) => campaign.pending_applications > 0);
  const contentRows = submissionRows.filter((row) => row.submission?.verification_status === "pending");
  const paymentRows = submissionRows.filter(
    (row) =>
      row.submission?.verification_status === "verified" &&
      getPaymentProductStatus(row.opportunity, row.submission) !== "Complete"
  );

  return (
    <BrandMobileSection eyebrow="Approval queue" title="Review">
      <div className="grid gap-5">
        <BrandReviewSummaryCard
          contentAwaitingApproval={contentAwaitingApproval}
          paymentProductPending={paymentProductPending}
          pendingApplicants={pendingApplicants}
        />

        <BrandReviewLane count={pendingApplicants} title="Applicants waiting">
          {applicantCampaigns.length > 0 ? (
            applicantCampaigns.map((campaign) => <BrandApplicantReviewCard campaign={campaign} key={campaign.id} />)
          ) : (
            <BrandReviewEmptyCard body="No creator applications need a decision right now." />
          )}
        </BrandReviewLane>

        <BrandReviewLane count={contentRows.length} title="Content needing approval">
          {contentRows.length > 0 ? (
            contentRows.map((row) => (
              <BrandSubmissionReviewCard
                actionLabel="Approve content"
                key={row.id}
                row={row}
                statusLabel={getMobileBrandSubmissionStatus(row.submission)}
              />
            ))
          ) : (
            <BrandReviewEmptyCard body="No submitted content is waiting for brand approval." />
          )}
        </BrandReviewLane>

        <BrandReviewLane count={paymentRows.length} title="Payment/product follow-up">
          {paymentRows.length > 0 ? (
            paymentRows.map((row) => (
              <BrandSubmissionReviewCard
                actionLabel="Confirm status"
                key={row.id}
                row={row}
                statusLabel={getPaymentProductStatus(row.opportunity, row.submission)}
              />
            ))
          ) : (
            <BrandReviewEmptyCard body="No approved assignments need payment or product confirmation." />
          )}
        </BrandReviewLane>

        {firstApplicantCampaign && applicantCampaigns.length === 0 ? (
          <BrandMobilePreviewCard
            action="Review"
            body="A campaign has application activity ready for a closer look."
            href={`/dashboard/campaigns/${firstApplicantCampaign.id}/applicants`}
            title="Open creator applicants"
          />
        ) : null}
      </div>
    </BrandMobileSection>
  );
}

export function BrandMobileDashboard(props: BrandMobileDashboardProps) {
  const avatarFallback = getInitials(props.brandDisplayName) || "BC";

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] pb-28 text-[#fbfbf7] md:hidden">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#030303]/92 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <BudCastLogo href="/dashboard" size="sm" variant="mark" />
            <div className="min-w-0">
              <div className="text-sm font-black leading-none text-[#fbfbf7]">BudCast</div>
              <div className="mt-1 truncate text-[11px] font-semibold text-[#aeb5aa]">{props.brandDisplayName}</div>
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
        {props.activeTab === "Campaigns" ? <BrandCampaignsView {...props} /> : null}
        {props.activeTab === "Feed" ? (
          <BrandFeedView
            brandDisplayName={props.brandDisplayName}
            campaigns={props.campaigns}
            profile={props.profile}
            submissionRows={props.submissionRows}
          />
        ) : null}
        {props.activeTab === "Messages" ? (
          <BrandMessagesView
            firstApplicantCampaign={props.firstApplicantCampaign}
            submissionRows={props.submissionRows}
          />
        ) : null}
        {props.activeTab === "Review" ? (
          <BrandReviewView
            campaigns={props.campaigns}
            contentAwaitingApproval={props.contentAwaitingApproval}
            firstApplicantCampaign={props.firstApplicantCampaign}
            paymentProductPending={props.paymentProductPending}
            pendingApplicants={props.pendingApplicants}
            submissionRows={props.submissionRows}
          />
        ) : null}
      </div>

      <BrandMobileBottomNav
        activeTab={props.activeTab}
        avatarFallback={avatarFallback}
        avatarUrl={props.profile?.avatar_url}
        items={brandMobileNavItems}
      />
    </main>
  );
}
