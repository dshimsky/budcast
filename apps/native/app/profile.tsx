import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
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

export default function ProfileScreen() {
  const { loading, session, profile, signOut } = useAuth();

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
        <SoftCard>
          <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Bio</Text>
          <Text className="mt-3 text-base leading-7 text-[#221b14]">
            {profile?.bio || "Add a short profile summary so matches feel more credible and contextual."}
          </Text>
        </SoftCard>

        <SoftCard>
          <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Account details</Text>
          <View className="mt-4 gap-3">
            <View className="rounded-[20px] border border-[#eadfce] bg-white px-4 py-4">
              <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Email</Text>
              <Text className="mt-2 text-base text-[#221b14]">{profile?.email ?? "No active session"}</Text>
            </View>
            <View className="rounded-[20px] border border-[#eadfce] bg-white px-4 py-4">
              <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">User type</Text>
              <Text className="mt-2 text-base capitalize text-[#221b14]">{profile?.user_type ?? "Unknown"}</Text>
            </View>
            <View className="rounded-[20px] border border-[#eadfce] bg-white px-4 py-4">
              <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Location</Text>
              <Text className="mt-2 text-base text-[#221b14]">{profile?.location ?? "Not set"}</Text>
            </View>
          </View>
        </SoftCard>

        {profile?.user_type === "creator" ? (
          <SoftCard>
            <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Creator footprint</Text>
            <View className="mt-4 gap-3">
              <View className="rounded-[20px] border border-[#eadfce] bg-white px-4 py-4">
                <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Instagram</Text>
                <Text className="mt-2 text-base text-[#221b14]">{profile?.instagram ?? "Not connected"}</Text>
              </View>
              <View className="rounded-[20px] border border-[#eadfce] bg-white px-4 py-4">
                <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">TikTok</Text>
                <Text className="mt-2 text-base text-[#221b14]">{profile?.tiktok ?? "Not connected"}</Text>
              </View>
              <View className="rounded-[20px] border border-[#eadfce] bg-white px-4 py-4">
                <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Niches</Text>
                <Text className="mt-2 text-base text-[#221b14]">
                  {nicheCount > 0 && Array.isArray(profile?.niches)
                    ? profile.niches.map((niche) => niche.replace(/_/g, " ")).join(", ")
                    : "No niches selected yet"}
                </Text>
              </View>
            </View>
          </SoftCard>
        ) : (
          <SoftCard>
            <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Brand footprint</Text>
            <View className="mt-4 gap-3">
              <View className="rounded-[20px] border border-[#eadfce] bg-white px-4 py-4">
                <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Company</Text>
                <Text className="mt-2 text-base text-[#221b14]">{profile?.company_name ?? "Not set"}</Text>
              </View>
              <View className="rounded-[20px] border border-[#eadfce] bg-white px-4 py-4">
                <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Website</Text>
                <Text className="mt-2 text-base text-[#221b14]">{profile?.website ?? "Not set"}</Text>
              </View>
            </View>
          </SoftCard>
        )}

        <SoftCard>
          <Text className="text-sm leading-6 text-[#5e5448]">
            Keep this page crisp. It is the trust layer brands and creators evaluate before they spend time or credits.
          </Text>
          <View className="mt-5 flex-row flex-wrap gap-3">
            <Link asChild href="/profile-edit">
              <Pressable className="rounded-full bg-[#435730] px-5 py-3">
                <Text className="text-white">Edit profile</Text>
              </Pressable>
            </Link>
            <Link asChild href="/onboarding">
              <Pressable className="rounded-full border border-[#d7c2ab] bg-white px-5 py-3">
                <Text className="text-[#624330]">Open setup</Text>
              </Pressable>
            </Link>
            <Pressable className="rounded-full border border-[#d7c2ab] bg-white px-5 py-3" onPress={() => void signOut()}>
              <Text className="text-[#624330]">Sign out</Text>
            </Pressable>
          </View>
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}
