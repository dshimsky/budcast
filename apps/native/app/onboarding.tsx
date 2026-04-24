import { hasCompletedOnboarding, useAuth, useOnboarding, useSaveProfile } from "@budcast/shared";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  FadeInSection,
  GlassCard,
  HeroChip,
  MetricTile,
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

export default function OnboardingScreen() {
  const { session, profile, loading } = useAuth();
  const onboarding = useOnboarding();
  const saveProfile = useSaveProfile();
  const [feedback, setFeedback] = useState<string | null>(null);
  const isCreator = onboarding.userType === "creator";
  const onboardingComplete = hasCompletedOnboarding(profile);

  useEffect(() => {
    if (profile) onboarding.hydrateFromProfile(profile);
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
          <Text className="text-sm font-medium text-[#46392e]">I am joining as</Text>
          <View className="mt-4 flex-row flex-wrap gap-3">
            <Pressable
              className={`rounded-full px-5 py-3 ${onboarding.userType === "brand" ? "bg-[#435730]" : "border border-[#d7c2ab] bg-white"}`}
              onPress={() => onboarding.setUserType("brand")}
            >
              <Text className={onboarding.userType === "brand" ? "text-white" : "text-[#624330]"}>
                Brand operator
              </Text>
            </Pressable>
            <Pressable
              className={`rounded-full px-5 py-3 ${onboarding.userType === "creator" ? "bg-[#435730]" : "border border-[#d7c2ab] bg-white"}`}
              onPress={() => onboarding.setUserType("creator")}
            >
              <Text className={onboarding.userType === "creator" ? "text-white" : "text-[#624330]"}>
                Creator talent
              </Text>
            </Pressable>
            <Pressable
              className="rounded-full border border-[#d7c2ab] bg-white px-5 py-3"
              onPress={onboarding.reset}
            >
              <Text className="text-[#624330]">Reset</Text>
            </Pressable>
          </View>
          {!session && !loading ? (
            <View className="mt-4 rounded-[22px] border border-[#eadfce] bg-[#fff8f1] px-4 py-4">
              <Text className="text-sm leading-6 text-[#5e5448]">
                Sign in first. This flow saves directly into your shared profile record and does not keep a separate local-only draft.
              </Text>
            </View>
          ) : null}
        </SoftCard>

        <SoftCard>
          <Text className="text-sm font-medium text-[#46392e]">Core identity</Text>
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
            placeholder="Tell brands or creators what makes you a strong fit."
            textAlignVertical="top"
            value={onboarding.bio}
          />
        </SoftCard>

        {isCreator ? (
          <SoftCard>
            <Text className="text-sm font-medium text-[#46392e]">Creator channels</Text>
            <TextInput
              className="mt-3 rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
              onChangeText={(value) => onboarding.setField("instagram", value)}
              placeholder="Instagram handle"
              value={onboarding.instagram}
            />
            <TextInput
              className="mt-3 rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
              onChangeText={(value) => onboarding.setField("tiktok", value)}
              placeholder="TikTok handle"
              value={onboarding.tiktok}
            />
            <View className="mt-4">
              <Text className="text-sm font-medium text-[#46392e]">Niche focus</Text>
              <Text className="mt-2 text-sm leading-6 text-[#5e5448]">
                Select the categories where you want paid opportunities to find you first.
              </Text>
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
            </View>
          </SoftCard>
        ) : (
          <SoftCard>
            <Text className="text-sm font-medium text-[#46392e]">Brand footprint</Text>
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
            BudCast uses this profile to control matching context, marketplace trust, and role-based routing across web and native.
          </Text>
          <Pressable
            className={`mt-5 rounded-full px-5 py-4 ${!session || saveProfile.isPending || !canSubmit ? "bg-[#91a180]" : "bg-[#435730]"}`}
            disabled={!session || saveProfile.isPending || !canSubmit}
            onPress={handleSave}
          >
            <Text className="text-center text-sm font-semibold text-white">
              {saveProfile.isPending ? "Saving profile..." : "Save and continue"}
            </Text>
          </Pressable>
          {feedback ? <Text className="mt-4 text-sm leading-6 text-[#9a3412]">{feedback}</Text> : null}
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}
