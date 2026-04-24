import { hasCompletedOnboarding, useAuth, useOnboarding, useSaveProfile } from "@budcast/shared";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  FadeInSection,
  GlassCard,
  HeroChip,
  PremiumScroll,
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

export default function ProfileEditScreen() {
  const { loading, session, profile } = useAuth();
  const onboarding = useOnboarding();
  const saveProfile = useSaveProfile();
  const [feedback, setFeedback] = useState<string | null>(null);

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
    if (profile) onboarding.hydrateFromProfile(profile);
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
          <Text className="text-sm font-medium text-[#46392e]">Identity</Text>
          <TextInput
            className="mt-3 rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
            onChangeText={(value) => onboarding.setField("name", value)}
            placeholder={isCreator ? "Display name" : "Operator name"}
            value={onboarding.name}
          />
          <TextInput
            className="mt-3 rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
            onChangeText={(value) => onboarding.setField("location", value)}
            placeholder="Location"
            value={onboarding.location}
          />
          <TextInput
            className="mt-3 min-h-[108px] rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
            multiline
            onChangeText={(value) => onboarding.setField("bio", value)}
            placeholder="Tighten your bio so it reads like a clear marketplace pitch."
            textAlignVertical="top"
            value={onboarding.bio}
          />
        </SoftCard>

        {isCreator ? (
          <SoftCard>
            <Text className="text-sm font-medium text-[#46392e]">Channels and niches</Text>
            <TextInput
              className="mt-3 rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
              onChangeText={(value) => onboarding.setField("instagram", value)}
              placeholder="Instagram"
              value={onboarding.instagram}
            />
            <TextInput
              className="mt-3 rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
              onChangeText={(value) => onboarding.setField("tiktok", value)}
              placeholder="TikTok"
              value={onboarding.tiktok}
            />
            <TextInput
              className="mt-3 rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
              onChangeText={(value) => onboarding.setField("youtube", value)}
              placeholder="YouTube"
              value={onboarding.youtube}
            />
            <View className="mt-4 flex-row flex-wrap gap-2">
              {creatorNiches.map((niche) => {
                const selected = onboarding.niches.includes(niche);
                return (
                  <Pressable
                    className={`rounded-full px-4 py-2 ${selected ? "bg-[#435730]" : "border border-[#d7c2ab] bg-white"}`}
                    key={niche}
                    onPress={() => onboarding.toggleNiche(niche)}
                  >
                    <Text className={selected ? "text-white" : "text-[#624330]"}>
                      {niche.replace("_", " ")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </SoftCard>
        ) : (
          <SoftCard>
            <Text className="text-sm font-medium text-[#46392e]">Brand details</Text>
            <TextInput
              className="mt-3 rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
              onChangeText={(value) => onboarding.setField("companyName", value)}
              placeholder="Company name"
              value={onboarding.companyName}
            />
            <TextInput
              className="mt-3 rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
              onChangeText={(value) => onboarding.setField("website", value)}
              placeholder="Website"
              value={onboarding.website}
            />
          </SoftCard>
        )}

        <SoftCard>
          <Text className="text-sm leading-6 text-[#5e5448]">
            Better profiles create better marketplace decisions. This is a trust surface, not a hidden settings page.
          </Text>
          <View className="mt-5 flex-row flex-wrap gap-3">
            <Pressable
              className={`rounded-full px-5 py-3 ${canSave && !saveProfile.isPending ? "bg-[#435730]" : "bg-[#91a180]"}`}
              disabled={!canSave || saveProfile.isPending}
              onPress={handleSave}
            >
              <Text className="text-sm font-semibold text-white">
                {saveProfile.isPending ? "Saving..." : "Save changes"}
              </Text>
            </Pressable>
            <Pressable
              className="rounded-full border border-[#d7c2ab] bg-white px-5 py-3"
              onPress={() => router.replace("/profile")}
            >
              <Text className="text-[#624330]">Back to profile</Text>
            </Pressable>
          </View>

          {feedback ? <Text className="mt-4 text-sm leading-6 text-[#9a3412]">{feedback}</Text> : null}
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}
