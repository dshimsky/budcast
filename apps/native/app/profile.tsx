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
          <SectionTitle
            eyebrow="Profile"
            title={loading ? "Loading profile..." : profile?.name || profile?.company_name || "Your BudCast identity"}
            description="This is the public-facing marketplace profile that anchors your trust, matching, and workflow routing across the platform."
          />
          <View className="mt-6 flex-row flex-wrap gap-2">
            <HeroChip>{profile?.user_type ? `${profile.user_type} account` : "Profile in progress"}</HeroChip>
            <HeroChip>{profile?.location || "Location pending"}</HeroChip>
            <HeroChip>{profile?.email || "Session required"}</HeroChip>
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
                <PrimaryPill>Browse campaigns</PrimaryPill>
              </Link>
              <Link asChild href="/applications">
                <SecondaryPill>My applications</SecondaryPill>
              </Link>
              <Link asChild href="/submissions">
                <SecondaryPill>My submissions</SecondaryPill>
              </Link>
            </View>
            <View className="mt-4 gap-3">
              <InfoTile label="Workflow pulse">
                {pendingApplications} pending applications, {acceptedApplications} accepted campaigns, {awaitingPayout} payout confirmations waiting on you.
              </InfoTile>
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
          <Text className="text-sm leading-6 text-surface-300">
            Keep this page crisp. It is the trust layer brands and creators evaluate before they spend time or credits.
          </Text>
          <View className="mt-5 flex-row flex-wrap gap-3">
            <Link asChild href="/profile-edit">
              <PrimaryPill>Edit profile</PrimaryPill>
            </Link>
            <Link asChild href="/onboarding">
              <SecondaryPill>Open setup</SecondaryPill>
            </Link>
            <SecondaryPill onPress={() => void signOut()}>Sign out</SecondaryPill>
          </View>
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}
