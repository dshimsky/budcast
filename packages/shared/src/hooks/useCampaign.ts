/**
 * useCampaign — fetch a single opportunity by id, joined with its brand's
 * public profile. Used by the campaign detail page and apply modal.
 *
 * Returns the same CampaignCatalogRow shape as useCampaigns so components
 * can be written once and reused in both contexts.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { CampaignCatalogRow } from "./useCampaigns";

export function useCampaign(id: string | null | undefined) {
  return useQuery<CampaignCatalogRow | null>({
    queryKey: ['campaign', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(
          `
          *,
          brand:users!opportunities_brand_id_fkey (
            id,
            company_name,
            bio,
            avatar_url,
            badges,
            payment_rate,
            review_score,
            review_count
          )
        `,
        )
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as CampaignCatalogRow | null;
    },
    staleTime: 30_000,
  });
}
