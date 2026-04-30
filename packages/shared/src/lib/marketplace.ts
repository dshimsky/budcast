import type {
  CampaignType,
  ContentSubmission,
  Opportunity,
  PostType,
  VerificationStatus
} from "../types/database";
import { formatCurrency, formatDeadline, formatPostType, formatValueLabel } from "./formatters";

export type MarketplaceCompensationLabel = "Paid" | "Product" | "Paid + Product";
export type MarketplacePaymentProductStatus =
  | "Payment pending"
  | "Payment confirmed"
  | "Product pending"
  | "Product shipped"
  | "Product received"
  | "Complete";

export function formatCompensationLabel(type?: CampaignType | string | null): MarketplaceCompensationLabel {
  if (type === "paid") return "Paid";
  if (type === "hybrid") return "Paid + Product";
  return "Product";
}

export function getCompensationLabel(
  campaign: Pick<Opportunity, "campaign_type" | "cash_amount" | "product_description">
): MarketplaceCompensationLabel {
  if (campaign.campaign_type) return formatCompensationLabel(campaign.campaign_type);
  if (campaign.cash_amount && campaign.product_description) return "Paid + Product";
  if (campaign.cash_amount) return "Paid";
  return "Product";
}

export function getCompensationValue(
  campaign: Pick<Opportunity, "campaign_type" | "cash_amount" | "product_description">
) {
  const label = getCompensationLabel(campaign);
  if (label === "Paid") return formatCurrency(campaign.cash_amount);
  if (label === "Paid + Product") {
    const cash = formatCurrency(campaign.cash_amount);
    const product = campaign.product_description?.trim() || "Product included";
    return campaign.cash_amount ? `${cash} + product` : product;
  }
  return campaign.product_description?.trim() || "Product included";
}

export function getCompensationBadgeClass(label: MarketplaceCompensationLabel) {
  if (label === "Paid") return "border-[#d7b46a]/35 bg-[#d7b46a]/12 text-[#f0d28d]";
  if (label === "Paid + Product") return "border-[#c8f060]/25 bg-[#c8f060]/10 text-[#dff7a8]";
  return "border-white/12 bg-white/[0.045] text-stone-300";
}

const CONTENT_FORMAT_LABELS: Record<string, string> = {
  ig_post: "Instagram Post",
  ig_reel: "Instagram Reel",
  ig_story: "Instagram Story",
  instagram_reel: "Instagram Reel",
  tiktok_video: "TikTok Video",
  tiktok_photo: "TikTok Photo",
  youtube_video: "YouTube Video",
  youtube_short: "YouTube Short",
  ugc_video: "UGC Video",
  reel: "Reel",
  review: "Product Review",
  lifestyle: "Lifestyle"
};

export function formatMarketplaceContentType(raw?: string | null) {
  if (!raw) return "UGC Video";
  return CONTENT_FORMAT_LABELS[raw] ?? formatValueLabel(raw);
}

export function getPrimaryContentType(campaign: Pick<Opportunity, "content_types" | "title" | "description" | "short_description">) {
  const explicitType = campaign.content_types?.find(Boolean);
  if (explicitType) return formatMarketplaceContentType(explicitType);

  const text = `${campaign.title} ${campaign.short_description ?? ""} ${campaign.description}`.toLowerCase();
  if (text.includes("reel")) return "Reel";
  if (text.includes("review") || text.includes("reaction")) return "Product Review";
  if (text.includes("lifestyle")) return "Lifestyle";
  return "UGC Video";
}

export function getPlatformTarget(campaign: Pick<Opportunity, "content_types">) {
  const type = campaign.content_types?.find(Boolean);
  if (!type) return "Platform flexible";
  if (type.includes("tiktok")) return "TikTok";
  if (type.includes("youtube")) return "YouTube Shorts";
  if (type.includes("ig") || type.includes("instagram")) return "Instagram";
  return "Platform flexible";
}

export function getCampaignFeedBadges(
  campaign: Pick<Opportunity, "created_at" | "slots_filled" | "slots_available" | "application_deadline">
) {
  const badges: string[] = [];
  const createdAt = new Date(campaign.created_at).getTime();
  const remainingSlots = Math.max((campaign.slots_available ?? 0) - (campaign.slots_filled ?? 0), 0);

  if (!Number.isNaN(createdAt) && Date.now() - createdAt <= 1000 * 60 * 60 * 24 * 14) badges.push("New");
  if (remainingSlots > 0 && remainingSlots <= 3) badges.push("Filling fast");
  if (isDeadlineSoon(campaign.application_deadline)) badges.push("Closing soon");

  return badges;
}

export function isDeadlineSoon(deadline?: string | null) {
  if (!deadline) return false;
  const time = new Date(deadline).getTime();
  if (Number.isNaN(time)) return false;
  const diff = time - Date.now();
  return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 7;
}

export function getCreatorSubmissionStatus(submission: ContentSubmission | null | undefined) {
  if (!submission) return "Submit content";
  if (submission.verification_status === "needs_revision") return "Revision requested";
  if (submission.verification_status === "pending") return "Under review";
  if (submission.verification_status === "verified") return "Approved";
  if (submission.verification_status === "failed") return "Revision requested";
  return "Submitted";
}

export function getBrandSubmissionStatus(submission: ContentSubmission | null | undefined) {
  if (!submission) return "Submitted";
  if (submission.verification_status === "pending") return "Needs review";
  if (submission.verification_status === "needs_revision") return "Revision requested";
  if (submission.verification_status === "verified") return "Approved";
  if (submission.verification_status === "failed") return "Revision requested";
  return "Submitted";
}

export function getPaymentProductStatus(
  campaign: Pick<Opportunity, "campaign_type"> | null | undefined,
  submission: Pick<
    ContentSubmission,
    "verification_status" | "payment_confirmed_by_brand" | "payment_confirmed_by_creator"
  > | null | undefined
): MarketplacePaymentProductStatus {
  const label = formatCompensationLabel(campaign?.campaign_type);
  if (!submission || submission.verification_status !== "verified") {
    return label === "Paid" ? "Payment pending" : "Product pending";
  }

  const confirmed = submission.payment_confirmed_by_brand && submission.payment_confirmed_by_creator;
  if (confirmed) return "Complete";
  if (label === "Paid") return "Payment pending";
  if (label === "Product") return "Product pending";
  return "Payment pending";
}

export function getSubmissionStageLabel(status?: VerificationStatus | null) {
  if (status === "verified") return "Approved";
  if (status === "needs_revision") return "Revision requested";
  if (status === "failed") return "Revision requested";
  return "Under review";
}

export function getCampaignSummaryBadges(campaign: Pick<Opportunity, "campaign_type" | "content_types" | "application_deadline">) {
  return [
    formatCompensationLabel(campaign.campaign_type),
    formatMarketplaceContentType(campaign.content_types?.[0]),
    formatDeadline(campaign.application_deadline)
  ];
}

export function formatDeliverable(raw?: PostType | string | null) {
  return raw ? formatPostType(raw) : "UGC Video";
}
