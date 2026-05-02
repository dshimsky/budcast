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

export function ApplicationsScreen() {
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
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-sm font-medium text-[#e8dccd]">My Work</Text>
              <Text className="mt-1 text-[10px] uppercase tracking-[2px] text-[#a59a86]">
                Applications & submissions
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-3xl font-black text-[#fbf8f4]">
                {applications.data?.length ?? 0}
              </Text>
              <Text className="text-xs uppercase tracking-[2px] text-[#a59a86]">total</Text>
            </View>
          </View>
          <View className="mt-5 flex-row gap-3">
            <Link asChild href="/store" className="flex-1">
              <PrimaryPill>Browse campaigns</PrimaryPill>
            </Link>
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
                <Text className="mt-2 text-[17px] font-extrabold leading-snug text-[#fbf8f4] tracking-tight">
                  {application.opportunity?.title || "Untitled opportunity"}
                </Text>
              </View>
              <View className={`rounded-full px-3 py-2 ${
                application.status === "accepted" ? "border border-[#b8ff3d]/30 bg-[#b8ff3d]/10" :
                application.status === "completed" ? "border border-[#4f98a3]/30 bg-[#4f98a3]/10" :
                application.status === "rejected" ? "border border-red-500/20 bg-red-500/10" :
                "border border-[#a98c5b]/30 bg-[#1a1b16]"
              }`}>
                <Text className={`text-xs uppercase tracking-[2px] ${
                  application.status === "accepted" ? "text-[#b8ff3d]" :
                  application.status === "completed" ? "text-[#4f98a3]" :
                  application.status === "rejected" ? "text-red-400" :
                  "text-[#d7c3a0]"
                }`}>
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
                <PrimaryPill className="px-4 py-3">View brief</PrimaryPill>
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
              You have not applied to any content opportunities yet. Browse cannabis brand briefs to find paid work.
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-3">
              <Link asChild href="/store">
                <PrimaryPill className="px-4 py-3">Browse opportunities</PrimaryPill>
              </Link>
            </View>
          </SoftCard>
        ) : null}
      </FadeInSection>
    </PremiumScroll>
  );
}

export default ApplicationsScreen;
