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
import { Text, View } from "react-native";
import {
  FadeInSection,
  GlassCard,
  HeroChip,
  MetricTile,
  PremiumScroll,
  PrimaryPill,
  SecondaryPill,
  SectionTitle,
  SoftCard
} from "../components/premium";
import { SectionBlock, SectionEyebrow } from "../components/sections";

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
              eyebrow="Creator home"
              title="Find paid content opportunities from cannabis brands."
              description="BudCast mobile helps creators browse briefs, apply quickly, submit content, and track payment status."
            />
            <View className="mt-6 flex-row flex-wrap gap-3">
              <Link asChild href="/sign-in">
                <PrimaryPill>Open sign in</PrimaryPill>
              </Link>
              <Link asChild href="/sign-up">
                <SecondaryPill>Create account</SecondaryPill>
              </Link>
              <HeroChip>{loading ? "Checking sign-in" : "No active session"}</HeroChip>
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
              description="Create the public profile that powers campaign matching, creator applications, and brand trust."
            />
            <View className="mt-6 flex-row flex-wrap gap-3">
              <Link asChild href="/onboarding">
                <PrimaryPill>Complete onboarding</PrimaryPill>
              </Link>
              <Link asChild href="/profile">
                <SecondaryPill>View profile shell</SecondaryPill>
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
              title="Desktop is best for managing campaigns."
              description="Mobile gives cannabis brands a quick-check view. Use desktop to post briefs, review creators, approve content, and track payments."
            />
            <View className="mt-6 flex-row flex-wrap gap-3">
              <Link asChild href="/profile">
                <PrimaryPill>Open profile</PrimaryPill>
              </Link>
              <HeroChip>{brandCampaigns.isLoading ? "Loading campaigns" : `${campaigns.length} active campaigns`}</HeroChip>
            </View>
          </GlassCard>
        </FadeInSection>

        <FadeInSection className="mt-6 gap-4 pb-8" delay={80}>
          {campaigns.slice(0, 3).map((campaign) => (
            <SectionBlock key={campaign.id}>
              <SectionEyebrow>
                {formatCampaignType(campaign.campaign_type)}
              </SectionEyebrow>
              <Text className="mt-2 text-2xl font-semibold text-[#fbf8f4]">{campaign.title}</Text>
              <Text className="mt-2 text-sm leading-6 text-[#d7cdbd]">
                {campaign.pending_applications} pending, {campaign.slots_filled}/{campaign.slots_available} slots filled
              </Text>
              <Text className="mt-1 text-sm text-[#a59a86]">Deadline {formatDeadline(campaign.application_deadline)}</Text>
            </SectionBlock>
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
            description="Browse cannabis brand briefs that match your niche, then apply from your phone when the fit is right."
          />
          <View className="mt-6 flex-row flex-wrap gap-3">
            <Link asChild href="/profile">
              <PrimaryPill>Open profile</PrimaryPill>
            </Link>
            <Link asChild href="/store">
              <SecondaryPill>Browse opportunities</SecondaryPill>
            </Link>
            <Link asChild href="/applications">
              <SecondaryPill>My applications</SecondaryPill>
            </Link>
            <Link asChild href="/submissions">
              <SecondaryPill>My submissions</SecondaryPill>
            </Link>
            <HeroChip>{profile ? `${profile.credits_balance} credits available` : "No session"}</HeroChip>
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={80}>
        {(nicheCampaigns.data ?? []).map((campaign) => (
          <SectionBlock className="bg-[#11130f]" key={campaign.id}>
            <SectionEyebrow>
              {formatCampaignType(campaign.campaign_type)}
            </SectionEyebrow>
            <Text className="mt-2 text-[28px] font-semibold leading-[34px] text-[#fbf8f4]">{campaign.title}</Text>
            <Text className="mt-2 text-sm leading-6 text-[#d7cdbd]">
              {campaign.short_description || campaign.description}
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              <HeroChip>{campaign.cash_amount ? formatCurrency(campaign.cash_amount) : "Product-led"}</HeroChip>
              <HeroChip>{formatDeadline(campaign.application_deadline)}</HeroChip>
              <HeroChip>{campaign.brand?.company_name ?? "Brand hidden"}</HeroChip>
            </View>
            <View className="mt-5 flex-row justify-end">
              <Link asChild href={`/campaigns/${campaign.id}`}>
                <PrimaryPill className="px-4 py-2">View details</PrimaryPill>
              </Link>
            </View>
          </SectionBlock>
        ))}
        {nicheCampaigns.isLoading ? (
          <SoftCard>
            <Text className="text-base text-[#d7cdbd]">Loading your niche campaigns...</Text>
          </SoftCard>
        ) : null}
      </FadeInSection>
    </PremiumScroll>
  );
}
