/**
 * useDrafts — brand's in-progress campaign drafts.
 *
 * Reads from opportunity_drafts table (created in migration 010), filtered
 * to the current brand. Ordered by updated_at DESC so the most recent
 * draft is first — matches the dashboard strip's preview-N behavior.
 *
 * Provides delete mutations used by the strip's trash icon and
 * DraftsResumeModal's "discard all" button.
 *
 * Returns extended draft rows with a derived `title` helper that falls
 * back to "Untitled draft" when form_state.title is missing.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/useAuth";
import type { OpportunityDraft } from "../types/database";

export interface DraftRow extends OpportunityDraft {
  /** Derived — form_state.title or "Untitled draft" */
  display_title: string;
}

function toDraftRow(raw: OpportunityDraft): DraftRow {
  const t = raw.form_state?.title;
  return {
    ...raw,
    display_title:
      typeof t === 'string' && t.trim().length > 0 ? t.trim() : 'Untitled draft',
  };
}

export function useDrafts() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const brandId = profile?.id ?? null;

  const query = useQuery<DraftRow[]>({
    queryKey: ['drafts', brandId],
    enabled: !!brandId && profile?.user_type === 'brand',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunity_drafts')
        .select('*')
        .eq('brand_id', brandId!)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return ((data ?? []) as OpportunityDraft[]).map(toDraftRow);
    },
    staleTime: 10_000,
  });

  const deleteDraft = useMutation<void, unknown, string>({
    mutationFn: async (draftId) => {
      const { error } = await supabase
        .from('opportunity_drafts')
        .delete()
        .eq('id', draftId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['drafts', brandId] });
    },
  });

  const deleteAllDrafts = useMutation<void, unknown, void>({
    mutationFn: async () => {
      if (!brandId) throw new Error('NOT_SIGNED_IN');
      const { error } = await supabase
        .from('opportunity_drafts')
        .delete()
        .eq('brand_id', brandId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['drafts', brandId] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    deleteDraft,
    deleteAllDrafts,
    hasDrafts: (query.data ?? []).length > 0,
    count: (query.data ?? []).length,
  };
}
