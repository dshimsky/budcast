import { hasCompletedOnboarding, useAuth, useMyApplications, useMySubmissionPipeline } from "@budcast/shared";
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

export default function ProfileScreen() {
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

  const nicheCount = useMemo(() => {
    if (!profile?.niches) return 0;
    return Array.isArray(profile.niches) ? profile.niches.length : 0;
  }, [profile?.niches]);

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
        return (
          submission?.verification_status === "verified" &&
          submission.payment_confirmed_by_brand &&
          !submission.payment_confirmed_by_creator
        );
      }).length,
    [submissionPipeline.data]
  );

  return (
    <PremiumScroll>
      <FadeInSection>
        <GlassCard>
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[10px] font-bold uppercase tracking-[2px] text-[#a59a86]">Profile</Text>
              <Text className="mt-2 text-[22px] font-black leading-tight tracking-tight text-[#fbf8f4]">
                {loading ? "Loading..." : profile?.name || profile?.company_name || "Your BudCast identity"}
              </Text>
              {(profile?.location || profile?.email) ? (
                <Text className="mt-1.5 text-xs text-[#a59a86]" numberOfLines={1}>
                  {[profile?.location, profile?.email].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
            </View>
            {profile?.user_type ? (
              <View className="rounded-full border border-[#a98c5b]/30 bg-[#1a1b16] px-3 py-1.5">
                <Text className="text-[10px] font-bold uppercase tracking-[2px] text-[#d7c3a0]">
                  {profile.user_type}
                </Text>
              </View>
            ) : null}
          </View>
          <View className="mt-5 flex-row gap-3">
            <Link asChild href="/profile-edit" className="flex-1">
              <PrimaryPill>Edit profile</PrimaryPill>
            </Link>
            <Link asChild href="/onboarding">
              <SecondaryPill>Setup</SecondaryPill>
            </Link>
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 flex-row gap-3" delay={60}>
        <MetricTile className="flex-1" label="Credits" value={String(profile?.credits_balance ?? 0)} />
        <MetricTile
          className="flex-1"
          label={profile?.user_type === "creator" ? "Niches" : "Channels"}
          value={profile?.user_type === "creator" ? String(nicheCount) : String(connectedChannels)}
        />
        <MetricTile
          className="flex-1"
          label="Status"
          value={hasCompletedOnboarding(profile) ? "Ready" : "Setup"}
        />
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={120}>
        {profile?.user_type === "creator" ? (
          <SoftCard>
            <SectionEyebrow>Creator hub</SectionEyebrow>
            <View className="mt-4 flex-row flex-wrap gap-3">
              <Link asChild href="/store">
                <PrimaryPill>Browse opportunities</PrimaryPill>
              </Link>
              <Link asChild href="/applications">
                <SecondaryPill>My applications</SecondaryPill>
              </Link>
              <Link asChild href="/submissions">
                <SecondaryPill>My submissions</SecondaryPill>
              </Link>
            </View>
            <View className="mt-4 flex-row gap-2">
              <View className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
                <Text className="text-xl font-black text-[#fbf8f4]">{pendingApplications}</Text>
                <Text className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#a59a86]">Pending</Text>
              </View>
              <View className="flex-1 rounded-xl border border-[#b8ff3d]/20 bg-[#b8ff3d]/[0.04] px-3 py-3">
                <Text className="text-xl font-black text-[#b8ff3d]">{acceptedApplications}</Text>
                <Text className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#a59a86]">Accepted</Text>
              </View>
              <View className="flex-1 rounded-xl border border-[#4f98a3]/20 bg-[#4f98a3]/[0.04] px-3 py-3">
                <Text className="text-xl font-black text-[#4f98a3]">{awaitingPayout}</Text>
                <Text className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#a59a86]">Pay out</Text>
              </View>
            </View>
          </SoftCard>
        ) : null}

        <SectionBlock>
          <SectionEyebrow>Bio</SectionEyebrow>
          <Text className="mt-3 text-base leading-7 text-[#e8dccd]">
            {profile?.bio || "Add a short profile summary so matches feel more credible and contextual."}
          </Text>
        </SectionBlock>

        <SoftCard>
          <SectionEyebrow>Account details</SectionEyebrow>
          <View className="mt-4 gap-3">
            <InfoTile label="Email">{profile?.email ?? "No active session"}</InfoTile>
            <InfoTile label="User type">{profile?.user_type ?? "Unknown"}</InfoTile>
            <InfoTile label="Location">{profile?.location ?? "Not set"}</InfoTile>
          </View>
        </SoftCard>

        {profile?.user_type === "creator" ? (
          <SoftCard>
            <SectionEyebrow>Creator footprint</SectionEyebrow>
            <View className="mt-4 gap-3">
              <InfoTile label="Instagram">{profile?.instagram ?? "Not connected"}</InfoTile>
              <InfoTile label="TikTok">{profile?.tiktok ?? "Not connected"}</InfoTile>
              <InfoTile label="Niches">
                {nicheCount > 0 && Array.isArray(profile?.niches)
                  ? profile.niches.map((niche) => niche.replace(/_/g, " ")).join(", ")
                  : "No niches selected yet"}
              </InfoTile>
              <InfoTile label="Marketplace stats">
                {profile?.total_campaigns ?? 0} completed campaigns, {profile?.review_count ?? 0} reviews,{" "}
                {profile?.review_score != null ? profile.review_score.toFixed(1) : "New"} rating
              </InfoTile>
            </View>
          </SoftCard>
        ) : (
          <SoftCard>
            <SectionEyebrow>Brand footprint</SectionEyebrow>
            <View className="mt-4 gap-3">
              <InfoTile label="Company">{profile?.company_name ?? "Not set"}</InfoTile>
              <InfoTile label="Website">{profile?.website ?? "Not set"}</InfoTile>
            </View>
          </SoftCard>
        )}

        <SoftCard>
          <SecondaryPill onPress={() => void signOut()}>Sign out</SecondaryPill>
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}
