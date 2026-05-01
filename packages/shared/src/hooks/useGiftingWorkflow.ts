/**
 * useGiftingWorkflow — fetch gifting workflow record for an application.
 * useUpdateGiftingStatus — brand advances the gifting status.
 *
 * Gifting workflow is created server-side when a brand accepts a creator
 * on a gifting or hybrid campaign. The brand uses this hook to see
 * the current status and mark product as arranged (brand_shipped).
 *
 * COMPLIANCE NOTE: BudCast never facilitates cannabis sale, delivery,
 * or pickup. This hook tracks brand-creator collaboration status only.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { GiftingWorkflow, GiftingWorkflowStatus } from "../types/database";

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

export function useGiftingWorkflow(applicationId: string | null | undefined) {
  return useQuery<GiftingWorkflow | null>({
    queryKey: ["gifting_workflow", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      if (!applicationId) return null;
      const { data, error } = await supabase
        .from("gifting_workflow")
        .select("*")
        .eq("application_id", applicationId)
        .maybeSingle();
      if (error) throw error;
      return (data as GiftingWorkflow) ?? null;
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export interface UpdateGiftingStatusInput {
  applicationId: string;
  status: GiftingWorkflowStatus;
  brand_contact_method?: string;
}

export function useUpdateGiftingStatus() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, UpdateGiftingStatusInput>({
    mutationFn: async ({ applicationId, status, brand_contact_method }) => {
      const update: Record<string, unknown> = { status };
      if (brand_contact_method?.trim()) {
        update.brand_contact_method = brand_contact_method.trim();
        update.brand_contact_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("gifting_workflow")
        .update(update)
        .eq("application_id", applicationId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gifting_workflow", variables.applicationId],
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Creator mutations
// ---------------------------------------------------------------------------

export interface CreatorConfirmReceiptInput {
  applicationId: string;
  creator_feedback?: string;
}

/** Creator confirms they received the gifted product. */
export function useCreatorConfirmReceipt() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, CreatorConfirmReceiptInput>({
    mutationFn: async ({ applicationId, creator_feedback }) => {
      const update: Record<string, unknown> = {
        status: 'creator_received',
        creator_received_at: new Date().toISOString(),
      };
      if (creator_feedback?.trim()) update.creator_feedback = creator_feedback.trim();
      const { error } = await supabase
        .from("gifting_workflow")
        .update(update)
        .eq("application_id", applicationId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gifting_workflow", variables.applicationId] });
      queryClient.invalidateQueries({ queryKey: ["submission-pipeline"] });
    },
  });
}

export interface CreatorDeclineGiftingInput {
  applicationId: string;
  /** If provided, sets status to substitution_requested instead of creator_declined. */
  substitution_notes?: string;
}

/** Creator declines the product, or requests a substitution if notes are provided. */
export function useCreatorDeclineGifting() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, CreatorDeclineGiftingInput>({
    mutationFn: async ({ applicationId, substitution_notes }) => {
      const update: Record<string, unknown> = {
        status: substitution_notes?.trim() ? 'substitution_requested' : 'creator_declined',
      };
      if (substitution_notes?.trim()) update.substitution_notes = substitution_notes.trim();
      const { error } = await supabase
        .from("gifting_workflow")
        .update(update)
        .eq("application_id", applicationId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gifting_workflow", variables.applicationId] });
      queryClient.invalidateQueries({ queryKey: ["submission-pipeline"] });
    },
  });
}
