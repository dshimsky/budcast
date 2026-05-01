/**
 * useGiftingWorkflow — fetch gifting workflow record for an application.
 * useUpdateGiftingStatus — brand advances the gifting status.
 *
 * Gifting workflow is created server-side when a brand accepts a creator
 * on a gifting or hybrid campaign. The brand uses this hook to see
 * the current status and mark product as arranged.
 *
 * COMPLIANCE NOTE: BudCast tracks brand-creator collaboration status only.
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
  note?: string;
}

export function useUpdateGiftingStatus() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, UpdateGiftingStatusInput>({
    mutationFn: async ({ applicationId, status, note }) => {
      const { data: workflow, error: workflowError } = await supabase
        .from("gifting_workflow")
        .select("id")
        .eq("application_id", applicationId)
        .maybeSingle();
      if (workflowError) throw workflowError;
      if (!workflow?.id) throw new Error("GIFTING_WORKFLOW_NOT_FOUND");

      const { error } = await supabase.rpc("update_gifting_status", {
        p_gifting_id: workflow.id,
        p_new_status: status,
        p_notes: note?.trim() || null,
      });
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
      const { data: workflow, error: workflowError } = await supabase
        .from("gifting_workflow")
        .select("id")
        .eq("application_id", applicationId)
        .maybeSingle();
      if (workflowError) throw workflowError;
      if (!workflow?.id) throw new Error("GIFTING_WORKFLOW_NOT_FOUND");

      const { error } = await supabase.rpc("update_gifting_status", {
        p_gifting_id: workflow.id,
        p_new_status: "creator_received",
        p_notes: creator_feedback?.trim() || null,
      });
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
      const { data: workflow, error: workflowError } = await supabase
        .from("gifting_workflow")
        .select("id")
        .eq("application_id", applicationId)
        .maybeSingle();
      if (workflowError) throw workflowError;
      if (!workflow?.id) throw new Error("GIFTING_WORKFLOW_NOT_FOUND");

      const { error } = await supabase.rpc("update_gifting_status", {
        p_gifting_id: workflow.id,
        p_new_status: substitution_notes?.trim() ? "substitution_requested" : "creator_declined",
        p_notes: substitution_notes?.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gifting_workflow", variables.applicationId] });
      queryClient.invalidateQueries({ queryKey: ["submission-pipeline"] });
    },
  });
}
