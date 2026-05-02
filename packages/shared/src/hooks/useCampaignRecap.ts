import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { User } from "../types/database";

type RpcClient = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
};

export type CampaignRecapAsset = {
  id?: string | null;
  applicationId?: string | null;
  creatorId?: string | null;
  creatorName?: string | null;
  creatorAvatarUrl?: string | null;
  postType?: string | null;
  postUrl?: string | null;
  thumbnailUrl?: string | null;
  title?: string | null;
  status?: string | null;
  submittedAt?: string | null;
};

export type CampaignRecapPostUrl = {
  label: string;
  url: string;
  creatorName?: string | null;
  postType?: string | null;
};

export type CampaignRecapEngagement = {
  impressions?: number | null;
  reach?: number | null;
  views?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
  clicks?: number | null;
  engagementRate?: number | null;
};

export type CampaignRecapMarketFeedback = {
  summary?: string | null;
  highlights: string[];
  concerns: string[];
  markets: string[];
  sentimentScore?: number | null;
};

export type CampaignRecapCreator = Pick<
  User,
  | "id"
  | "name"
  | "avatar_url"
  | "location"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "review_score"
  | "completion_rate"
  | "creator_availability"
>;

export type CampaignRecapData = {
  opportunityId: string;
  title?: string | null;
  campaignNumber?: string | null;
  usableAssets: CampaignRecapAsset[];
  applicationConversion: number | null;
  applicationsCount: number | null;
  acceptedCount: number | null;
  completionRate: number | null;
  completedCount: number | null;
  disputeRate: number | null;
  disputeCount: number | null;
  reviewScore: number | null;
  reviewCount: number | null;
  marketFeedback: CampaignRecapMarketFeedback;
  postUrls: CampaignRecapPostUrl[];
  engagement: CampaignRecapEngagement | null;
  repeatCreators: CampaignRecapCreator[];
  raw: Record<string, unknown>;
};

export type RepeatCollaborationInviteInput = {
  opportunityId: string;
  creatorId: string;
  note?: string | null;
  newOpportunityId?: string | null;
};

export type RepeatCollaborationInviteResult = {
  invite_id?: string;
  opportunity_id?: string;
  creator_id?: string;
  status?: string;
  [key: string]: unknown;
};

export const campaignRecapQueryKey = (opportunityId: string | null | undefined) => [
  "campaign-recap",
  opportunityId
];

export function useCampaignRecap(opportunityId: string | null | undefined) {
  return useQuery<CampaignRecapData | null>({
    queryKey: campaignRecapQueryKey(opportunityId),
    enabled: Boolean(opportunityId),
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as RpcClient).rpc("get_campaign_recap", {
        p_opportunity_id: opportunityId!
      });

      if (error) throw error;
      if (!data) return null;

      return normalizeCampaignRecap(data, opportunityId!);
    },
    staleTime: 30_000
  });
}

export function useCreateRepeatCollaborationInvite() {
  const queryClient = useQueryClient();

  return useMutation<RepeatCollaborationInviteResult, unknown, RepeatCollaborationInviteInput>({
    mutationFn: async (input) => {
      const { data, error } = await (supabase as unknown as RpcClient).rpc("create_repeat_collaboration_invite", {
        p_creator_id: input.creatorId,
        p_source_opportunity_id: input.opportunityId,
        p_note: input.note ?? null,
        p_new_opportunity_id: input.newOpportunityId ?? null
      });

      if (error) throw error;
      return (data ?? {}) as RepeatCollaborationInviteResult;
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: campaignRecapQueryKey(variables.opportunityId) }),
        queryClient.invalidateQueries({ queryKey: ["campaign-recap"] }),
        queryClient.invalidateQueries({ queryKey: ["repeat-collaboration-invites"] }),
        queryClient.invalidateQueries({ queryKey: ["preferred-creator-pools"] }),
        queryClient.invalidateQueries({ queryKey: ["private-invites"] }),
        queryClient.invalidateQueries({ queryKey: ["campaign", variables.opportunityId] }),
        queryClient.invalidateQueries({ queryKey: ["brand-campaigns"] })
      ]);
    }
  });
}

