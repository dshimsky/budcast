import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import {
  selectBalanceAfterPublish,
  selectCanPublish,
  selectHasInsufficientCredits,
  selectTotalCreditsRequired,
  useCampaignForm
} from "../stores/campaignForm";

export type PublishErrorKey =
  | "NOT_SIGNED_IN"
  | "INCOMPLETE_CAMPAIGN"
  | "INSUFFICIENT_CREDITS"
  | "INVALID_OPPORTUNITY"
  | "UNKNOWN";

export interface PublishCampaignResult {
  id: string;
  campaign_number: string;
  credits_reserved: number;
  new_balance: number;
}

const KNOWN_PUBLISH_ERRORS: PublishErrorKey[] = [
  "NOT_SIGNED_IN",
  "INCOMPLETE_CAMPAIGN",
  "INSUFFICIENT_CREDITS",
  "INVALID_OPPORTUNITY"
];

export function parsePublishError(err: unknown): PublishErrorKey {
  if (!err || typeof err !== "object") return "UNKNOWN";
  const message = (err as { message?: string }).message ?? "";
  for (const key of KNOWN_PUBLISH_ERRORS) {
    if (message.includes(key)) return key;
  }
  return "UNKNOWN";
}

function buildOpportunityPayload() {
  const state = useCampaignForm.getState();
  const totalCredits = selectTotalCreditsRequired(state);

  return {
    campaign_type: state.campaign_type,
    title: state.title,
    short_description: state.short_description,
    description: state.description,
    image_url: state.image_url,
    categories: state.categories ?? [],
    cash_amount: state.cash_amount ?? null,
    product_description: state.product_description ?? null,
    payment_methods: state.payment_methods ?? [],
    content_types: state.content_types ?? [],
    brand_mention: state.brand_mention,
    required_hashtags: state.required_hashtags ?? [],
    must_includes: state.must_includes ?? [],
    off_limits: state.off_limits ?? [],
    reference_image_urls: state.reference_image_urls ?? [],
    slots_available: state.slots_available,
    application_deadline: state.application_deadline,
    approval_mode: state.approval_mode ?? "manual",
    credit_cost_per_slot: totalCredits / Math.max(state.slots_available ?? 1, 1)
  };
}

export function usePublishCampaign() {
  const { brandContext, profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<PublishCampaignResult, Error, void>({
    mutationFn: async () => {
      const brandId = brandContext?.brandId ?? (profile?.user_type === "brand" ? profile.id : null);

      if (!profile?.id || !brandId) {
        throw new Error("NOT_SIGNED_IN");
      }

      const state = useCampaignForm.getState();

      if (!selectCanPublish(state)) {
        if (selectHasInsufficientCredits(state)) {
          throw new Error(
            `INSUFFICIENT_CREDITS: short by ${Math.abs(selectBalanceAfterPublish(state))}`
          );
        }

        throw new Error("INCOMPLETE_CAMPAIGN");
      }

      const { data, error } = await supabase.rpc("publish_campaign_rpc", {
        p_brand_id: brandId,
        p_opportunity: buildOpportunityPayload(),
        p_credits_to_deduct: selectTotalCreditsRequired(state),
        p_draft_id: state.draft_id
      });

      if (error) throw error;
      return data as PublishCampaignResult;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["brand-campaigns"] }),
        queryClient.invalidateQueries({ queryKey: ["drafts"] })
      ]);
      await refreshProfile();
      useCampaignForm.getState().reset();
    }
  });
}
