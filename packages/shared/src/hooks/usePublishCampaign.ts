import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import {
  autoInjectComplianceTag,
  selectBalanceAfterPublish,
  selectCanPublish,
  selectHasInsufficientCredits,
  selectTotalCreditsRequired,
  useCampaignForm
} from "../stores/campaignForm";
import { hasCompletedTrustCompliance } from "../lib/profile";

export type PublishErrorKey =
  | "NOT_SIGNED_IN"
  | "COMPLIANCE_REQUIRED"
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
  "COMPLIANCE_REQUIRED",
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
  const disclosureTags = autoInjectComplianceTag(state);

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
    credit_cost_per_slot: totalCredits / Math.max(state.slots_available ?? 1, 1),
    rights_organic_repost: state.rights_organic_repost ?? true,
    rights_paid_ads: state.rights_paid_ads ?? false,
    rights_whitelisting: state.rights_whitelisting ?? false,
    rights_handle_licensing: state.rights_handle_licensing ?? false,
    rights_duration_days: state.rights_duration_days ?? null,
    rights_territory: state.rights_territory ?? "US",
    rights_exclusive: state.rights_exclusive ?? false,
    rights_exclusivity_days: state.rights_exclusivity_days ?? null,
    rights_no_ai_training: state.rights_no_ai_training ?? true,
    rights_revocable: state.rights_revocable ?? false,
    rights_revocation_notice_days: state.rights_revocation_notice_days ?? 30,
    rights_confirmed: state.rights_confirmed === true,
    eligible_states: state.eligible_states ?? [],
    target_platforms: state.target_platforms ?? [],
    disclosure_tags: disclosureTags,
    prohibited_content: state.prohibited_content ?? [
      "no_health_claims",
      "no_sale_language",
      "no_minors",
      "no_driving",
      "no_undisclosed_use"
    ],
    compliance_checklist_done: state.compliance_checklist_done === true,
    min_applicant_age: state.min_applicant_age ?? 21
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

      if (!hasCompletedTrustCompliance(profile)) {
        throw new Error("COMPLIANCE_REQUIRED");
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