function normalizeCampaignRecap(data: unknown, fallbackOpportunityId: string): CampaignRecapData {
  const row = asRecord(Array.isArray(data) ? data[0] : data);
  const usableAssets = readArray(row, ["usable_assets", "usableAssets", "assets"]).map(normalizeAsset);
  const postUrls = [
    ...readArray(row, ["post_urls", "postUrls"]).map(normalizePostUrl),
    ...usableAssets.filter((asset) => asset.postUrl).map((asset) => ({
      label: asset.creatorName || asset.postType || "Live post",
      url: asset.postUrl!,
      creatorName: asset.creatorName,
      postType: asset.postType
    }))
  ].filter(uniquePostUrl);

  return {
    opportunityId: stringValue(row.opportunity_id ?? row.opportunityId) ?? fallbackOpportunityId,
    title: stringValue(row.title ?? row.campaign_title ?? row.campaignTitle),
    campaignNumber: stringValue(row.campaign_number ?? row.campaignNumber),
    usableAssets,
    applicationConversion: numberValue(row.application_conversion ?? row.applicationConversion),
    applicationsCount: numberValue(row.applications_count ?? row.applicationsCount ?? row.total_applications),
    acceptedCount: numberValue(row.accepted_count ?? row.acceptedCount ?? row.accepted_applications),
    completionRate: numberValue(row.completion_rate ?? row.completionRate),
    completedCount: numberValue(row.completed_count ?? row.completedCount ?? row.completed_applications),
    disputeRate: numberValue(row.dispute_rate ?? row.disputeRate),
    disputeCount: numberValue(row.dispute_count ?? row.disputeCount),
    reviewScore: numberValue(row.review_score ?? row.reviewScore),
    reviewCount: numberValue(row.review_count ?? row.reviewCount),
    marketFeedback: normalizeMarketFeedback(row.market_feedback ?? row.marketFeedback),
    postUrls,
    engagement: normalizeEngagement(row.engagement),
    repeatCreators: readArray(row, ["repeat_creators", "repeatCreators", "creators"]).map((creator) =>
      asRecord(creator) as CampaignRecapCreator
    ),
    raw: row
  };
}

function normalizeAsset(value: unknown): CampaignRecapAsset {
  const row = asRecord(value);
  const creator = asRecord(row.creator);
  return {
    id: stringValue(row.id),
    applicationId: stringValue(row.application_id ?? row.applicationId),
    creatorId: stringValue(row.creator_id ?? row.creatorId ?? creator.id),
    creatorName: stringValue(row.creator_name ?? row.creatorName ?? creator.name),
    creatorAvatarUrl: stringValue(row.creator_avatar_url ?? row.creatorAvatarUrl ?? creator.avatar_url),
    postType: stringValue(row.post_type ?? row.postType),
    postUrl: stringValue(row.post_url ?? row.postUrl ?? row.url),
    thumbnailUrl: stringValue(row.thumbnail_url ?? row.thumbnailUrl),
    title: stringValue(row.title ?? row.caption),
    status: stringValue(row.status ?? row.verification_status),
    submittedAt: stringValue(row.submitted_at ?? row.submittedAt ?? row.created_at)
  };
}

function normalizePostUrl(value: unknown): CampaignRecapPostUrl {
  if (typeof value === "string") return { label: "Live post", url: value };
  const row = asRecord(value);
  return {
    label: stringValue(row.label ?? row.creator_name ?? row.post_type) ?? "Live post",
    url: stringValue(row.url ?? row.post_url) ?? "",
    creatorName: stringValue(row.creator_name ?? row.creatorName),
    postType: stringValue(row.post_type ?? row.postType)
  };
}

function normalizeEngagement(value: unknown): CampaignRecapEngagement | null {
  const row = asRecord(Array.isArray(value) ? value[0] : value);
  const engagement = {
    impressions: numberValue(row.impressions),
    reach: numberValue(row.reach),
    views: numberValue(row.views),
    likes: numberValue(row.likes),
    comments: numberValue(row.comments),
    shares: numberValue(row.shares),
    saves: numberValue(row.saves),
    clicks: numberValue(row.clicks),
    engagementRate: numberValue(row.engagement_rate ?? row.engagementRate)
  };

  return Object.values(engagement).some((metric) => metric !== null) ? engagement : null;
}

function normalizeMarketFeedback(value: unknown): CampaignRecapMarketFeedback {
  if (typeof value === "string") {
    return { summary: value, highlights: [], concerns: [], markets: [] };
  }

  if (Array.isArray(value)) {
    const highlights = value
      .map((item) => stringValue(asRecord(item).review_text))
      .filter((item): item is string => Boolean(item));
    return { summary: null, highlights, concerns: [], markets: [] };
  }

  const row = asRecord(value);
  return {
    summary: stringValue(row.summary),
    highlights: stringArray(row.highlights),
    concerns: stringArray(row.concerns),
    markets: stringArray(row.markets),
    sentimentScore: numberValue(row.sentiment_score ?? row.sentimentScore)
  };
}

function readArray(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (Array.isArray(row[key])) return row[key] as unknown[];
  }
  return [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => stringValue(item)).filter((item): item is string => Boolean(item))
    : [];
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function uniquePostUrl(value: CampaignRecapPostUrl, index: number, values: CampaignRecapPostUrl[]) {
  return Boolean(value.url) && values.findIndex((candidate) => candidate.url === value.url) === index;
}
