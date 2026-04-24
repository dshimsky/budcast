import {
  formatCampaignType,
  formatDeadline,
  hasCompletedOnboarding,
  useAuth,
  useMyApplications
} from "@budcast/shared";
import { Link, router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import {
  FadeInSection,
  GlassCard,
  HeroChip,
  MetricTile,
  PremiumScroll,
  SectionTitle,
  SoftCard
} from "../components/premium";

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

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
          <SoftCard key={application.id}>
            <View className="flex-row flex-wrap items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">
                  {application.opportunity ? formatCampaignType(application.opportunity.campaign_type) : "Campaign"}
                </Text>
                <Text className="mt-2 text-2xl font-semibold text-[#221b14]">
                  {application.opportunity?.title || "Untitled opportunity"}
                </Text>
              </View>
              <View className="rounded-full border border-[#d7c2ab] bg-white px-3 py-2">
                <Text className="text-xs uppercase tracking-[2px] text-[#624330]">
                  {formatStatusLabel(application.status)}
                </Text>
              </View>
            </View>

            <View className="mt-4 gap-3">
              <View className="rounded-[20px] border border-[#eadfce] bg-white px-4 py-4">
                <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Brand</Text>
                <Text className="mt-2 text-base text-[#221b14]">
                  {application.opportunity?.brand?.company_name ?? "Unknown"}
                </Text>
              </View>
              <View className="rounded-[20px] border border-[#eadfce] bg-white px-4 py-4">
                <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Credits spent</Text>
                <Text className="mt-2 text-base text-[#221b14]">{application.credits_spent}</Text>
              </View>
              <View className="rounded-[20px] border border-[#eadfce] bg-white px-4 py-4">
                <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Completion deadline</Text>
                <Text className="mt-2 text-base text-[#221b14]">
                  {formatDeadline(application.completion_deadline)}
                </Text>
              </View>
            </View>

            <View className="mt-5 flex-row flex-wrap gap-3">
              <Link asChild href={`/campaigns/${application.opportunity_id}`}>
                <Pressable className="rounded-full bg-[#435730] px-4 py-3">
                  <Text className="text-sm font-semibold text-white">View campaign</Text>
                </Pressable>
              </Link>
              {application.status === "accepted" || application.status === "completed" ? (
                <Link asChild href="/submissions">
                  <Pressable className="rounded-full border border-[#d7c2ab] bg-white px-4 py-3">
                    <Text className="text-sm text-[#624330]">Open submissions</Text>
                  </Pressable>
                </Link>
              ) : null}
            </View>
          </SoftCard>
        ))}

        {applications.isLoading ? (
          <SoftCard>
            <Text className="text-base text-[#5e5448]">Loading applications...</Text>
          </SoftCard>
        ) : null}

        {!applications.isLoading && (applications.data?.length ?? 0) === 0 ? (
          <SoftCard>
            <Text className="text-base leading-7 text-[#5e5448]">
              You have not applied to any campaigns yet. The store is where new paid opportunities start moving.
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-3">
              <Link asChild href="/store">
                <Pressable className="rounded-full bg-[#435730] px-4 py-3">
                  <Text className="text-sm font-semibold text-white">Browse campaigns</Text>
                </Pressable>
              </Link>
            </View>
          </SoftCard>
        ) : null}
      </FadeInSection>
    </PremiumScroll>
  );
}
