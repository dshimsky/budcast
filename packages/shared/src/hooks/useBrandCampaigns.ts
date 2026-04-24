/**
 * useBrandCampaigns — loads campaigns owned by the signed-in brand and
 * enriches each with a pending-applications count for the dashboard.
 *
 * Shape is flat for direct consumption by BrandDashboard. Status tone is
 * derived from slot fill and deadline proximity:
 *   - closed:       slots_filled >= slots_available
 *   - needs-action: pending applications > 0
 *   - closing:      deadline < 3 days
 *   - accepting:    default
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";

export interface BrandCampaignRow {
  id: string;
  campaign_type: 'gifting' | 'paid' | 'hybrid';
  title: string;
  credit_cost_per_slot: number;
  slots_available: number;
  slots_filled: number;
  application_deadline: string | null;
  cash_amount: number | null;
  product_description: string | null;
  pending_applications: number;
  created_at: string;
}

export function useBrandCampaigns() {
  const { profile } = useAuth();
  const brandId = profile?.id;

  return useQuery({
    queryKey: ['brand-campaigns', brandId],
    enabled: !!brandId && profile?.user_type === 'brand',
    queryFn: async (): Promise<BrandCampaignRow[]> => {
      if (!brandId) return [];

      // Pull the brand's campaigns (active + draft are both shown — filter
      // upstream if only active is needed).
      const { data: campaigns, error } = await supabase
        .from('opportunities')
        .select(
          'id, campaign_type, title, credit_cost_per_slot, credit_cost, slots_available, slots_filled, application_deadline, cash_amount, product_description, created_at, status',
        )
        .eq('brand_id', brandId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[useBrandCampaigns] fetch failed:', error.message);
        return [];
      }
      if (!campaigns || campaigns.length === 0) return [];

      // Count pending applications per campaign in a single query.
      const campaignIds = campaigns.map((c) => c.id);
      const { data: applications, error: appsErr } = await supabase
        .from('applications')
        .select('opportunity_id, status')
        .in('opportunity_id', campaignIds)
        .eq('status', 'pending');

      if (appsErr) {
        console.warn('[useBrandCampaigns] applications fetch failed:', appsErr.message);
      }

      const pendingByCampaign = new Map<string, number>();
      for (const app of applications ?? []) {
        pendingByCampaign.set(
          app.opportunity_id,
          (pendingByCampaign.get(app.opportunity_id) ?? 0) + 1,
        );
      }

      return campaigns.map((c) => ({
        id: c.id,
        campaign_type: c.campaign_type as 'gifting' | 'paid' | 'hybrid',
        title: c.title,
        credit_cost_per_slot: c.credit_cost_per_slot ?? c.credit_cost ?? 0,
        slots_available: c.slots_available ?? 0,
        slots_filled: c.slots_filled ?? 0,
        application_deadline: c.application_deadline,
        cash_amount: c.cash_amount,
        product_description: c.product_description,
        pending_applications: pendingByCampaign.get(c.id) ?? 0,
        created_at: c.created_at,
      }));
    },
  });
}
