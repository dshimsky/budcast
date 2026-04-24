import { useEffect, useRef } from "react";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import { useCampaignForm } from "../stores/campaignForm";
import type { OpportunityDraftFormState } from "../types/database";

const DEBOUNCE_MS = 800;

function extractFormState(state: ReturnType<typeof useCampaignForm.getState>): OpportunityDraftFormState {
  const { current_step, draft_id, last_saved_at, brand_credits_balance, ...formState } = state;
  return formState as OpportunityDraftFormState;
}

function hasAnyFormData(s: OpportunityDraftFormState) {
  if (s.campaign_type) return true;
  if (s.title?.trim()) return true;
  if (s.short_description?.trim()) return true;
  if (s.description?.trim()) return true;
  if (s.image_url) return true;
  if ((s.categories?.length ?? 0) > 0) return true;
  if (s.cash_amount != null) return true;
  if (s.product_description?.trim()) return true;
  if ((s.payment_methods?.length ?? 0) > 0) return true;
  if ((s.content_types?.length ?? 0) > 0) return true;
  if (s.brand_mention?.trim()) return true;
  const userTags = (s.required_hashtags ?? []).filter((tag) => tag !== "#ad" && tag !== "#gifted");
  if (userTags.length > 0) return true;
  if ((s.must_includes?.length ?? 0) > 0) return true;
  if ((s.off_limits?.length ?? 0) > 0) return true;
  if ((s.reference_image_urls?.length ?? 0) > 0) return true;
  if (s.application_deadline) return true;
  if ((s.slots_available ?? 1) > 1) return true;
  return false;
}

export function useAutosaveDraft(enabled = true) {
  const { profile } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const brandId = profile?.id ?? null;

  useEffect(() => {
    if (!enabled) return;
    if (!brandId || profile?.user_type !== "brand") return;

    async function saveDraft() {
      if (inFlightRef.current) return;

      const state = useCampaignForm.getState();
      const formState = extractFormState(state);

      if (!hasAnyFormData(formState)) return;

      inFlightRef.current = true;
      try {
        if (state.draft_id) {
          const { error } = await supabase
            .from("opportunity_drafts")
            .update({
              form_state: formState,
              current_step: state.current_step
            })
            .eq("id", state.draft_id);

          if (error) throw error;
          state.markSaved(state.draft_id);
        } else {
          const { data, error } = await supabase
            .from("opportunity_drafts")
            .insert({
              brand_id: brandId,
              form_state: formState,
              current_step: state.current_step
            })
            .select("id")
            .single();

          if (error) throw error;
          if (data?.id) state.markSaved(data.id);
        }
      } catch (error) {
        console.warn("[autosave] failed:", error);
      } finally {
        inFlightRef.current = false;
      }
    }

    const unsubscribe = useCampaignForm.subscribe(
      (state) => ({
        campaign_type: state.campaign_type,
        title: state.title,
        short_description: state.short_description,
        description: state.description,
        image_url: state.image_url,
        categories: state.categories,
        cash_amount: state.cash_amount,
        product_description: state.product_description,
        payment_methods: state.payment_methods,
        content_types: state.content_types,
        brand_mention: state.brand_mention,
        required_hashtags: state.required_hashtags,
        must_includes: state.must_includes,
        off_limits: state.off_limits,
        reference_image_urls: state.reference_image_urls,
        slots_available: state.slots_available,
        application_deadline: state.application_deadline,
        approval_mode: state.approval_mode,
        current_step: state.current_step
      }),
      () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(saveDraft, DEBOUNCE_MS);
      }
    );

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [brandId, enabled, profile?.user_type]);
}
