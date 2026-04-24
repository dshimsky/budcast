/**
 * useApplyToCampaign — wraps the apply_to_campaign_rpc Supabase RPC.
 *
 * On success:
 *   - Invalidates 'my-applications' query so the "Applied" badge appears
 *   - Invalidates 'campaigns' query so slot counts refresh
 *   - Invalidates 'campaign' query for the specific opportunity
 *   - Calls refreshProfile() so the credit balance in the UI updates
 *
 * On error: parses the Postgres RAISE EXCEPTION message into a known
 * error key that callers can display to the user.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/useAuth";

export type ApplyErrorKey =
  | 'USER_NOT_CREATOR'
  | 'OPPORTUNITY_NOT_AVAILABLE'
  | 'OPPORTUNITY_FULL'
  | 'ALREADY_APPLIED'
  | 'PITCH_REQUIRED'
  | 'PITCH_LENGTH_INVALID'
  | 'INSUFFICIENT_CREDITS'
  | 'UNKNOWN';

export interface ApplyToCampaignInput {
  opportunityId: string;
  message: string | null;
}

export interface ApplyToCampaignResult {
  application_id: string;
  credits_spent: number;
  new_balance: number;
}

const KNOWN_ERROR_KEYS: ApplyErrorKey[] = [
  'USER_NOT_CREATOR',
  'OPPORTUNITY_NOT_AVAILABLE',
  'OPPORTUNITY_FULL',
  'ALREADY_APPLIED',
  'PITCH_REQUIRED',
  'PITCH_LENGTH_INVALID',
  'INSUFFICIENT_CREDITS',
];

/**
 * Parse a Supabase RPC error into a known error key. Our RPCs RAISE
 * EXCEPTION '<KEY>' which Postgres wraps into a message like
 * "ERROR: USER_NOT_CREATOR" that surfaces in error.message.
 */
export function parseApplyError(err: unknown): ApplyErrorKey {
  if (!err || typeof err !== 'object') return 'UNKNOWN';
  const msg = (err as { message?: string }).message ?? '';
  for (const key of KNOWN_ERROR_KEYS) {
    if (msg.includes(key)) return key;
  }
  return 'UNKNOWN';
}

export function useApplyToCampaign() {
  const queryClient = useQueryClient();
  const { profile, refreshProfile } = useAuth();

  return useMutation<ApplyToCampaignResult, unknown, ApplyToCampaignInput>({
    mutationFn: async (input) => {
      if (!profile?.id) {
        throw new Error('NOT_SIGNED_IN');
      }
      const { data, error } = await supabase.rpc('apply_to_campaign_rpc', {
        p_creator_id: profile.id,
        p_opportunity_id: input.opportunityId,
        p_message: input.message,
      });
      if (error) throw error;
      return data as ApplyToCampaignResult;
    },
    onSuccess: async (_data, variables) => {
      // Refresh creator's applications list — catalog/detail update to "Applied"
      await queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      // Refresh catalog so slot counts move
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      // Refresh the specific opportunity's detail view
      await queryClient.invalidateQueries({ queryKey: ['campaign', variables.opportunityId] });
      // Refresh profile so credit balance in the nav updates
      if (refreshProfile) await refreshProfile();
    },
  });
}
