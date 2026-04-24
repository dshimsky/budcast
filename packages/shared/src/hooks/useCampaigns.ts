/**
 * useCampaigns — Free Store catalog query.
 *
 * Fetches active opportunities (status='active' and slots_filled < slots_available),
 * joined with the brand's user row for company_name + reputation. Supports:
 *
 *   - Type filter (null = all, or one of gifting/paid/hybrid)
 *   - Category filter (array of category strings; empty = all)
 *   - Sort (newest | highest_pay | ending_soon)
 *
 * Uses @tanstack/react-query for caching. The query key includes all filter
 * args so different filter combinations are cached independently.
 *
 * Returns the same shape as any react-query result: { data, isLoading, error, ... }.
 * We intentionally don't wrap this into a custom shape so callers get full
 * access to react-query features (refetch, isFetching, etc).
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { CampaignType, Opportunity, Badge } from "../types/database";

export type CampaignSort = 'newest' | 'highest_pay' | 'ending_soon';

export interface CampaignsFilters {
  type?: CampaignType | null;
  categories?: string[];
  sort?: CampaignSort;
  /** Include full campaigns in results. Default false — full ones hidden. */
  includeFull?: boolean;
}

/**
 * A catalog row is an Opportunity + the brand's minimal public profile
 * (what we show on the card and detail page without a second round-trip).
 */
export interface CampaignCatalogRow extends Opportunity {
  brand: {
    id: string;
    company_name: string | null;
    badges: Badge[];
    payment_rate: number | null;
    review_score: number | null;
    review_count: number;
    avatar_url: string | null;
  } | null;
}

export function useCampaigns(filters: CampaignsFilters = {}) {
  const type = filters.type ?? null;
  const categories = filters.categories ?? [];
  const sort = filters.sort ?? 'newest';
  const includeFull = filters.includeFull ?? false;

  return useQuery<CampaignCatalogRow[]>({
    // Include every filter so cache keys don't collide
    queryKey: ['campaigns', { type, categories, sort, includeFull }],
    queryFn: async () => {
      let q = supabase
        .from('opportunities')
        .select(
          `
          *,
          brand:users!opportunities_brand_id_fkey (
            id,
            company_name,
            badges,
            payment_rate,
            review_score,
            review_count,
            avatar_url
          )
        `,
        )
        .eq('status', 'active');

      if (type) {
        q = q.eq('campaign_type', type);
      }

      if (categories.length > 0) {
        // Postgres array-overlap operator: true if any element matches
        q = q.overlaps('categories', categories);
      }

      // Sort
      if (sort === 'newest') {
        q = q.order('created_at', { ascending: false, nullsFirst: false });
      } else if (sort === 'highest_pay') {
        // NULLS LAST so gifting campaigns (cash_amount=null) sort to the bottom
        q = q.order('cash_amount', { ascending: false, nullsFirst: false });
      } else if (sort === 'ending_soon') {
        q = q.order('application_deadline', {
          ascending: true,
          nullsFirst: false,
        });
      }

      const { data, error } = await q;
      if (error) throw error;

      let rows = (data ?? []) as CampaignCatalogRow[];

      // Filter out full campaigns client-side (Supabase can't express
      // "slots_filled < slots_available" comparing two columns via the
      // chained query builder — doing it post-fetch is fine for reasonable
      // catalog sizes).
      if (!includeFull) {
        rows = rows.filter(
          (r) => (r.slots_filled ?? 0) < (r.slots_available ?? 0),
        );
      }

      return rows;
    },
    // Cache 30s — catalog doesn't need to be bleeding-edge
    staleTime: 30_000,
  });
}
