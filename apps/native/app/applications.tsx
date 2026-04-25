import {
  formatCampaignType,
  formatDeadline,
  formatStatus,
  hasCompletedOnboarding,
  useAuth,
  useMyApplications
} from "@budcast/shared";
import { Link, router } from "expo-router";
import { useEffect, useMemo } from "react";
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
import { InfoTile, SectionBlock, SectionEyebrow } from "../components/sections";

export default function ApplicationsScreen() {
  const { loading, session, profile } = useAuth();
  const applications = useMyApplications();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }
    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
    }
  }, [loading, profile, session]);

  const acceptedCount = useMemo(
    () => (applications.data ?? []).filter((application) => application.status === "accepted").length,
    [applications.data]
  );

  const completedCount = useMemo(
    () => (applications.data ?? []).filter((application) => application.status === "completed").length,
    [applications.data]
  );

  return (
    <PremiumScroll>
      <FadeInSection>
        <GlassCard>
          <SectionTitle
            eyebrow="Applications"
            title="Track every creator commitment like an active deal flow."
            description="This view reflects the shared applications query, with accepted, pending, and completed commitments tied directly to the real marketplace contract."
          />
          <View className="mt-6 flex-row flex-wrap gap-2">
            <HeroChip>Real backend statuses</HeroChip>
            <HeroChip>Deadline-aware</HeroChip>
            <HeroChip>Submission-linked workflow</HeroChip>
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 flex-row gap-3" delay={60}>
        <MetricTile className="flex-1" label="Applications" value={String(applications.data?.length ?? 0)} />
        <MetricTile className="flex-1" label="Accepted" value={String(acceptedCount)} />
        <MetricTile className="flex-1" label="Completed" value={String(completedCount)} />
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={120}>
        {applications.data?.map((application) => (
          <SectionBlock className="bg-[#11130f]" key={application.id}>
            <View className="flex-row flex-wrap items-start justify-between gap-3">
              <View className="flex-1">
                <SectionEyebrow>
                  {application.opportunity ? formatCampaignType(application.opportunity.campaign_type) : "Campaign"}
                </SectionEyebrow>
                <Text className="mt-2 text-2xl font-semibold text-[#fbf8f4]">
                  {application.opportunity?.title || "Untitled opportunity"}
                </Text>
              </View>
              <View className="rounded-full border border-[#a98c5b]/30 bg-[#1a1b16] px-3 py-2">
                <Text className="text-xs uppercase tracking-[2px] text-[#d7c3a0]">
                  {formatStatus(application.status)}
                </Text>
              </View>
            </View>

            <View className="mt-4 gap-3">
              <InfoTile label="Brand">{application.opportunity?.brand?.company_name ?? "Unknown"}</InfoTile>
              <InfoTile label="Credits spent">{application.credits_spent}</InfoTile>
              <InfoTile label="Completion deadline">{formatDeadline(application.completion_deadline)}</InfoTile>
            </View>

            <View className="mt-5 flex-row flex-wrap gap-3">
              <Link asChild href={`/campaigns/${application.opportunity_id}`}>
                <PrimaryPill className="px-4 py-3">View campaign</PrimaryPill>
              </Link>
              {application.status === "accepted" || application.status === "completed" ? (
                <Link asChild href="/submissions">
                  <SecondaryPill className="px-4 py-3">Open submissions</SecondaryPill>
                </Link>
              ) : null}
            </View>
          </SectionBlock>
        ))}

        {applications.isLoading ? (
          <SoftCard>
            <Text className="text-base text-[#d7cdbd]">Loading applications...</Text>
          </SoftCard>
        ) : null}

        {!applications.isLoading && (applications.data?.length ?? 0) === 0 ? (
          <SoftCard>
            <Text className="text-base leading-7 text-surface-300">
              You have not applied to any campaigns yet. The store is where new paid opportunities start moving.
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-3">
              <Link asChild href="/store">
                <PrimaryPill className="px-4 py-3">Browse campaigns</PrimaryPill>
              </Link>
            </View>
          </SoftCard>
        ) : null}
      </FadeInSection>
    </PremiumScroll>
  );
}
