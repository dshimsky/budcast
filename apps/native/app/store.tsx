import {
  formatCampaignType,
  formatCurrency,
  formatDeadline,
  hasCompletedOnboarding,
  useAuth,
  useCampaigns,
  useMyApplications,
  type CampaignType
} from "@budcast/shared";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { CampaignCard, SegmentedControl, StatusPill, TrustRow } from "../components/mobile-system";
import {
  FadeInSection,
  GlassCard,
  PremiumScroll,
  SoftCard
} from "../components/premium";

const campaignTypes = [
  { label: "For You", value: "for_you" },
  { label: "Local", value: "local" },
  { label: "Product", value: "gifting" },
  { label: "Paid", value: "paid" },
  { label: "Paid + Product", value: "hybrid" }
] as const satisfies Array<{ label: string; value: CampaignFilter }>;

type CampaignFilter = "for_you" | "local" | CampaignType;

function getCampaignTypeFilter(filter: CampaignFilter): CampaignType | null {
  return filter === "gifting" || filter === "paid" || filter === "hybrid" ? filter : null;
}

function getCampaignCompensation(campaign: {
  campaign_type: CampaignType;
  cash_amount: number | null;
  product_description: string | null;
}) {
  if (campaign.campaign_type === "paid" && campaign.cash_amount) return formatCurrency(campaign.cash_amount);
  if (campaign.campaign_type === "hybrid" && campaign.cash_amount) return `${formatCurrency(campaign.cash_amount)} + Product`;
  return campaign.product_description ? "Product" : "Product only";
}

function formatPlatform(platform?: string | null) {
  if (!platform) return "Social";
  return platform
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace("Instagram Reel", "IG Reel")
    .replace("Tiktok", "TikTok");
}

function isLocalCampaign(campaign: { eligible_states: string[]; location: string | null }, stateCode?: string | null) {
  if (!stateCode) return false;
  return campaign.eligible_states?.includes(stateCode) || campaign.location?.toUpperCase().includes(stateCode) || false;
}

export function StoreScreen() {
  const { loading, session, profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState<CampaignFilter>("for_you");
  const activeType = getCampaignTypeFilter(activeFilter);
  const campaigns = useCampaigns({ type: activeType, sort: "newest" });
  const myApplications = useMyApplications();
  const campaignRows = campaigns.data ?? [];
  const visibleCampaigns = useMemo(
    () =>
      activeFilter === "local"
        ? campaignRows.filter((campaign) => isLocalCampaign(campaign, profile?.state_code))
        : campaignRows,
    [activeFilter, campaignRows, profile?.state_code]
  );

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }

    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
    }
  }, [loading, profile, session]);

  return (
    <PremiumScroll>
      <FadeInSection>
        <GlassCard>
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[10px] font-bold uppercase tracking-[2px] text-[#a59a86]">Campaigns</Text>
              <Text className="mt-2 text-[22px] font-black leading-tight tracking-tight text-[#fbf8f4]">Creator campaigns</Text>
            </View>
            <View className="items-end">
              <Text className="text-[28px] font-black leading-none text-[#fbf8f4]">
                {visibleCampaigns.length || campaignRows.length || "--"}
              </Text>
              <Text className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#a59a86]">Open</Text>
            </View>
          </View>
          <View className="mt-6">
            <SegmentedControl options={[...campaignTypes]} value={activeFilter} onChange={setActiveFilter} />
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={80}>
        {visibleCampaigns.map((campaign) => {
          const applied = myApplications.isApplied(campaign.id);
          const remainingSlots = Math.max((campaign.slots_available ?? 0) - (campaign.slots_filled ?? 0), 0);
          const platform = formatPlatform(campaign.target_platforms?.[0] ?? campaign.content_types?.[0]);

          return (
            <CampaignCard
              brand={campaign.brand?.company_name ?? "Cannabis brand"}
              ctaLabel={applied ? "View status" : "View brief"}
              imageUrl={campaign.image_url}
              key={campaign.id}
              onPress={() => router.push(`/campaigns/${campaign.id}`)}
              title={campaign.title}
            >
              <View className="flex-row flex-wrap gap-2">
                <StatusPill tone={campaign.campaign_type === "paid" ? "action" : "premium"}>
                  {formatCampaignType(campaign.campaign_type)}
                </StatusPill>
                <StatusPill tone="default">{platform}</StatusPill>
                {applied ? <StatusPill tone="premium">Applied</StatusPill> : null}
              </View>

              <Text className="mt-3 text-sm leading-6 text-budcast-muted" numberOfLines={2}>
                {campaign.short_description || campaign.description}
              </Text>

              <View className="mt-4 flex-row gap-2">
                <View className="flex-1 rounded-[14px] bg-white/[0.04] px-3 py-3">
                  <Text className="text-base font-black text-budcast-lime">{getCampaignCompensation(campaign)}</Text>
                  <Text className="mt-1 text-[10px] font-bold uppercase tracking-[1.2px] text-budcast-muted">Compensation</Text>
                </View>
                <View className="flex-1 rounded-[14px] bg-white/[0.04] px-3 py-3">
                  <Text className="text-base font-black text-budcast-text">{formatDeadline(campaign.application_deadline)}</Text>
                  <Text className="mt-1 text-[10px] font-bold uppercase tracking-[1.2px] text-budcast-muted">Deadline</Text>
                </View>
              </View>

              <View className="mt-4 flex-row items-center justify-between gap-3">
                <Text className="text-sm font-semibold text-budcast-muted">{remainingSlots} open spots</Text>
                <Text className="text-xs font-semibold text-budcast-muted">
                  {campaign.credit_cost_per_slot ?? campaign.credit_cost ?? 0} credits
                </Text>
              </View>

              <View className="mt-4">
                <TrustRow
                  items={[
                    { label: "Payment protected", tone: campaign.cash_amount ? "action" : "default" },
                    { label: "Compliance fit", tone: "trust" },
                    { label: "Usage rights", tone: "premium" }
                  ]}
                />
              </View>
            </CampaignCard>
          );
        })}

        {campaigns.isLoading ? (
          <SoftCard>
            <Text className="text-base text-[#d7cdbd]">Loading creator opportunities...</Text>
          </SoftCard>
        ) : null}

        {!campaigns.isLoading && visibleCampaigns.length === 0 ? (
          <SoftCard>
            <Text className="text-base text-[#d7cdbd]">No campaigns match this filter yet.</Text>
          </SoftCard>
        ) : null}
      </FadeInSection>
    </PremiumScroll>
  );
}

export default StoreScreen;
