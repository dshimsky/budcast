"use client";

import {
  type ApplicationWithOpportunity,
  type CampaignCatalogRow,
  type SubmissionPipelineRow,
  formatCount,
  formatDeadline,
  formatPostType,
  getCampaignFeedBadges,
  getCompensationValue,
  getPrimaryTrustBadge,
  getTrustBadgeDescriptors,
  getPlatformTarget,
  getPrimaryContentType,
  hasCompletedOnboarding,
  useAuth,
  useCreatorConfirmReceipt,
  useCreatorDeclineGifting,
  useMyApplications,
  useMyNicheCampaigns,
  useMySubmissionPipeline
} from "@budcast/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bookmark, Heart, MessageCircle, MoreHorizontal, Repeat2, Sparkles } from "lucide-react";
import {
  CampaignDropCard,
  CreatorSocialShell,
  CreatorWelcomeHomeCard,
  type CreatorSocialShellProps
} from "../../../components/creator-social";
import { BudCastDmInbox } from "../../../components/messaging";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";
import { BudCastSocialFeed } from "../../../components/social-feed";
import { TrustBadge } from "../../../components/marketplace/trust-badge";

type CreatorTab = CreatorSocialShellProps["activeTab"];

function getCreatorHandle(profile: ReturnType<typeof useAuth>["profile"]) {
  return profile?.instagram || profile?.tiktok || profile?.youtube || profile?.email?.split("@")[0] || "creator";
}

function getCreatorDisplayName(profile: ReturnType<typeof useAuth>["profile"]) {
  return profile?.name || profile?.email?.split("@")[0] || "Creator";
}

function getCreatorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getCreatorProfileStrength(profile: ReturnType<typeof useAuth>["profile"]) {
  if (!profile) return 0;
  const checks = [
    Boolean(profile.avatar_url),
    Boolean(profile.bio),
    Boolean(profile.instagram || profile.tiktok || profile.youtube),
    Boolean(profile.location),
    Boolean(profile.niches?.length),
    Boolean(profile.portfolio_image_urls?.length)
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function getCreatorFacingDescription(campaign: Pick<CampaignCatalogRow, "short_description" | "description">) {
  const source = campaign.short_description || campaign.description || "Campaign details are coming soon.";
  return source
    .replace(/free product/gi, "Product")
    .replace(/unpaid/gi, "Product")
    .replace(/gifting/gi, "Product")
    .replace(/gifted/gi, "Product")
    .replace(/hybrid/gi, "Paid + Product")
    .replace(/product-led/gi, "Product")
    .replace(/^\$[\d,]+\s+to\s+/i, "")
    .replace(/\bmake a 30-90 sec video\b/gi, "create a 30–90 sec UGC video")
    .replace(/\b30-90 sec video\b/gi, "30–90 sec UGC video")
    .replace(/\bmake a\b/gi, "create a")
    .replace(/\bmake an\b/gi, "create an")
    .replace(/^create\b/i, "Create")
    .replace(/^free\b/i, "Product")
    .replace(/\bfor creators who smoke every day\b/gi, "for everyday cannabis creators");
}

function getCreatorCompensationValue(campaign: Pick<CampaignCatalogRow, "campaign_type" | "cash_amount" | "product_description">) {
  return getCompensationValue(campaign)
    .replace(/\bfree\s+product\b/gi, "Product")
    .replace(/\bunpaid\b/gi, "Product")
    .replace(/\bgifting\b/gi, "Product")
    .replace(/\bgifted\b/gi, "Product")
    .replace(/\bhybrid\b/gi, "Paid + Product")
    .replace(/\bproduct-led\b/gi, "Product");
}

function getCreatorCompensationLabel(campaign: Pick<CampaignCatalogRow, "campaign_type">) {
  if (campaign.campaign_type === "paid") return "Paid";
  if (campaign.campaign_type === "gifting") return "Product";
  if (campaign.campaign_type === "hybrid") return "Paid + Product";
  return "Product";
}

function getCampaignWorkflowStatus(
  campaignId: string,
  application: ApplicationWithOpportunity | undefined,
  pipelineRows: SubmissionPipelineRow[]
) {
  if (!application) return "Open";
  if (application.status === "pending") return "Applied";
  if (application.status === "accepted") {
    const pipelineRow = pipelineRows.find((row) => row.opportunity_id === campaignId);
    const status = pipelineRow?.submission?.verification_status;
    if (!status) return "Submit content";
    if (status === "needs_revision" || status === "failed") return "Revision requested";
    if (status === "pending") return "Under review";
    if (status === "verified") return "Approved";
    return "View status";
  }
  return "View status";
}

function isDeadlineApproaching(application: ApplicationWithOpportunity) {
  if (!application.completion_deadline) return false;
  const deadline = new Date(application.completion_deadline).getTime();
  if (Number.isNaN(deadline)) return false;
  const diff = deadline - Date.now();
  return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 3;
}

function getSocialTimestamp(source?: string | null) {
  if (!source) return "Now";
  const time = new Date(source).getTime();
  if (Number.isNaN(time)) return "Now";

  const diff = Date.now() - time;
  const hour = 1000 * 60 * 60;
  const day = hour * 24;

  if (diff < hour) return "Now";
  if (diff < day) return `${Math.max(Math.floor(diff / hour), 1)}h`;
  if (diff < day * 7) return `${Math.max(Math.floor(diff / day), 1)}d`;
  return new Date(source).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SocialActionRow({ primaryAction, primaryHref }: { primaryAction?: string; primaryHref?: string }) {
  return (
    <div className="mt-4 flex items-center justify-between border-t border-white/[0.075] pt-3">
      <div className="flex items-center gap-2 text-[#aeb5aa]">
        <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/[0.035] px-3 text-xs font-black transition hover:bg-white/[0.055] hover:text-[#fbfbf7]">
          <MessageCircle className="h-4 w-4" />
          18
        </span>
        <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/[0.035] px-3 text-xs font-black transition hover:bg-white/[0.055] hover:text-[#fbfbf7]">
          <Repeat2 className="h-4 w-4" />
          7
        </span>
        <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/[0.035] px-3 text-xs font-black transition hover:bg-white/[0.055] hover:text-[#fbfbf7]">
          <Heart className="h-4 w-4" />
          64
        </span>
        <span className="hidden min-h-9 items-center rounded-full bg-white/[0.035] px-3 transition hover:bg-white/[0.055] hover:text-[#fbfbf7] sm:inline-flex">
          <Bookmark className="h-4 w-4" />
        </span>
      </div>
      {primaryAction && primaryHref ? (
        <Link className="inline-flex min-h-9 items-center rounded-full bg-[#b8ff3d]/10 px-3 text-xs font-black text-[#e7ff9a] transition hover:bg-[#b8ff3d]/16" href={primaryHref}>
          {primaryAction}
          <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

function SocialPostShell({
  avatar,
  avatarFallback,
  children,
  handle,
  name,
  trustBadge,
  timestamp
}: {
  avatar?: string | null;
  avatarFallback: string;
  children: React.ReactNode;
  handle: string;
  name: string;
  timestamp: string;
  trustBadge?: ReturnType<typeof getPrimaryTrustBadge>;
}) {
  return (
    <article className="rounded-[30px] border border-white/[0.075] bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_42%),#0c0907] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.34),0_1px_0_rgba(255,255,255,0.04)_inset]">
      <div className="flex items-start gap-3">
        <div className="premium-icon-surface grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-black text-[#e7ff9a]">
          {avatar ? <img alt="" className="h-full w-full object-cover" src={avatar} /> : avatarFallback}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <div className="truncate text-[15px] font-black text-[#fbfbf7]">{name}</div>
                {trustBadge ? <TrustBadge badge={trustBadge} size="micro" /> : null}
              </div>
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

function CreatorProofPost({
  creatorAvatarUrl,
  creatorBadge,
  creatorDisplayName,
  creatorHandle,
  creatorInitials,
  row
}: {
  creatorAvatarUrl?: string | null;
  creatorBadge?: ReturnType<typeof getPrimaryTrustBadge>;
  creatorDisplayName: string;
  creatorHandle: string;
  creatorInitials: string;
  row?: SubmissionPipelineRow;
}) {
  const brandName = row?.opportunity?.brand?.company_name || "Cannabis brand";
  const campaignTitle = row?.opportunity?.title || "UGC product content";

  return (
    <SocialPostShell
      avatar={creatorAvatarUrl}
      avatarFallback={creatorInitials}
      handle={creatorHandle}
      name={creatorDisplayName}
      timestamp={getSocialTimestamp(row?.submission?.created_at || row?.accepted_at)}
      trustBadge={creatorBadge}
    >
      <p className="mt-3 text-sm font-medium leading-6 text-[#d8ded1]">
        Finished a creator campaign for <span className="font-black text-[#fbfbf7]">{brandName}</span>:{" "}
        <span className="font-black text-[#fbfbf7]">{campaignTitle}</span>. This is the kind of proof brands should
        see before accepting creators.
      </p>
      <div className="mt-3 overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(184,255,61,0.18),transparent_34%),linear-gradient(135deg,#20120d,#090706)]">
        <div className="grid aspect-[4/5] place-items-center">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-black/25 text-[#e7ff9a] backdrop-blur">
            <Sparkles className="h-7 w-7" />
          </div>
        </div>
        <div className="border-t border-white/10 p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e7ff9a]">
            {formatPostType(row?.submission?.post_type)}
          </div>
          <div className="mt-1 text-sm font-black text-[#fbfbf7]">Creator work preview</div>
        </div>
      </div>
      <SocialActionRow primaryAction="View work" primaryHref="/creator-dashboard/work" />
    </SocialPostShell>
  );
}

function BrandOpportunityPost({ campaign }: { campaign: CampaignCatalogRow }) {
  const brandName = campaign.brand?.company_name ?? "Cannabis brand";
  const brandHandle = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "brand";
  const totalSlots = campaign.slots_available ?? 0;
  const remainingSlots = Math.max(totalSlots - (campaign.slots_filled ?? 0), 0);
  const brandBadge = getPrimaryTrustBadge({ badges: campaign.brand?.badges, profileType: "brand" });

  return (
    <SocialPostShell
      avatar={campaign.brand?.avatar_url}
      avatarFallback={getCreatorInitials(brandName) || "BC"}
      handle={brandHandle}
      name={brandName}
      timestamp={getSocialTimestamp(campaign.created_at)}
      trustBadge={brandBadge}
    >
      <p className="mt-3 text-sm font-medium leading-6 text-[#d8ded1]">
        New creator campaign is live: <span className="font-black text-[#fbfbf7]">{campaign.title}</span>
      </p>
      <div className="mt-3 rounded-[24px] border border-[#b8ff3d]/14 bg-[linear-gradient(135deg,rgba(184,255,61,0.11),transparent_44%),#071007] p-4 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#d7b46a]/30 bg-[#d7b46a]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#f0d28d]">
            {getCreatorCompensationLabel(campaign)}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#c7ccc2]">
            {getPrimaryContentType(campaign)}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-[18px] border border-white/[0.065] bg-white/[0.035] p-3">
            <div className="text-xl font-black text-[#fbfbf7]">{remainingSlots}</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#83766e]">Open spots</div>
          </div>
          <div className="rounded-[18px] border border-white/[0.065] bg-white/[0.035] p-3">
            <div className="text-xl font-black text-[#fbfbf7]">{formatDeadline(campaign.application_deadline)}</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#83766e]">Deadline</div>
          </div>
        </div>
      </div>
      <SocialActionRow primaryAction="Apply" primaryHref={`/campaigns/${campaign.id}`} />
    </SocialPostShell>
  );
}

function CreatorNetworkSignalPost({
  activeCount,
  applicationCount
}: {
  activeCount: number;
  applicationCount: number;
}) {
  return (
    <SocialPostShell avatar={null} avatarFallback="BC" handle="budcast" name="BudCast Network" timestamp="Now">
      <p className="mt-3 text-sm font-medium leading-6 text-[#d8ded1]">
        Marketplace signal: creators are applying, brands are reviewing, and completed UGC is becoming reputation. Keep
        your profile current so brands can say yes faster.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-[24px] border border-white/[0.075] bg-white/[0.035] p-3">
        <div className="rounded-[18px] border border-white/[0.065] bg-white/[0.035] p-3">
          <div className="text-xl font-black text-[#fbfbf7]">{formatCount("application", applicationCount)}</div>
          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#83766e]">Your pipeline</div>
        </div>
        <div className="rounded-[18px] border border-white/[0.065] bg-white/[0.035] p-3">
          <div className="text-xl font-black text-[#fbfbf7]">{formatCount("active job", activeCount)}</div>
          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#83766e]">In motion</div>
        </div>
      </div>
      <SocialActionRow primaryAction="Edit profile" primaryHref="/profile/edit" />
    </SocialPostShell>
  );
}

function getCreatorMessagePreview(row: SubmissionPipelineRow) {
  const gw = row.gifting_workflow;
  const isGifting = row.opportunity?.campaign_type === "gifting" || row.opportunity?.campaign_type === "hybrid";
  if (isGifting && gw) {
    if (gw.status === "pending_brand_action") return "Waiting on the brand to arrange your product.";
    if (gw.status === "brand_shipped") return "Brand has arranged your product — confirm when received.";
    if (gw.status === "creator_received") return "Product confirmed. Create your content and submit when ready.";
    if (gw.status === "creator_declined") return "You declined this product. The brand has been notified.";
    if (gw.status === "substitution_requested") return "You requested a substitution. Waiting on the brand.";
    if (gw.status === "cancelled") return "This gifting arrangement was cancelled.";
  }
  if (!row.submission) return "You’re accepted. Coordinate pickup details, content questions, timing, and payment expectations.";
  if (row.submission.verification_status === "pending") return "Content submitted. The brand is reviewing your post link.";
  if (row.submission.verification_status === "needs_revision" || row.submission.verification_status === "failed") {
    return "Revision requested. Check brand notes and resubmit when ready.";
  }
  if (row.submission.verification_status === "verified") {
    if (!row.submission.payment_confirmed_by_brand || !row.submission.payment_confirmed_by_creator) {
      return "Content approved. Coordinate final payment or product confirmation.";
    }
    return "Campaign complete. Keep the brand relationship warm for future work.";
  }
  return "Campaign coordination thread.";
}

function getCreatorMessageTone(row: SubmissionPipelineRow) {
  const gw = row.gifting_workflow;
  const isGifting = row.opportunity?.campaign_type === "gifting" || row.opportunity?.campaign_type === "hybrid";
  if (isGifting && gw) {
    if (gw.status === "pending_brand_action") return "Pending product";
    if (gw.status === "brand_shipped") return "Confirm receipt";
    if (gw.status === "creator_received") return "Submit content";
    if (gw.status === "creator_declined") return "Declined";
    if (gw.status === "substitution_requested") return "Awaiting brand";
    if (gw.status === "cancelled") return "Cancelled";
  }
  if (!row.submission) return "Accepted";
  if (row.submission.verification_status === "pending") return "Under review";
  if (row.submission.verification_status === "needs_revision" || row.submission.verification_status === "failed") {
    return "Revision requested";
  }
  if (row.submission.verification_status === "verified") {
    if (!row.submission.payment_confirmed_by_brand || !row.submission.payment_confirmed_by_creator) return "Approved";
    return "Complete";
  }
  return "Active";
}

function getCreatorMessageAction(row: SubmissionPipelineRow) {
  if (!row.submission) return "Submit";
  if (row.submission.verification_status === "pending") return "Track";
  if (row.submission.verification_status === "needs_revision" || row.submission.verification_status === "failed") return "Revise";
  if (row.submission.verification_status === "verified") return "Confirm";
  return "Open";
}

function CreatorGiftingStatusPanel({ row }: { row: SubmissionPipelineRow }) {
  const gw = row.gifting_workflow;
  const confirmReceipt = useCreatorConfirmReceipt();
  const declineGifting = useCreatorDeclineGifting();
  const [feedback, setFeedback] = useState("");
  const [declineNote, setDeclineNote] = useState("");
  const [showDecline, setShowDecline] = useState(false);

  if (!gw) return null;
  if (gw.status === "creator_received" || gw.status === "creator_declined" || gw.status === "cancelled") return null;

  return (
    <div className="mx-1 mb-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#aeb5aa]">Gifting</div>
        <div className="text-xs font-bold text-amber-400">
          {gw.status === "pending_brand_action" ? "Awaiting brand" : "Confirm receipt"}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <div className="text-white/40">Product</div>
          <div className="mt-0.5 font-medium text-white/80">{gw.product_name}</div>
        </div>
        <div>
          <div className="text-white/40">Category</div>
          <div className="mt-0.5 font-medium text-white/80 capitalize">{gw.product_category.replace(/_/g, " ")}</div>
        </div>
        {gw.product_notes && (
          <div className="col-span-2">
            <div className="text-white/40">Notes</div>
            <div className="mt-0.5 text-white/60">{gw.product_notes}</div>
          </div>
        )}
      </div>
      {gw.status === "brand_shipped" && !showDecline && (
        <div className="space-y-2 border-t border-white/10 pt-3">
          <textarea
            rows={2}
            placeholder="Optional: feedback for the brand (e.g. product condition, packaging)"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#fbfbf7] placeholder:text-white/25 focus:border-[#b8ff3d]/40 focus:outline-none resize-none"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={confirmReceipt.isPending}
              onClick={() => confirmReceipt.mutate({ applicationId: row.id, creator_feedback: feedback })}
              className="rounded-full bg-[#b8ff3d] px-4 py-1.5 text-xs font-bold text-black disabled:opacity-40 transition-opacity"
            >
              {confirmReceipt.isPending ? "Saving…" : "Confirm received"}
            </button>
            <button
              type="button"
              onClick={() => setShowDecline(true)}
              className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-bold text-white/50 hover:text-white/80 transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      )}
      {showDecline && (
        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Decline or request substitution</div>
          <textarea
            rows={2}
            placeholder="Optional: describe what substitution you’d accept. Leave blank to fully decline."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#fbfbf7] placeholder:text-white/25 focus:border-red-400/40 focus:outline-none resize-none"
            value={declineNote}
            onChange={(e) => setDeclineNote(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={declineGifting.isPending}
              onClick={() => declineGifting.mutate({ applicationId: row.id, substitution_notes: declineNote })}
              className="rounded-full bg-red-500/20 border border-red-500/30 px-4 py-1.5 text-xs font-bold text-red-400 disabled:opacity-40 transition-opacity"
            >
              {declineGifting.isPending ? "Saving…" : declineNote.trim() ? "Request substitution" : "Decline product"}
            </button>
            <button
              type="button"
              onClick={() => setShowDecline(false)}
              className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-bold text-white/40 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <p className="text-[10px] leading-4 text-white/20">{gw.compliance_note}</p>
    </div>
  );
}

function CreatorMessageThreadCard({ row }: { row: SubmissionPipelineRow }) {
  const brandName = row.opportunity?.brand?.company_name || "Cannabis brand";
  const brandHandle = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "brand";
  const brandInitials = getCreatorInitials(brandName) || "BC";
  const needsAction =
    !row.submission ||
    row.submission.verification_status === "needs_revision" ||
    row.submission.verification_status === "failed" ||
    (row.submission.verification_status === "verified" &&
      (!row.submission.payment_confirmed_by_brand || !row.submission.payment_confirmed_by_creator));

  return (
    <Link className="group flex gap-3 border-b border-white/[0.075] px-1 py-4 transition last:border-b-0 active:scale-[0.99]" href="/creator-dashboard/work">
      <div className="relative h-14 w-14 shrink-0">
        <div className="premium-icon-surface grid h-14 w-14 place-items-center overflow-hidden rounded-full text-xs font-black text-[#e7ff9a]">
          {row.opportunity?.brand?.avatar_url ? (
            <img alt="" className="h-full w-full object-cover" src={row.opportunity.brand.avatar_url} />
          ) : (
            brandInitials
          )}
        </div>
        {needsAction ? (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#030303] bg-[#b8ff3d] shadow-[0_0_18px_rgba(184,255,61,0.5)]" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[15px] font-black text-[#fbfbf7]">{brandName}</div>
            <div className="mt-0.5 truncate text-xs font-bold text-[#83766e]">@{brandHandle}</div>
          </div>
          <div className="shrink-0 text-[11px] font-black text-[#83766e]">
            {getSocialTimestamp(row.submission?.created_at || row.accepted_at)}
          </div>
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-[#c7ccc2]">{getCreatorMessagePreview(row)}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="min-w-0 truncate rounded-full border border-white/[0.075] bg-white/[0.035] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#c7ccc2]">
            {getCreatorMessageTone(row)}
          </span>
          <span className="shrink-0 text-xs font-black text-[#e7ff9a]">
            {getCreatorMessageAction(row)}
            <ArrowRight className="ml-1 inline h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CreatorMessagesInbox({
  initialUserId
}: {
  firstCampaignHref: string;
  initialUserId?: string | null;
  pipelineRows: SubmissionPipelineRow[];
}) {
  return (
    <BudCastDmInbox
      initialUserId={initialUserId}
      mobileOnly
      searchTargetType="brand"
      subtitle="Search brands, send DMs, and keep pickup details, creative questions, approvals, and payment timing inside BudCast."
      title="Messages"
    />
  );
}

function getWorkCardStatus(row: SubmissionPipelineRow) {
  if (!row.submission) return "Needs submission";
  if (row.submission.verification_status === "pending") return "Under review";
  if (row.submission.verification_status === "needs_revision" || row.submission.verification_status === "failed") {
    return "Revision requested";
  }
  if (row.submission.verification_status === "verified") {
    if (!row.submission.payment_confirmed_by_brand || !row.submission.payment_confirmed_by_creator) {
      return "Payment/product pending";
    }
    return "Complete";
  }
  return "Active";
}

function getWorkCardAction(row: SubmissionPipelineRow) {
  if (!row.submission) return "Submit content";
  if (row.submission.verification_status === "needs_revision" || row.submission.verification_status === "failed") {
    return "Resubmit";
  }
  if (row.submission.verification_status === "verified") return "Confirm status";
  return "View status";
}

function getWorkCardProgress(row: SubmissionPipelineRow) {
  if (!row.submission) return 1;
  if (row.submission.verification_status === "pending") return 3;
  if (row.submission.verification_status === "needs_revision" || row.submission.verification_status === "failed") return 2;
  if (row.submission.verification_status === "verified") {
    if (!row.submission.payment_confirmed_by_brand || !row.submission.payment_confirmed_by_creator) return 4;
    return 5;
  }
  return 2;
}

function CreatorWorkProgressRail({ progress }: { progress: number }) {
  return (
    <div className="mt-4 grid grid-cols-5 gap-1.5" aria-label="Campaign progress">
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          className={`h-1.5 rounded-full ${step <= progress ? "bg-[linear-gradient(90deg,#b8ff3d,#d7ff72)] shadow-[0_0_16px_rgba(184,255,61,0.18)]" : "bg-white/12"}`}
          key={step}
        />
      ))}
    </div>
  );
}

function CreatorWorkJobCard({ row }: { row: SubmissionPipelineRow }) {
  const brandName = row.opportunity?.brand?.company_name || "Cannabis brand";
  const brandInitials = getCreatorInitials(brandName) || "BC";
  const status = getWorkCardStatus(row);
  const progress = getWorkCardProgress(row);
  const dueDate = formatDeadline(row.completion_deadline);
  const postType = formatPostType(row.submission?.post_type);

  return (
    <Link
      className="rounded-[26px] border border-white/[0.075] bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_44%),#0c0f09] p-4 shadow-[0_18px_54px_rgba(0,0,0,0.36),0_1px_0_rgba(255,255,255,0.055)_inset] transition hover:border-[#b8ff3d]/25"
      href="/creator-dashboard/work"
    >
      <div className="flex gap-3">
        <div className="premium-icon-surface grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[18px] text-xs font-black text-[#e7ff9a]">
          {row.opportunity?.brand?.avatar_url ? (
            <img alt="" className="h-full w-full object-cover" src={row.opportunity.brand.avatar_url} />
          ) : (
            brandInitials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[18px] font-black leading-[1.14] tracking-[-0.025em] text-[#fbfbf7]">
            {row.opportunity?.title || "Accepted campaign"}
          </h3>
          <p className="mt-1.5 text-xs font-bold text-[#aeb5aa]">
            {brandName} · {postType} · {getCreatorCompensationLabel(row.opportunity ?? { campaign_type: "gifting" })}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="shrink-0 rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#071007]">
          {status}
        </span>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#c7ccc2]">
          Due {dueDate}
        </span>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#c7ccc2]">
          Pickup details in DM
        </span>
      </div>

      <CreatorWorkProgressRail progress={progress} />

      <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3">
        <span className="text-xs font-bold text-[#aeb5aa]">Accepted → Submitted → Review</span>
        <span className="text-xs font-black text-[#e7ff9a]">
          {getWorkCardAction(row)}
          <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

function CreatorApplicationCard({ application }: { application: ApplicationWithOpportunity }) {
  const opportunity = application.opportunity;
  const brandName = opportunity?.brand?.company_name || "Cannabis brand";
  const brandInitials = getCreatorInitials(brandName) || "BC";

  return (
    <Link
      className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 transition hover:border-[#b8ff3d]/25"
      href={opportunity?.id ? `/campaigns/${opportunity.id}` : "/creator-dashboard"}
    >
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.045] text-xs font-black text-[#e7ff9a]">
          {opportunity?.brand?.avatar_url ? (
            <img alt="" className="h-full w-full object-cover" src={opportunity.brand.avatar_url} />
          ) : (
            brandInitials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-base font-black text-[#fbfbf7]">{opportunity?.title || "Campaign application"}</h3>
            <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#c7ccc2]">
              {application.status === "pending" ? "Pending" : application.status === "accepted" ? "Accepted" : application.status === "rejected" ? "Declined" : "Applied"}
            </span>
          </div>
          <p className="mt-1 text-xs font-bold text-[#aeb5aa]">{brandName}</p>
          <p className="mt-2 text-sm font-medium leading-5 text-[#c7ccc2]">
            Applied {getSocialTimestamp(application.applied_at)}. Brand response is tracked here.
          </p>
        </div>
      </div>
    </Link>
  );
}

function CreatorWorkLane({
  children,
  count,
  title
}: {
  children: React.ReactNode;
  count: number;
  title: string;
}) {
  return (
    <div className="grid gap-2.5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-black tracking-[-0.035em] text-[#fbfbf7]">{title}</h2>
        <span className="rounded-full bg-white/[0.055] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#c7ccc2]">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function CreatorWorkEmptyCard({ body }: { body: string }) {
  return (
    <div className="rounded-[22px] border border-dashed border-white/12 bg-white/[0.035] p-4 text-sm font-semibold leading-6 text-[#aeb5aa]">
      {body}
    </div>
  );
}

export function CreatorDashboardScreen({
  activeTab,
  initialMessageUserId
}: {
  activeTab: CreatorTab;
  initialMessageUserId?: string | null;
}) {
  const router = useRouter();
  const { loading, session, profile } = useAuth();
  const opportunities = useMyNicheCampaigns({ limit: 4 });
  const applications = useMyApplications();
  const submissionPipeline = useMySubmissionPipeline();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }

    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
      return;
    }

    if (!loading && session && profile?.user_type === "brand") {
      router.replace("/dashboard");
    }
  }, [loading, profile, router, session]);

  const applicationRows = applications.data ?? [];
  const pipelineRows = submissionPipeline.data ?? [];
  const pendingApplicationCount = useMemo(
    () => applicationRows.filter((application) => application.status === "pending").length,
    [applicationRows]
  );
  const acceptedApplicationCount = useMemo(
    () => applicationRows.filter((application) => application.status === "accepted").length,
    [applicationRows]
  );
  const submissionActionCount = useMemo(
    () =>
      pipelineRows.filter(
        (row) => !row.submission || row.submission.verification_status === "needs_revision"
      ).length,
    [pipelineRows]
  );
  const paymentPendingCount = useMemo(
    () =>
      pipelineRows.filter(
        (row) =>
          row.submission?.verification_status === "verified" &&
          (!row.submission.payment_confirmed_by_brand || !row.submission.payment_confirmed_by_creator)
      ).length,
    [pipelineRows]
  );
  const deadlineApproachingCount = useMemo(
    () => applicationRows.filter(isDeadlineApproaching).length,
    [applicationRows]
  );
  const creatorHandle = getCreatorHandle(profile);
  const creatorDisplayName = getCreatorDisplayName(profile);
  const creatorInitials = getCreatorInitials(creatorDisplayName) || "ME";
  const creatorProfileStrength = getCreatorProfileStrength(profile);
  const creatorTrustBadges = getTrustBadgeDescriptors({ badges: profile?.badges, profileType: "creator" });
  const workQueueItems = [
    {
      actionHref: "/creator-dashboard/work",
      actionLabel: "Submit",
      description: `${submissionActionCount} accepted campaign${submissionActionCount === 1 ? "" : "s"} need content or revisions.`,
      title: "Submit content"
    },
    {
      actionHref: "/creator-dashboard/work",
      actionLabel: "Review",
      description: `${deadlineApproachingCount} deadline${deadlineApproachingCount === 1 ? "" : "s"} approaching in the next 3 days.`,
      title: "Check due dates"
    },
    {
      actionHref: "/creator-dashboard/work",
      actionLabel: "Track",
      description: `${paymentPendingCount} approved submission${paymentPendingCount === 1 ? "" : "s"} waiting on payment confirmation.`,
      title: "Track payment"
    },
    {
      actionHref: "/creator-dashboard/work",
      actionLabel: "View",
      description: `${pendingApplicationCount} application${pendingApplicationCount === 1 ? "" : "s"} waiting for brand response.`,
      title: "Follow applications"
    }
  ];
  const campaignFilters = ["For You", "Local", "Paid", "Product", "Paid + Product", "Reels", "UGC Video"];
  const workStatusItems = [
    { label: "Applied", value: pendingApplicationCount },
    { label: "Active", value: acceptedApplicationCount },
    { label: "Submit", value: submissionActionCount },
    { label: "Pending", value: paymentPendingCount }
  ];

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing your creator marketplace."
        description="BudCast is checking your account before loading paid content opportunities and application status."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Your creator profile is almost ready."
        description="Finish setup so cannabis brands can review your profile before accepting applications."
      />
    );
  }

  if (profile?.user_type && profile.user_type !== "creator") {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to brand campaigns"
        title="This creator marketplace is built for content creators."
        description="BudCast is opening the brand campaign area for this account."
      />
    );
  }

  return (
    <CreatorSocialShell
      activeTab={activeTab}
      avatarFallback={creatorInitials}
      avatarUrl={profile?.avatar_url}
      handle={creatorHandle}
      profileHref="/profile"
    >
      {activeTab === "Campaigns" ? (
        <section className="grid gap-5" id="campaigns">
          <CreatorWelcomeHomeCard
            avatarUrl={profile?.avatar_url}
            displayName={creatorDisplayName}
            editHref="/profile/edit"
            handle={creatorHandle}
            location={profile?.location}
            niches={profile?.niches ?? []}
            profileStrength={creatorProfileStrength}
            stats={workStatusItems}
            trustBadges={creatorTrustBadges}
          />

          <div className="grid gap-3.5">
            <div className="flex items-end justify-between gap-4 px-1">
              <div>
                <h2 className="text-[1.65rem] font-black leading-tight tracking-[-0.03em] text-[#fbfbf7]">Campaigns for you</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#aeb5aa]">
                  Paid, product, and paid + product opportunities matched to your profile.
                </p>
              </div>
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {campaignFilters.map((filter, index) => (
                <span
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-black ${
                  index === 0
                      ? "bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_10px_24px_rgba(184,255,61,0.2),0_1px_0_rgba(255,255,255,0.2)_inset]"
                      : "border border-white/[0.075] bg-white/[0.035] text-[#c7ccc2]"
                  }`}
                  key={filter}
                >
                  {filter}
                </span>
              ))}
            </div>
          </div>

          {opportunities.isLoading ? (
            <div className="rounded-[30px] border border-white/10 bg-[#0d0a08] px-6 py-12 text-center">
              <p className="text-lg font-black text-[#fbfbf7]">Loading campaign drops...</p>
              <p className="mt-2 text-sm font-medium leading-6 text-[#aeb5aa]">
                BudCast is matching live campaigns to your creator profile.
              </p>
            </div>
          ) : (opportunities.data?.length ?? 0) === 0 ? (
            <div className="rounded-[30px] border border-dashed border-white/14 bg-[#0d0a08] px-6 py-12 text-center">
              <p className="text-lg font-black text-[#fbfbf7]">No matching campaigns yet.</p>
              <p className="mt-2 text-sm font-medium leading-6 text-[#aeb5aa]">
                Add niches, socials, and portfolio examples so BudCast can match better campaign drops.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {opportunities.data?.map((campaign) => {
                const application = applications.getApplication(campaign.id);
                const applied = Boolean(application);
                const workflowStatus = getCampaignWorkflowStatus(campaign.id, application, pipelineRows);
                const primaryActionLabel = applied ? "View status" : "Apply";
                const compensationLabel = getCreatorCompensationLabel(campaign);
                const feedLabels = getCampaignFeedBadges(campaign).slice(0, 3);
                const brandName = campaign.brand?.company_name ?? "Cannabis brand";
                const totalSlots = campaign.slots_available ?? 0;
                const remainingSlots = Math.max(totalSlots - (campaign.slots_filled ?? 0), 0);

                return (
                  <CampaignDropCard
                    applyHref={`/campaigns/${campaign.id}`}
                    applyLabel={primaryActionLabel}
                    brandAvatarUrl={campaign.brand?.avatar_url}
                    brandName={brandName}
                    compensationLabel={compensationLabel}
                    compensationValue={getCreatorCompensationValue(campaign)}
                    contentTypeLabel={getPrimaryContentType(campaign)}
                    deadlineLabel={formatDeadline(campaign.application_deadline)}
                    detailHref={`/campaigns/${campaign.id}`}
                    key={campaign.id}
                    locationLabel={campaign.location ?? "Local or brand-coordinated"}
                    platformLabel={getPlatformTarget(campaign)}
                    slotsLabel={`${remainingSlots} open`}
                    summary={getCreatorFacingDescription(campaign)}
                    title={campaign.title}
                    urgencyLabel={feedLabels[0] ?? (applied ? workflowStatus : undefined)}
                  />
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "Feed" ? (
        <section className="grid gap-5" id="feed">
          <BudCastSocialFeed
            viewer={{
              avatarFallback: creatorInitials,
              avatarUrl: profile?.avatar_url,
              displayName: creatorDisplayName,
              handle: creatorHandle
            }}
          >
            <CreatorProofPost
              creatorAvatarUrl={profile?.avatar_url}
              creatorBadge={creatorTrustBadges[0]}
              creatorDisplayName={creatorDisplayName}
              creatorHandle={creatorHandle}
              creatorInitials={creatorInitials}
              row={pipelineRows.find((row) => row.submission?.verification_status === "verified") ?? pipelineRows[0]}
            />

            {opportunities.data?.slice(0, 2).map((campaign) => (
              <BrandOpportunityPost campaign={campaign} key={campaign.id} />
            ))}

            <SocialPostShell avatar={null} avatarFallback="BC" handle="budcast" name="BudCast" timestamp="Today">
              <p className="mt-3 text-sm font-medium leading-6 text-[#d8ded1]">
                Brands are using BudCast to announce product drops, store launches, campaign briefs, creator calls, and
                completed work. This feed is where the cannabis UGC network starts to feel alive.
              </p>
              <div className="mt-3 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e7ff9a]">Network update</div>
                <h4 className="mt-2 text-lg font-black leading-tight tracking-[-0.04em] text-[#fbfbf7]">
                  Campaign drops, creator proof, brand updates, and job reviews belong in one social marketplace.
                </h4>
              </div>
              <SocialActionRow primaryAction="Find campaigns" primaryHref="/creator-dashboard" />
            </SocialPostShell>

            <CreatorNetworkSignalPost
              activeCount={acceptedApplicationCount}
              applicationCount={applicationRows.length}
            />

            {(opportunities.data?.length ?? 0) === 0 ? (
              <div className="rounded-[30px] border border-dashed border-white/14 bg-[#0d0a08] px-6 py-10 text-center">
                <p className="text-lg font-black text-[#fbfbf7]">Feed is ready for campaign activity.</p>
                <p className="mt-2 text-sm font-medium leading-6 text-[#aeb5aa]">
                  As brands post campaigns and creators complete work, this becomes the social layer of BudCast.
                </p>
              </div>
            ) : null}
          </BudCastSocialFeed>
        </section>
      ) : null}

      {activeTab === "Messages" ? (
        <CreatorMessagesInbox
          firstCampaignHref={opportunities.data?.[0] ? `/campaigns/${opportunities.data[0].id}` : "/creator-dashboard"}
          initialUserId={initialMessageUserId}
          pipelineRows={pipelineRows}
        />
      ) : null}

      {activeTab === "Work" ? (
        <section className="grid gap-5" id="work">
          <div className="rounded-[30px] bg-[radial-gradient(circle_at_15%_0%,rgba(184,255,61,0.15),transparent_38%),linear-gradient(180deg,rgba(18,22,13,0.96),rgba(7,8,5,0.98))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.42),0_1px_0_rgba(255,255,255,0.06)_inset]">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e7ff9a]">{"Today's work"}</div>
            <h1 className="mt-2 text-[32px] font-black leading-[1.02] tracking-[-0.035em] text-[#fbfbf7]">
              Keep campaigns moving.
            </h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#c7ccc2]">
              Submit content, track approvals, coordinate pickup, and confirm payment status.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: "Active campaign", value: acceptedApplicationCount },
                { label: "Needs submission", value: submissionActionCount },
                { label: "Payment pending", value: paymentPendingCount },
                { label: "Deadlines soon", value: deadlineApproachingCount }
              ].map((item) => (
                <div
                  className="rounded-[22px] border border-white/[0.075] bg-white/[0.045] p-3 shadow-[0_1px_0_rgba(255,255,255,0.055)_inset]"
                  key={item.label}
                >
                  <div className="text-2xl font-black leading-none text-[#fbfbf7]">{item.value}</div>
                  <div className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#aeb5aa]">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pb-1">
            {["Needs action", "Accepted", "Submitted", "Paid/Product"].map((filter, index) => (
              <span
                className={`shrink-0 rounded-full px-3.5 py-2.5 text-xs font-black ${
                  index === 0
                    ? "bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_10px_24px_rgba(184,255,61,0.2),0_1px_0_rgba(255,255,255,0.2)_inset]"
                    : "border border-white/[0.075] bg-white/[0.04] text-[#c7ccc2]"
                }`}
                key={filter}
              >
                {filter}
              </span>
            ))}
          </div>

          <CreatorWorkLane
            count={
              pipelineRows.filter(
                (row) =>
                  !row.submission ||
                  row.submission.verification_status === "needs_revision" ||
                  row.submission.verification_status === "failed"
              ).length
            }
            title="Needs action"
          >
            {pipelineRows.filter((row) => !row.submission || row.submission.verification_status === "needs_revision" || row.submission.verification_status === "failed").length > 0 ? (
              pipelineRows
                .filter(
                  (row) =>
                    !row.submission ||
                    row.submission.verification_status === "needs_revision" ||
                    row.submission.verification_status === "failed"
                )
                .map((row) => <CreatorWorkJobCard key={row.id} row={row} />)
            ) : (
              <CreatorWorkEmptyCard body="No submissions or revisions need action right now." />
            )}
          </CreatorWorkLane>

          <CreatorWorkLane count={pipelineRows.length} title="Active jobs">
            {pipelineRows.length > 0 ? (
              pipelineRows.map((row) => <CreatorWorkJobCard key={row.id} row={row} />)
            ) : (
              <CreatorWorkEmptyCard body="Accepted campaigns will appear here after brands approve your application." />
            )}
          </CreatorWorkLane>

          <CreatorWorkLane
            count={pipelineRows.filter((row) => row.submission?.verification_status === "pending").length}
            title="Submitted / under review"
          >
            {pipelineRows.filter((row) => row.submission?.verification_status === "pending").length > 0 ? (
              pipelineRows
                .filter((row) => row.submission?.verification_status === "pending")
                .map((row) => <CreatorWorkJobCard key={row.id} row={row} />)
            ) : (
              <CreatorWorkEmptyCard body="Submitted content under brand review will appear here." />
            )}
          </CreatorWorkLane>

          <CreatorWorkLane
            count={
              pipelineRows.filter(
                (row) =>
                  row.submission?.verification_status === "verified" &&
                  (!row.submission.payment_confirmed_by_brand || !row.submission.payment_confirmed_by_creator)
              ).length
            }
            title="Payment & product status"
          >
            {pipelineRows.filter((row) => row.submission?.verification_status === "verified" && (!row.submission.payment_confirmed_by_brand || !row.submission.payment_confirmed_by_creator)).length > 0 ? (
              pipelineRows
                .filter(
                  (row) =>
                    row.submission?.verification_status === "verified" &&
                    (!row.submission.payment_confirmed_by_brand || !row.submission.payment_confirmed_by_creator)
                )
                .map((row) => <CreatorWorkJobCard key={row.id} row={row} />)
            ) : (
              <CreatorWorkEmptyCard body="Approved work waiting for payment or product confirmation will appear here." />
            )}
          </CreatorWorkLane>

          <CreatorWorkLane count={applicationRows.length} title="Applications">
            {applicationRows.length > 0 ? (
              applicationRows.map((application) => (
                <CreatorApplicationCard application={application} key={application.id} />
              ))
            ) : (
              <CreatorWorkEmptyCard body="Campaigns you apply to will appear here, similar to job applications." />
            )}
          </CreatorWorkLane>
        </section>
      ) : null}
    </CreatorSocialShell>
  );
}
