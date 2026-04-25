import { hasCompletedOnboarding, useAuth, useOnboarding, useSaveProfile } from "@budcast/shared";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  FadeInSection,
  GlassCard,
  HeroChip,
  PremiumScroll,
  PrimaryPill,
  SecondaryPill,
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

export default function ProfileEditScreen() {
  const { loading, session, profile } = useAuth();
  const onboarding = useOnboarding();
  const saveProfile = useSaveProfile();
  const [feedback, setFeedback] = useState<string | null>(null);
  const hydratedProfileId = useRef<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }
    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
      return;
    }
  }, [loading, profile, session]);

  useEffect(() => {
    if (!profile?.id || hydratedProfileId.current === profile.id) return;
    onboarding.hydrateFromProfile(profile);
    hydratedProfileId.current = profile.id;
  }, [onboarding, profile]);

  const isCreator = profile?.user_type === "creator";
  const canSave = useMemo(() => {
    if (!profile?.user_type) return false;
    if (!onboarding.name.trim()) return false;
    if (profile.user_type === "creator") return Boolean(onboarding.instagram.trim());
    return Boolean(onboarding.companyName.trim());
  }, [onboarding.companyName, onboarding.instagram, onboarding.name, profile?.user_type]);

  async function handleSave() {
    if (!profile?.user_type) return;
    try {
      setFeedback(null);
      await saveProfile.mutateAsync({ userType: profile.user_type });
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
            eyebrow="Profile Edit"
            title="Refine the profile brands or creators judge in seconds."
            description="Edits here use the same shared save mutation as onboarding, so profile quality improves without diverging from the locked data contract."
          />
          <View className="mt-6 flex-row flex-wrap gap-2">
            <HeroChip>{isCreator ? "Creator-facing identity" : "Brand-facing identity"}</HeroChip>
            <HeroChip>Shared save path</HeroChip>
            <HeroChip>Mobile-first editing</HeroChip>
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={90}>
        <SoftCard>
          <Text className="text-sm font-medium text-surface-300">Identity</Text>
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
            placeholder="Tighten your bio so it reads like a clear marketplace pitch."
            placeholderTextColor="#a59a86"
            textAlignVertical="top"
            value={onboarding.bio}
          />
        </SoftCard>

        {isCreator ? (
          <SoftCard>
            <Text className="text-sm font-medium text-surface-300">Channels and niches</Text>
            <TextInput
              className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
              onChangeText={(value) => onboarding.setField("instagram", value)}
              placeholder="Instagram"
              placeholderTextColor="#a59a86"
              value={onboarding.instagram}
            />
            <TextInput
              className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
              onChangeText={(value) => onboarding.setField("tiktok", value)}
              placeholder="TikTok"
              placeholderTextColor="#a59a86"
              value={onboarding.tiktok}
            />
            <TextInput
              className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
              onChangeText={(value) => onboarding.setField("youtube", value)}
              placeholder="YouTube"
              placeholderTextColor="#a59a86"
              value={onboarding.youtube}
            />
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
          </SoftCard>
        ) : (
          <SoftCard>
            <Text className="text-sm font-medium text-surface-300">Brand details</Text>
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
            Better profiles create better marketplace decisions. This is a trust surface, not a hidden settings page.
          </Text>
          <View className="mt-5 flex-row flex-wrap gap-3">
            <PrimaryPill
              className={canSave && !saveProfile.isPending ? "" : "opacity-50"}
              disabled={!canSave || saveProfile.isPending}
              onPress={handleSave}
            >
              {saveProfile.isPending ? "Saving..." : "Save changes"}
            </PrimaryPill>
            <SecondaryPill onPress={() => router.replace("/profile")}>Back to profile</SecondaryPill>
          </View>

          {feedback ? <Text className="mt-4 text-sm leading-6 text-[#d7a07d]">{feedback}</Text> : null}
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}
