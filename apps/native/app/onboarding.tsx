import { hasCompletedOnboarding, useAuth, useOnboarding, useSaveProfile } from "@budcast/shared";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  FadeInSection,
  GlassCard,
  HeroChip,
  MetricTile,
  PremiumScroll,
  PrimaryPill,
  SectionTitle,
  SoftCard
} from "../components/premium";

const creatorNiches = [
  "flower",
  "pre_rolls",
  "edibles",
  "vapes",
  "concentrates",
  "topicals",
  "accessories",
  "lifestyle"
] as const;

const selectedPillClass = "bg-[#6b4c2e]";
const unselectedPillClass = "border border-white/10 bg-white/[0.04]";
const selectedPillTextClass = "font-semibold text-[#fff8ec]";
const unselectedPillTextClass = "font-medium text-[#e8dccd]";

export default function OnboardingScreen() {
  const { session, profile, loading } = useAuth();
  const onboarding = useOnboarding();
  const saveProfile = useSaveProfile();
  const [feedback, setFeedback] = useState<string | null>(null);
  const hydratedProfileId = useRef<string | null>(null);
  const isCreator = onboarding.userType === "creator";
  const onboardingComplete = hasCompletedOnboarding(profile);

  useEffect(() => {
    if (!profile?.id || hydratedProfileId.current === profile.id) return;
    onboarding.hydrateFromProfile(profile);
    hydratedProfileId.current = profile.id;
  }, [onboarding, profile]);

  useEffect(() => {
    if (!loading && onboardingComplete) {
      router.replace("/profile");
    }
  }, [loading, onboardingComplete]);

  const canSubmit = useMemo(() => {
    if (!onboarding.userType) return false;
    if (!onboarding.name.trim()) return false;
    if (isCreator) return Boolean(onboarding.instagram.trim());
    return Boolean(onboarding.companyName.trim());
  }, [isCreator, onboarding.companyName, onboarding.instagram, onboarding.name, onboarding.userType]);

  async function handleSave() {
    if (!onboarding.userType) {
      setFeedback("Pick creator or brand before saving.");
      return;
    }

    try {
      setFeedback(null);
      await saveProfile.mutateAsync({ userType: onboarding.userType });
      router.replace("/profile");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Profile save failed.");
    }
  }

  return (
    <PremiumScroll>
      <FadeInSection>
        <GlassCard>
          <SectionTitle
            eyebrow="Marketplace Setup"
            title="Shape how BudCast presents you before the first match."
            description="This is the mobile-first profile setup for creators and brands. It writes to the same locked shared user row as web, but the experience is lighter, faster, and more personal."
          />
          <View className="mt-6 flex-row flex-wrap gap-2">
            <HeroChip>Creator-ready identity</HeroChip>
            <HeroChip>Brand-safe presentation</HeroChip>
            <HeroChip>Shared backend contract</HeroChip>
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 flex-row gap-3" delay={60}>
        <MetricTile
          className="flex-1"
          label="Roles"
          value={onboarding.userType ? "1 selected" : "Choose 1"}
        />
        <MetricTile
          className="flex-1"
          label="Niches"
          value={String(onboarding.niches.length)}
        />
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={120}>
        <SoftCard>
          <Text className="text-sm font-medium text-surface-300">I am joining as</Text>
          <View className="mt-4 flex-row flex-wrap gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: onboarding.userType === "brand" }}
              className={`rounded-full px-5 py-3 ${onboarding.userType === "brand" ? selectedPillClass : unselectedPillClass}`}
              onPress={() => onboarding.setUserType("brand")}
            >
              <Text className={onboarding.userType === "brand" ? selectedPillTextClass : unselectedPillTextClass}>
                Brand operator
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: onboarding.userType === "creator" }}
              className={`rounded-full px-5 py-3 ${onboarding.userType === "creator" ? selectedPillClass : unselectedPillClass}`}
              onPress={() => onboarding.setUserType("creator")}
            >
              <Text className={onboarding.userType === "creator" ? selectedPillTextClass : unselectedPillTextClass}>
                Creator talent
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3"
              onPress={onboarding.reset}
            >
              <Text className="font-medium text-[#e8dccd]">Reset</Text>
            </Pressable>
          </View>
          {!session && !loading ? (
            <View className="mt-4 rounded-[22px] border border-[#a98c5b]/25 bg-[#1a1710] px-4 py-4">
              <Text className="text-sm leading-6 text-[#e8dccd]">
                Sign in first. This flow saves directly into your shared profile record and does not keep a separate local-only draft.
              </Text>
            </View>
          ) : null}
        </SoftCard>

        <SoftCard>
          <Text className="text-sm font-medium text-surface-300">Core identity</Text>
          <TextInput
            className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
            onChangeText={(value) => onboarding.setField("name", value)}
            placeholder={isCreator ? "Display name" : "Operator name"}
            placeholderTextColor="#a59a86"
            value={onboarding.name}
          />
          <TextInput
            className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
            onChangeText={(value) => onboarding.setField("location", value)}
            placeholder="Location"
            placeholderTextColor="#a59a86"
            value={onboarding.location}
          />
          <TextInput
            className="mt-3 min-h-[108px] rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
            multiline
            onChangeText={(value) => onboarding.setField("bio", value)}
            placeholder="Tell brands or creators what makes you a strong fit."
            placeholderTextColor="#a59a86"
            textAlignVertical="top"
            value={onboarding.bio}
          />
        </SoftCard>

        {isCreator ? (
          <SoftCard>
            <Text className="text-sm font-medium text-surface-300">Creator channels</Text>
            <TextInput
              className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
              onChangeText={(value) => onboarding.setField("instagram", value)}
              placeholder="Instagram handle"
              placeholderTextColor="#a59a86"
              value={onboarding.instagram}
            />
            <TextInput
              className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
              onChangeText={(value) => onboarding.setField("tiktok", value)}
              placeholder="TikTok handle"
              placeholderTextColor="#a59a86"
              value={onboarding.tiktok}
            />
            <View className="mt-4">
              <Text className="text-sm font-medium text-surface-300">Niche focus</Text>
              <Text className="mt-2 text-sm leading-6 text-surface-300">
                Select the categories where you want paid opportunities to find you first.
              </Text>
              <View className="mt-4 flex-row flex-wrap gap-2">
                {creatorNiches.map((niche) => {
                  const selected = onboarding.niches.includes(niche);
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      className={`rounded-full px-4 py-2 ${selected ? selectedPillClass : unselectedPillClass}`}
                      key={niche}
                      onPress={() => onboarding.toggleNiche(niche)}
                    >
                      <Text className={selected ? selectedPillTextClass : unselectedPillTextClass}>
                        {niche.replace(/_/g, " ")}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </SoftCard>
        ) : (
          <SoftCard>
            <Text className="text-sm font-medium text-surface-300">Brand footprint</Text>
            <TextInput
              className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
              onChangeText={(value) => onboarding.setField("companyName", value)}
              placeholder="Company name"
              placeholderTextColor="#a59a86"
              value={onboarding.companyName}
            />
            <TextInput
              className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
              onChangeText={(value) => onboarding.setField("website", value)}
              placeholder="Website"
              placeholderTextColor="#a59a86"
              value={onboarding.website}
            />
          </SoftCard>
        )}

        <SoftCard>
          <Text className="text-sm leading-6 text-surface-300">
            BudCast uses this profile to control matching context, marketplace trust, and role-based routing across web and native.
          </Text>
          <PrimaryPill
            className={`mt-5 py-4 ${!session || saveProfile.isPending || !canSubmit ? "opacity-50" : ""}`}
            disabled={!session || saveProfile.isPending || !canSubmit}
            onPress={handleSave}
          >
            {saveProfile.isPending ? "Saving profile..." : "Save and continue"}
          </PrimaryPill>
          {feedback ? <Text className="mt-4 text-sm leading-6 text-[#d7a07d]">{feedback}</Text> : null}
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}
