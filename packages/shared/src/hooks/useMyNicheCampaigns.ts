/**
 * useMyNicheCampaigns — the creator-home "For You" query.
 *
 * Returns up to `limit` active campaigns where the opportunity's categories
 * overlap the creator's own niches. When the creator has no niches set,
 * falls back to the newest active campaigns (same shape, no personalization).
 *
 * Uses the same CampaignCatalogRow type as useCampaigns so cards can be
 * rendered with the same component.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/useAuth";
import type { CampaignCatalogRow } from "./useCampaigns";

export interface UseMyNicheCampaignsOptions {
  /** Max rows to return. Default 6 — For You is a preview surface. */
  limit?: number;
}

export function useMyNicheCampaigns(opts: UseMyNicheCampaignsOptions = {}) {
  const limit = opts.limit ?? 6;
  const { profile } = useAuth();
  const creatorId = profile?.id ?? null;
  const niches = profile?.niches ?? [];
  // Stable key piece — sort so ['Flower','Pre-rolls'] and ['Pre-rolls','Flower']
  // share a cache entry
  const nicheKey = [...niches].sort().join(',');

  return useQuery<CampaignCatalogRow[]>({
    queryKey: ['my-niche-campaigns', creatorId, nicheKey, limit],
    enabled: !!creatorId,
    queryFn: async () => {
      let q = supabase
        .from('opportunities')
        .select(
          `
          *,
          brand:users!opportunities_brand_id_fkey (
            id, company_name, badges, payment_rate, review_score,
            review_count, avatar_url
          )
        `,
        )
        .eq('status', 'active');

      // Only constrain to niches when the creator has them set —
      // otherwise return newest active across all categories.
      if (niches.length > 0) {
        q = q.overlaps('categories', niches);
      }

      q = q.order('created_at', { ascending: false, nullsFirst: false }).limit(limit);

      const { data, error } = await q;
      if (error) throw error;

      const rows = (data ?? []) as CampaignCatalogRow[];
      // Hide full campaigns (same rule as the main catalog)
      return rows.filter(
        (r) => (r.slots_filled ?? 0) < (r.slots_available ?? 0),
      );
    },
    staleTime: 30_000,
  });
}
