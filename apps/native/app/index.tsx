import {
  formatCampaignType,
  formatCurrency,
  formatDeadline,
  hasCompletedOnboarding,
  useAuth,
  useBrandCampaigns,
  useMyNicheCampaigns
} from "@budcast/shared";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { FadeInSection, GlassCard, HeroChip, MetricTile, PremiumScroll, SectionTitle, SoftCard } from "../components/premium";

const creatorSignals = [
  { label: "Fresh gifting campaigns", value: "12" },
  { label: "Hybrid offers live", value: "7" },
  { label: "Credits available", value: "50" }
];

export default function NativeHomeScreen() {
  const { loading, session, profile } = useAuth();
  const nicheCampaigns = useMyNicheCampaigns({ limit: 4 });
  const brandCampaigns = useBrandCampaigns();

  if (!session) {
    return (
      <PremiumScroll>
        <FadeInSection>
          <GlassCard>
            <SectionTitle
              eyebrow="BudCast Mobile"
              title="Creator-first native distribution with a more premium front door."
              description="Mobile stays focused on discovery, applying, and submission. The data contract is shared with web; the interaction model is more personal and more immediate."
            />
            <View className="mt-6 flex-row flex-wrap gap-3">
              <Link asChild href="/sign-in">
                <Pressable className="rounded-full bg-[#435730] px-5 py-3">
                  <Text className="text-sm font-semibold text-white">Open sign in</Text>
                </Pressable>
              </Link>
              <Link asChild href="/sign-up">
                <Pressable className="rounded-full border border-[#d7c2ab] bg-[#fffaf4] px-5 py-3">
                  <Text className="text-sm text-[#624330]">Create account</Text>
                </Pressable>
              </Link>
              <HeroChip>{loading ? "Hydrating session" : "No active session"}</HeroChip>
            </View>
          </GlassCard>
        </FadeInSection>

        <FadeInSection className="mt-6 gap-4" delay={80}>
          {creatorSignals.map((signal, index) => (
            <MetricTile className={index === 1 ? "mt-1" : ""} key={signal.label} label={signal.label} value={signal.value} />
          ))}
        </FadeInSection>
      </PremiumScroll>
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <PremiumScroll>
        <FadeInSection>
          <GlassCard>
            <SectionTitle
              eyebrow="Finish setup"
              title="Your account needs a real public profile before the marketplace opens."
              description="We already know who you are from auth. Now write the public profile row that powers campaigns, reputation, and application logic."
            />
            <View className="mt-6 flex-row flex-wrap gap-3">
              <Link asChild href="/onboarding">
                <Pressable className="rounded-full bg-[#435730] px-5 py-3">
                  <Text className="text-sm font-semibold text-white">Complete onboarding</Text>
                </Pressable>
              </Link>
              <Link asChild href="/profile">
                <Pressable className="rounded-full border border-[#d7c2ab] bg-[#fffaf4] px-5 py-3">
                  <Text className="text-sm text-[#624330]">View profile shell</Text>
                </Pressable>
              </Link>
            </View>
          </GlassCard>
        </FadeInSection>
      </PremiumScroll>
    );
  }

  if (profile?.user_type === "brand") {
    const campaigns = brandCampaigns.data ?? [];
    return (
      <PremiumScroll>
        <FadeInSection>
          <GlassCard>
            <SectionTitle
              eyebrow="Brand on mobile"
              title="Desktop still owns the serious control plane for brand operations."
              description="Native brand support can exist, but the heavy campaign management surface remains web-first. This mobile shell is a cleaner quick-check layer."
            />
            <View className="mt-6 flex-row flex-wrap gap-3">
              <Link asChild href="/profile">
                <Pressable className="rounded-full bg-[#435730] px-5 py-3">
                  <Text className="text-sm font-semibold text-white">Open profile</Text>
                </Pressable>
              </Link>
              <HeroChip>{brandCampaigns.isLoading ? "Loading campaigns" : `${campaigns.length} active campaigns`}</HeroChip>
            </View>
          </GlassCard>
        </FadeInSection>

        <FadeInSection className="mt-6 gap-4 pb-8" delay={80}>
          {campaigns.slice(0, 3).map((campaign) => (
            <SoftCard key={campaign.id}>
              <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">
                {formatCampaignType(campaign.campaign_type)}
              </Text>
              <Text className="mt-2 text-2xl font-semibold text-[#221b14]">{campaign.title}</Text>
              <Text className="mt-2 text-sm leading-6 text-[#5e5448]">
                {campaign.pending_applications} pending, {campaign.slots_filled}/{campaign.slots_available} slots filled
              </Text>
              <Text className="mt-1 text-sm text-[#5e5448]">Deadline {formatDeadline(campaign.application_deadline)}</Text>
            </SoftCard>
          ))}
        </FadeInSection>
      </PremiumScroll>
    );
  }

  return (
    <PremiumScroll>
      <FadeInSection>
        <GlassCard>
          <SectionTitle
            eyebrow="Creator home"
            title="The creator marketplace lives here first."
            description="This feed is already powered by the real niche-based campaign query. The goal now is to make discovery feel alive, not just functional."
          />
          <View className="mt-6 flex-row flex-wrap gap-3">
            <Link asChild href="/profile">
              <Pressable className="rounded-full bg-[#435730] px-5 py-3">
                <Text className="text-sm font-semibold text-white">Open profile</Text>
              </Pressable>
            </Link>
            <Link asChild href="/store">
              <Pressable className="rounded-full border border-[#d7c2ab] bg-[#fffaf4] px-5 py-3">
                <Text className="text-sm text-[#624330]">Open store</Text>
              </Pressable>
            </Link>
            <Link asChild href="/applications">
              <Pressable className="rounded-full border border-[#d7c2ab] bg-[#fffaf4] px-5 py-3">
                <Text className="text-sm text-[#624330]">My applications</Text>
              </Pressable>
            </Link>
            <Link asChild href="/submissions">
              <Pressable className="rounded-full border border-[#d7c2ab] bg-[#fffaf4] px-5 py-3">
                <Text className="text-sm text-[#624330]">My submissions</Text>
              </Pressable>
            </Link>
            <HeroChip>{profile ? `${profile.credits_balance} credits available` : "No session"}</HeroChip>
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={80}>
        {(nicheCampaigns.data ?? []).map((campaign) => (
          <SoftCard key={campaign.id}>
            <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">
              {formatCampaignType(campaign.campaign_type)}
            </Text>
            <Text className="mt-2 text-[28px] font-semibold leading-[34px] text-[#221b14]">{campaign.title}</Text>
            <Text className="mt-2 text-sm leading-6 text-[#5e5448]">
              {campaign.short_description || campaign.description}
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              <HeroChip>{campaign.cash_amount ? formatCurrency(campaign.cash_amount) : "Product-led"}</HeroChip>
              <HeroChip>{formatDeadline(campaign.application_deadline)}</HeroChip>
              <HeroChip>{campaign.brand?.company_name ?? "Brand hidden"}</HeroChip>
            </View>
            <View className="mt-5 flex-row justify-end">
              <Link asChild href={`/campaigns/${campaign.id}`}>
                <Pressable className="rounded-full bg-[#435730] px-4 py-2">
                  <Text className="text-sm font-semibold text-white">View details</Text>
                </Pressable>
              </Link>
            </View>
          </SoftCard>
        ))}
        {nicheCampaigns.isLoading ? (
          <SoftCard>
            <Text className="text-base text-[#5e5448]">Loading your niche campaigns...</Text>
          </SoftCard>
        ) : null}
      </FadeInSection>
    </PremiumScroll>
  );
}
