import { hasCompletedOnboarding, useAuth, useMyApplications, useMySubmissionPipeline } from "@budcast/shared";
import { router } from "expo-router";
import { useEffect, useMemo, type ReactNode } from "react";
import { Text, View } from "react-native";
import { Avatar, StatusPill, Surface, TrustRow } from "../components/mobile-system";
import {
  FadeInSection,
  GlassCard,
  MetricTile,
  PremiumScroll,
  PrimaryPill,
  SecondaryPill,
  SoftCard
} from "../components/premium";

function normalizeList(values: unknown) {
  return Array.isArray(values) ? values.filter((value): value is string => typeof value === "string") : [];
}

function formatNiche(niche: string) {
  return niche.replace(/_/g, " ");
}

function ReadinessItem({ complete, label }: { complete: boolean; label: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="flex-1 text-sm leading-6 text-surface-200">{label}</Text>
      <StatusPill tone={complete ? "success" : "warning"}>{complete ? "Ready" : "Add"}</StatusPill>
    </View>
  );
}

function ProfileReadinessCard({
  bioReady,
  channelsReady,
  identityReady,
  locationReady,
  score
}: {
  bioReady: boolean;
  channelsReady: boolean;
  identityReady: boolean;
  locationReady: boolean;
  score: number;
}) {
  return (
    <Surface className="gap-4 px-4 py-5" tone="raised">
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-budcast-muted">
            Marketplace readiness
          </Text>
          <Text className="mt-2 text-lg font-black leading-6 text-budcast-text">
            Profile strength is {score}%.
          </Text>
        </View>
        <StatusPill tone={score >= 75 ? "success" : "warning"}>{score >= 75 ? "Strong" : "Needs work"}</StatusPill>
      </View>
      <View className="gap-3">
        <ReadinessItem complete={identityReady} label="Identity" />
        <ReadinessItem complete={locationReady} label="Market location" />
        <ReadinessItem complete={channelsReady} label="Creator channels" />
        <ReadinessItem complete={bioReady} label="Trust signals" />
      </View>
    </Surface>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <View className="rounded-surface border border-white/10 bg-white/[0.04] px-4 py-4">
      <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-budcast-muted">{label}</Text>
      <Text className="mt-2 text-sm leading-6 text-surface-200">{value}</Text>
    </View>
  );
}

