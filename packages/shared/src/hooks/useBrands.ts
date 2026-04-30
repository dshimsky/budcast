import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Badge, PublicProfile } from '../types/database';

export type BrandDirectoryRow = Pick<
  PublicProfile,
  | 'id'
  | 'company_name'
  | 'name'
  | 'bio'
  | 'location'
  | 'avatar_url'
  | 'cover_url'
  | 'website'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'facebook'
  | 'linkedin'
  | 'x_profile'
  | 'portfolio_image_urls'
  | 'niches'
  | 'badges'
  | 'payment_rate'
  | 'review_score'
  | 'review_count'
  | 'total_campaigns'
  | 'successful_campaigns'
  | 'account_status'
> & {
  badges: Badge[];
};

export function useBrands() {
  return useQuery<BrandDirectoryRow[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_profiles')
        .select(
          'id, company_name, name, bio, location, avatar_url, cover_url, website, instagram, tiktok, youtube, facebook, linkedin, x_profile, portfolio_image_urls, niches, badges, payment_rate, review_score, review_count, total_campaigns, successful_campaigns, account_status',
        )
        .eq('user_type', 'brand')
        .eq('account_status', 'active')
        .order('total_campaigns', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return (data ?? []) as BrandDirectoryRow[];
    },
    staleTime: 30_000,
  });
}
