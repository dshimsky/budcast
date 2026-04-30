import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { CampaignCatalogRow } from './useCampaigns';
import type { BrandDirectoryRow } from './useBrands';

export type BrandProfileResult = {
  brand: BrandDirectoryRow;
  campaigns: CampaignCatalogRow[];
};

export function useBrandProfile(brandId: string | null | undefined) {
  return useQuery<BrandProfileResult | null>({
    queryKey: ['brand-profile', brandId],
    enabled: Boolean(brandId),
    queryFn: async () => {
      const { data: brand, error: brandError } = await supabase
        .from('public_profiles')
        .select(
          'id, company_name, name, bio, location, avatar_url, cover_url, website, instagram, tiktok, youtube, facebook, linkedin, x_profile, portfolio_image_urls, niches, badges, payment_rate, review_score, review_count, total_campaigns, successful_campaigns, account_status',
        )
        .eq('id', brandId!)
        .eq('user_type', 'brand')
        .eq('account_status', 'active')
        .maybeSingle();

      if (brandError) throw brandError;
      if (!brand) return null;

      const { data: campaigns, error: campaignError } = await supabase
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
        .eq('brand_id', brandId!)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (campaignError) throw campaignError;

      return {
        brand: brand as BrandDirectoryRow,
        campaigns: (campaigns ?? []) as CampaignCatalogRow[],
      };
    },
    staleTime: 30_000,
  });
}
