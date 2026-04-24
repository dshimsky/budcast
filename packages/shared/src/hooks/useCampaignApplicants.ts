/**
 * useCampaignApplicants — brand's view of applicants on one of their campaigns.
 *
 * Returns applications for an opportunity, joined with the creator's public
 * profile (name, avatar, reputation, socials, badges, niches, portfolio).
 * Filterable by status (pending/accepted/rejected/all).
 *
 * Also returns a counts object so the tab UI can show pending/accepted/
 * rejected counts without a second round-trip.
 *
 * RLS on applications already restricts brands to seeing only applications
 * to their own opportunities (see migration 003).
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type {
  Application,
  Badge,
  User,
} from "../types/database";

export type ApplicantStatusFilter = 'pending' | 'accepted' | 'rejected' | 'all';

/**
 * Creator subset shown on applicant rows + profile modal. Pulled from the
 * users table join. Not all fields are strictly needed for the row, but
 * modal uses them all so we fetch once and avoid a second query.
 */
export type ApplicantCreator = Pick<
  User,
  | 'id'
  | 'name'
  | 'bio'
  | 'location'
  | 'avatar_url'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'follower_count_instagram'
  | 'follower_count_tiktok'
  | 'follower_count_youtube'
  | 'portfolio_image_urls'
  | 'niches'
  | 'completion_rate'
  | 'review_score'
  | 'review_count'
  | 'total_campaigns'
> & { badges: Badge[] };

export interface ApplicantRow extends Application {
  creator: ApplicantCreator | null;
}

export interface ApplicantCounts {
  pending: number;
  accepted: number;
  rejected: number;
  total: number;
}

export interface UseCampaignApplicantsResult {
  data: ApplicantRow[] | undefined;
  counts: ApplicantCounts;
  isLoading: boolean;
  error: unknown;
}

export function useCampaignApplicants(
  opportunityId: string | null | undefined,
  statusFilter: ApplicantStatusFilter = 'pending',
): UseCampaignApplicantsResult {
  // We fetch ALL applications for this opportunity in one query, then
  // filter client-side by tab. This lets us compute counts for every
  // status without 3 separate queries — and keeps the tab switch
  // instant since everything's in memory.
  const query = useQuery<ApplicantRow[]>({
    queryKey: ['applicants', opportunityId],
    enabled: !!opportunityId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(
          `
          *,
          creator:users!applications_creator_id_fkey (
            id, name, bio, location, avatar_url,
            instagram, tiktok, youtube,
            follower_count_instagram, follower_count_tiktok, follower_count_youtube,
            portfolio_image_urls, niches, badges,
            completion_rate, review_score, review_count, total_campaigns
          )
        `,
        )
        .eq('opportunity_id', opportunityId!)
        .order('applied_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ApplicantRow[];
    },
    staleTime: 10_000,
  });

  const all = query.data ?? [];
  const counts: ApplicantCounts = {
    pending: all.filter((a) => a.status === 'pending').length,
    accepted: all.filter((a) => a.status === 'accepted').length,
    rejected: all.filter((a) => a.status === 'rejected').length,
    total: all.length,
  };

  const filtered =
    statusFilter === 'all'
      ? all
      : all.filter((a) => a.status === statusFilter);

  return {
    data: filtered,
    counts,
    isLoading: query.isLoading,
    error: query.error,
  };
}
