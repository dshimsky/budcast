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
  MetricTile,
  PremiumScroll,
  PrimaryPill,
  SecondaryPill,
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

  // ── No session ────────────────────────────────────────────────
  if (!session) {
    return (
      <PremiumScroll>
        <FadeInSection>
          <GlassCard>
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-[2px] text-[#a59a86]">BudCast</Text>
                <Text className="mt-2 text-[22px] font-black leading-tight tracking-tight text-[#fbf8f4]">Creator Marketplace</Text>
              </View>
              <View className="rounded-full border border-[#a98c5b]/30 bg-[#1a1b16] px-3 py-1.5">
                <Text className="text-[10px] font-bold uppercase tracking-[2px] text-[#d7c3a0]">
                  {loading ? "Loading" : "Sign in"}
                </Text>
              </View>
            </View>
            <View className="mt-5 flex-row gap-3">
              <Link asChild href="/sign-in" className="flex-1">
                <PrimaryPill>Sign in</PrimaryPill>
              </Link>
              <Link asChild href="/sign-up">
                <SecondaryPill>Create account</SecondaryPill>
              </Link>
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

  // ── Onboarding incomplete ─────────────────────────────────────
  if (!hasCompletedOnboarding(profile)) {
    return (
      <PremiumScroll>
        <FadeInSection>
          <GlassCard>
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-[2px] text-[#a59a86]">Setup</Text>
                <Text className="mt-2 text-[22px] font-black leading-tight tracking-tight text-[#fbf8f4]">Finish your profile</Text>
                <Text className="mt-1.5 text-xs leading-relaxed text-[#a59a86]">
                  Complete setup to unlock the full marketplace.
                </Text>
              </View>
              <View className="rounded-full border border-[#b8ff3d]/30 bg-[#b8ff3d]/10 px-3 py-1.5">
                <Text className="text-[10px] font-bold uppercase tracking-[2px] text-[#b8ff3d]">Pending</Text>
              </View>
            </View>
            <View className="mt-5 flex-row gap-3">
              <Link asChild href="/onboarding" className="flex-1">
                <PrimaryPill>Complete setup</PrimaryPill>
              </Link>
              <Link asChild href="/profile">
                <SecondaryPill>View profile</SecondaryPill>
              </Link>
            </View>
          </GlassCard>
        </FadeInSection>
      </PremiumScroll>
    );
  }

  // ── Brand view ────────────────────────────────────────────────
  if (profile?.user_type === "brand") {
    const campaigns = brandCampaigns.data ?? [];
    return (
      <PremiumScroll>
        <FadeInSection>
          <GlassCard>
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-[2px] text-[#a59a86]">Brand Dashboard</Text>
                <Text className="mt-2 text-[22px] font-black leading-tight tracking-tight text-[#fbf8f4]">
                  {profile?.company_name ?? "Your campaigns"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[28px] font-black leading-none text-[#fbf8f4]">
                  {brandCampaigns.isLoading ? "—" : campaigns.length}
                </Text>
                <Text className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#a59a86]">Active</Text>
              </View>
            </View>
            <View className="mt-5 flex-row gap-3">
              <Link asChild href="/profile" className="flex-1">
                <PrimaryPill>Open profile</PrimaryPill>
              </Link>
            </View>
          </GlassCard>
        </FadeInSection>

        <FadeInSection className="mt-6 gap-4 pb-8" delay={80}>
          {campaigns.slice(0, 3).map((campaign) => (
            <SectionBlock key={campaign.id}>
              <SectionEyebrow>
                {formatCampaignType(campaign.campaign_type)}
              </SectionEyebrow>
              <Text className="mt-2 text-[17px] font-extrabold leading-snug text-[#fbf8f4] tracking-tight">{campaign.title}</Text>
              <Text className="mt-2 text-xs leading-relaxed text-[#a59a86]">
                {campaign.pending_applications} pending · {campaign.slots_filled}/{campaign.slots_available} slots filled
              </Text>
              <Text className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#a59a86]">Closes {formatDeadline(campaign.application_deadline)}</Text>
            </SectionBlock>
          ))}
        </FadeInSection>
      </PremiumScroll>
    );
  }

  // ── Creator home (authenticated + onboarded) ──────────────────
  const campaigns = nicheCampaigns.data ?? [];

  return (
    <PremiumScroll>

      {/* Welcome header */}
      <FadeInSection>
        <GlassCard>
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-sm font-medium text-[#e8dccd]">
                {profile?.display_name
                  ? `Hey, ${profile.display_name.split(" ")[0]} 👋`
                  : "Hey 👋"}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-3xl font-black text-[#b8ff3d]">
                {profile?.credits_balance ?? 0}
              </Text>
              <Text className="text-xs uppercase tracking-[2px] text-[#a59a86]">credits</Text>
            </View>
          </View>

          {/* Profile strength progress bar */}
          <View className="mt-4">
            <View className="h-1 rounded-sm bg-[#fbf8f4]/10 overflow-hidden">
              <View className="h-full rounded-sm bg-[#b8ff3d]" style={{ width: '68%' }} />
            </View>
            <View className="mt-1.5 flex-row items-center justify-between">
              <Text className="text-xs text-[#a59a86]">Profile strength</Text>
              <Text className="text-xs font-semibold text-[#b8ff3d]">68%</Text>
            </View>
          </View>

          <View className="mt-5 flex-row gap-3">
            <Link asChild href="/store" className="flex-1">
              <PrimaryPill>Browse campaigns</PrimaryPill>
            </Link>
            <Link asChild href="/applications">
              <SecondaryPill>My work</SecondaryPill>
            </Link>
          </View>
        </GlassCard>
      </FadeInSection>

      {/* Niche campaign feed */}
      <FadeInSection className="mt-6 gap-4 pb-8" delay={80}>

        {campaigns.map((campaign) => (
          <Link asChild href={`/campaigns/${campaign.id}`} key={campaign.id}>
            <SoftCard>
              {/* Brand banner image */}
              <View className="-mx-[18px] -mt-[18px] mb-4 h-24 rounded-t-2xl bg-gradient-to-br from-[#1d2b0a] to-[#0e1a06] border border-[#b8ff3d]/10 overflow-hidden">
                <View className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                <View className="absolute bottom-2.5 left-3">
                  <View className="px-2 py-1 rounded-md bg-black/50 border border-white/10">
                    <Text className="text-[10px] font-semibold uppercase tracking-wider text-[#a59a86]">
                      {campaign.brand?.company_name ?? ""}
                    </Text>
                  </View>
                </View>
              </View>

              <SectionEyebrow>
                {formatCampaignType(campaign.campaign_type)}
              </SectionEyebrow>
              <Text className="mt-2 text-[17px] font-extrabold leading-snug text-[#fbf8f4] tracking-tight">
                {campaign.title}
              </Text>
              {(campaign.short_description || campaign.description) ? (
                <Text className="mt-1.5 text-xs leading-relaxed text-[#a59a86]" numberOfLines={2}>
                  {campaign.short_description || campaign.description}
                </Text>
              ) : null}
              
              {/* Stat tiles grid */}
              <View className="mt-4 grid grid-cols-2 gap-2">
                <View className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-2">
                  <Text className="text-sm font-bold text-[#b8ff3d] leading-none">
                    {campaign.cash_amount ? formatCurrency(campaign.cash_amount) : "Free"}
                  </Text>
                  <Text className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#a59a86]">
                    {campaign.cash_amount ? "Cash" : "Product gift"}
                  </Text>
                </View>
                <View className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-2">
                  <Text className="text-sm font-bold text-[#b8ff3d] leading-none">
                    {formatDeadline(campaign.application_deadline)}
                  </Text>
                  <Text className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#a59a86]">
                    Closes
                  </Text>
                </View>
              </View>
            </SoftCard>
          </Link>
        ))}

        {nicheCampaigns.isLoading ? (
          <SoftCard>
            <Text className="text-sm text-[#a59a86]">Loading campaigns for your niche…</Text>
          </SoftCard>
        ) : null}

        {!nicheCampaigns.isLoading && campaigns.length === 0 ? (
          <SoftCard>
            <Text className="text-sm text-[#a59a86]">No campaigns matching your niche right now. Check back soon.</Text>
          </SoftCard>
        ) : null}

      </FadeInSection>
    </PremiumScroll>
  );
}
