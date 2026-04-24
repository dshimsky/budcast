/**
 * useReviewApplication — brand accepts or rejects an application.
 *
 * Wraps review_application_rpc. On success invalidates the applicants
 * query for the affected opportunity, refreshes the brand's profile
 * (in case slot-fill auto-rejects refunded credits to other creators
 * — which doesn't affect THIS brand's balance, but if the campaign
 * closed it's worth refetching), and invalidates the catalog so
 * slot counts and closed-status update everywhere.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/useAuth";

export type ReviewErrorKey =
  | 'INVALID_DECISION'
  | 'APPLICATION_NOT_FOUND'
  | 'APPLICATION_NOT_PENDING'
  | 'NOT_OPPORTUNITY_OWNER'
  | 'UNKNOWN';

export type ReviewDecision = 'accept' | 'reject';

export interface ReviewApplicationInput {
  applicationId: string;
  opportunityId: string; // for cache invalidation
  decision: ReviewDecision;
}

export type ReviewApplicationResult =
  | {
      decision: 'accept';
      application_id: string;
      new_status: 'accepted';
      slots_filled: number;
      campaign_closed: boolean;
      auto_rejected_count: number;
    }
  | {
      decision: 'reject';
      application_id: string;
      new_status: 'rejected';
      credits_returned: number;
    };

const KNOWN_REVIEW_ERROR_KEYS: ReviewErrorKey[] = [
  'INVALID_DECISION',
  'APPLICATION_NOT_FOUND',
  'APPLICATION_NOT_PENDING',
  'NOT_OPPORTUNITY_OWNER',
];

export function parseReviewError(err: unknown): ReviewErrorKey {
  if (!err || typeof err !== 'object') return 'UNKNOWN';
  const msg = (err as { message?: string }).message ?? '';
  for (const key of KNOWN_REVIEW_ERROR_KEYS) {
    if (msg.includes(key)) return key;
  }
  return 'UNKNOWN';
}

export function useReviewApplication() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation<ReviewApplicationResult, unknown, ReviewApplicationInput>({
    mutationFn: async (input) => {
      if (!profile?.id) {
        throw new Error('NOT_SIGNED_IN');
      }
      const { data, error } = await supabase.rpc('review_application_rpc', {
        p_application_id: input.applicationId,
        p_brand_id: profile.id,
        p_decision: input.decision,
      });
      if (error) throw error;
      return data as ReviewApplicationResult;
    },
    onSuccess: async (_data, variables) => {
      // Refresh applicants list for this opportunity
      await queryClient.invalidateQueries({
        queryKey: ['applicants', variables.opportunityId],
      });
      // Refresh catalog (slot counts + campaign_closed status)
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      await queryClient.invalidateQueries({
        queryKey: ['campaign', variables.opportunityId],
      });
    },
  });
}
