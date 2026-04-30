/**
 * useMyApplications — the current creator's applications, used to mark
 * "Applied" state on catalog cards and the detail page.
 *
 * Returns pending + accepted + completed applications (the states that
 * mean "I'm committed to this campaign"). Rejected/expired applications
 * do NOT block re-applying (the slots_filled check will usually prevent
 * it anyway, but the business logic says a creator CAN re-apply if they
 * were previously rejected and the campaign reopens slots).
 *
 * Exposes an `isApplied(opportunityId)` helper because callers need
 * O(1) membership checks across the catalog render.
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/useAuth";
import type { Application, CampaignType } from "../types/database";

/**
 * Minimal opportunity + brand info joined on applications. Kept narrow
 * so we don't pull 20+ fields we don't need on the home list.
 */
export interface ApplicationOpportunitySummary {
  id: string;
  title: string;
  campaign_type: CampaignType;
  image_url: string | null;
  brand: {
    id: string;
    company_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ApplicationWithOpportunity extends Application {
  opportunity: ApplicationOpportunitySummary | null;
}

export interface UseMyApplicationsResult {
  data: ApplicationWithOpportunity[] | undefined;
  isLoading: boolean;
  error: unknown;
  /** O(1) check: has this creator applied to this opportunity (pending/accepted/completed)? */
  isApplied: (opportunityId: string) => boolean;
  /** Return the full application row if it exists — useful for detail page state */
  getApplication: (opportunityId: string) => ApplicationWithOpportunity | undefined;
}

export function useMyApplications(): UseMyApplicationsResult {
  const { profile } = useAuth();
  const creatorId = profile?.id ?? null;

  const query = useQuery<ApplicationWithOpportunity[]>({
    queryKey: ['my-applications', creatorId],
    // Only run when we know who we are and they're a creator
    enabled: !!creatorId && profile?.user_type === 'creator',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(
          `
          *,
          opportunity:opportunities!applications_opportunity_id_fkey (
            id, title, campaign_type, image_url,
            brand:users!opportunities_brand_id_fkey (
              id, company_name, avatar_url
            )
          )
        `,
        )
        .eq('creator_id', creatorId!)
        .in('status', ['pending', 'accepted', 'completed'])
        .order('applied_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ApplicationWithOpportunity[];
    },
    staleTime: 10_000, // shorter than catalog — freshly-applied state matters
  });

  // Build an O(1) lookup map. useMemo so we don't rebuild every render.
  const byOpportunityId = useMemo(() => {
    const map = new Map<string, ApplicationWithOpportunity>();
    (query.data ?? []).forEach((app) => {
      map.set(app.opportunity_id, app);
    });
    return map;
  }, [query.data]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isApplied: (id) => byOpportunityId.has(id),
    getApplication: (id) => byOpportunityId.get(id),
  };
}