export function ProfileScreen() {
  const { loading, session, profile, signOut } = useAuth();
  const applications = useMyApplications();
  const submissionPipeline = useMySubmissionPipeline();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }

    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
    }
  }, [loading, profile, session]);

  const niches = useMemo(() => normalizeList(profile?.niches), [profile?.niches]);
  const connectedChannels = useMemo(() => {
    return [profile?.instagram, profile?.tiktok, profile?.youtube].filter(Boolean).length;
  }, [profile?.instagram, profile?.tiktok, profile?.youtube]);

  const pendingApplications = useMemo(
    () => (applications.data ?? []).filter((application) => application.status === "pending").length,
    [applications.data]
  );
  const acceptedApplications = useMemo(
    () => (applications.data ?? []).filter((application) => application.status === "accepted").length,
    [applications.data]
  );
  const awaitingPayout = useMemo(
    () =>
      (submissionPipeline.data ?? []).filter((row) => {
        const submission = row.submission;
        return submission?.verification_status === "verified" && !submission.payment_confirmed_by_creator;
      }).length,
    [submissionPipeline.data]
  );

  const identityReady = Boolean(profile?.name || profile?.company_name);
  const locationReady = Boolean(profile?.location);
  const channelsReady = profile?.user_type === "creator" ? connectedChannels > 0 : Boolean(profile?.website);
  const bioReady = Boolean(profile?.bio);
  const readinessScore =
    [identityReady, locationReady, channelsReady, bioReady].filter(Boolean).length * 25;

  const displayName = loading ? "Loading..." : profile?.name || profile?.company_name || "Your BudCast identity";

  return (
    <PremiumScroll>
      <FadeInSection>
        <GlassCard>
          <View className="flex-row items-start gap-4">
            <Avatar
              label={displayName}
              size={58}
              source={profile?.avatar_url ? { uri: profile.avatar_url } : null}
            />
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-2">
                <Text className="text-[10px] font-bold uppercase tracking-[2px] text-budcast-muted">Profile</Text>
                {profile?.user_type ? <StatusPill tone="premium">{profile.user_type}</StatusPill> : null}
              </View>
              <Text className="mt-2 text-2xl font-black leading-8 text-budcast-text">{displayName}</Text>
              <Text className="mt-1.5 text-sm leading-5 text-budcast-muted" numberOfLines={2}>
                {[profile?.location, profile?.email].filter(Boolean).join(" - ") || "Complete your public identity"}
              </Text>
            </View>
          </View>

          <View className="mt-5 flex-row flex-wrap gap-3">
            <PrimaryPill className="px-4 py-3" onPress={() => router.push("/profile-edit")}>
              Edit profile
            </PrimaryPill>
            <SecondaryPill className="px-4 py-3" onPress={() => router.push("/onboarding")}>
              Setup
            </SecondaryPill>
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 flex-row gap-3" delay={60}>
        <MetricTile className="flex-1" label="Credits" value={String(profile?.credits_balance ?? 0)} />
        <MetricTile
          className="flex-1"
          label={profile?.user_type === "creator" ? "Niches" : "Channels"}
          value={profile?.user_type === "creator" ? String(niches.length) : String(connectedChannels)}
        />
        <MetricTile className="flex-1" label="Ready" value={`${readinessScore}%`} />
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={120}>
        <ProfileReadinessCard
          bioReady={bioReady}
          channelsReady={channelsReady}
          identityReady={identityReady}
          locationReady={locationReady}
          score={readinessScore}
        />

        {profile?.user_type === "creator" ? (
          <Surface className="gap-4 px-4 py-5" tone="raised">
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-budcast-muted">
                  Creator hub
                </Text>
                <Text className="mt-2 text-lg font-black leading-6 text-budcast-text">
                  Work pipeline snapshot
                </Text>
              </View>
              <StatusPill tone={awaitingPayout > 0 ? "warning" : "trust"}>{awaitingPayout} payout</StatusPill>
            </View>
            <TrustRow
              items={[
                { label: `${pendingApplications} pending`, tone: "default" },
                { label: `${acceptedApplications} accepted`, tone: "action" },
                { label: `${awaitingPayout} payout`, tone: awaitingPayout > 0 ? "warning" : "success" }
              ]}
            />
            <View className="flex-row flex-wrap gap-3">
              <PrimaryPill className="px-4 py-3" onPress={() => router.push("/store")}>
                Browse campaigns
              </PrimaryPill>
              <SecondaryPill className="px-4 py-3" onPress={() => router.push("/applications")}>
                Work
              </SecondaryPill>
              <SecondaryPill className="px-4 py-3" onPress={() => router.push("/submissions")}>
                Submissions
              </SecondaryPill>
            </View>
          </Surface>
        ) : null}

        <Surface className="gap-3 px-4 py-5" tone="raised">
          <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-budcast-muted">Bio</Text>
          <Text className="text-base leading-7 text-surface-200">
            {profile?.bio || "Add a short profile summary so matches feel more credible and contextual."}
          </Text>
        </Surface>

        {profile?.user_type === "creator" ? (
          <Surface className="gap-3 px-4 py-5" tone="raised">
            <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-budcast-muted">
              Creator channels
            </Text>
            <DetailRow label="Instagram" value={profile?.instagram ?? "Not connected"} />
            <DetailRow label="TikTok" value={profile?.tiktok ?? "Not connected"} />
            <DetailRow
              label="Niches"
              value={niches.length > 0 ? niches.map(formatNiche).join(", ") : "No niches selected yet"}
            />
            <DetailRow
              label="Trust signals"
              value={`${profile?.total_campaigns ?? 0} completed campaigns, ${profile?.review_count ?? 0} reviews, ${
                profile?.review_score != null ? profile.review_score.toFixed(1) : "New"
              } rating`}
            />
          </Surface>
        ) : (
          <Surface className="gap-3 px-4 py-5" tone="raised">
            <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-budcast-muted">
              Brand footprint
            </Text>
            <DetailRow label="Company" value={profile?.company_name ?? "Not set"} />
            <DetailRow label="Website" value={profile?.website ?? "Not set"} />
          </Surface>
        )}

        <SoftCard>
          <SecondaryPill onPress={() => void signOut()}>Sign out</SecondaryPill>
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}

export default ProfileScreen;
