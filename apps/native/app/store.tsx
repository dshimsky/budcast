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
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  FadeInSection,
  GlassCard,
  HeroChip,
  PremiumScroll,
  PrimaryPill,
  SectionTitle,
  SoftCard
} from "../components/premium";
import { SectionBlock, SectionEyebrow } from "../components/sections";

const campaignTypes: Array<{ label: string; value: CampaignType | null }> = [
  { label: "All", value: null },
  { label: "Gifting", value: "gifting" },
  { label: "Paid", value: "paid" },
  { label: "Hybrid", value: "hybrid" }
];

export default function StoreScreen() {
  const { loading, session, profile } = useAuth();
  const [activeType, setActiveType] = useState<CampaignType | null>(null);
  const campaigns = useCampaigns({ type: activeType, sort: "newest" });
  const myApplications = useMyApplications();

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
              <Text className="text-[10px] font-bold uppercase tracking-[2px] text-[#a59a86]">Free Store</Text>
              <Text className="mt-2 text-[22px] font-black leading-tight tracking-tight text-[#fbf8f4]">Creator Opportunities</Text>
            </View>
            <View className="items-end">
              <Text className="text-[28px] font-black leading-none text-[#fbf8f4]">
                {campaigns.data?.length ?? 0}
              </Text>
              <Text className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#a59a86]">Open</Text>
            </View>
          </View>
          <View className="mt-6 flex-row flex-wrap gap-2">
            {campaignTypes.map((type) => {
              const active = activeType === type.value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className={`rounded-full px-4 py-2 ${active ? "bg-[#b8ff3d]" : "border border-white/[0.15] bg-white/[0.07]"}`}
                  key={type.label}
                  onPress={() => setActiveType(type.value)}
                >
                  <Text className={`text-sm ${active ? "font-semibold text-[#070806]" : "font-medium text-[#e8dccd]"}`}>{type.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={80}>
        {campaigns.data?.map((campaign) => {
          const applied = myApplications.isApplied(campaign.id);

          return (
            <SectionBlock key={campaign.id}>
              <SectionEyebrow>
                {formatCampaignType(campaign.campaign_type)}
              </SectionEyebrow>
              <Text className="mt-2 text-[17px] font-extrabold leading-snug tracking-tight text-[#fbf8f4]">{campaign.title}</Text>
              <Text className="mt-2 text-sm leading-6 text-[#a59a86]">
                {campaign.short_description || campaign.description}
              </Text>
              <View className="mt-3 flex-row items-center gap-4">
                <Text className="text-[15px] font-extrabold text-[#b8ff3d]">
                  {campaign.cash_amount ? formatCurrency(campaign.cash_amount) : "Product only"}
                </Text>
                <Text className="text-xs text-[#a59a86]">
                  {campaign.credit_cost_per_slot ?? campaign.credit_cost} credits
                </Text>
                <Text className="text-[10px] font-semibold uppercase tracking-wide text-[#a59a86]">
                  {formatDeadline(campaign.application_deadline)}
                </Text>
              </View>
              <View className="mt-5 flex-row items-center justify-between gap-3">
                <Text className="flex-1 text-sm leading-6 text-[#a59a86]">
                  {campaign.brand?.company_name ?? "Unknown brand"} • {campaign.slots_filled}/{campaign.slots_available} filled
                </Text>
                <View className="flex-row gap-3">
                  {applied ? (
                    <View className="rounded-full border border-[#a98c5b]/30 bg-[#1a1b16] px-4 py-2">
                      <Text className="text-sm font-medium text-[#d7c3a0]">Applied</Text>
                    </View>
                  ) : null}
                  <Link asChild href={`/campaigns/${campaign.id}`}>
                    <PrimaryPill className="px-4 py-2">View brief</PrimaryPill>
                  </Link>
                </View>
              </View>
            </SectionBlock>
          );
        })}

        {campaigns.isLoading ? (
          <SoftCard>
            <Text className="text-base text-[#d7cdbd]">Loading creator opportunities...</Text>
          </SoftCard>
        ) : null}
      </FadeInSection>
    </PremiumScroll>
  );
}
