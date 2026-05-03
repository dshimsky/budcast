import { hasCompletedOnboarding, useAuth, useOnboarding, useSaveProfile } from "@budcast/shared";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { StatusPill, Surface } from "../components/mobile-system";
import { FadeInSection, GlassCard, MetricTile, PremiumScroll, PrimaryPill, SecondaryPill, SoftCard } from "../components/premium";

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

function FieldLabel({ children }: { children: ReactNode }) {
  return <Text className="text-xs font-bold uppercase tracking-[1.6px] text-budcast-muted">{children}</Text>;
}

function TogglePill({
  active,
  children,
  onPress
}: {
  active: boolean;
  children: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`rounded-pill px-4 py-2 active:scale-[0.97] ${
        active ? "bg-budcast-lime" : "border border-white/10 bg-white/[0.05]"
      }`}
      onPress={onPress}
    >
      <Text className={`text-sm font-semibold ${active ? "text-budcast-canvas" : "text-surface-200"}`}>
        {children}
      </Text>
    </Pressable>
  );
}

function SetupProgress({
  channelsReady,
  identityReady,
  nichesReady,
  roleReady
}: {
  channelsReady: boolean;
  identityReady: boolean;
  nichesReady: boolean;
  roleReady: boolean;
}) {
  const steps = [
    { label: "Role", ready: roleReady },
    { label: "Identity", ready: identityReady },
    { label: "Channels", ready: channelsReady },
    { label: "Niches", ready: nichesReady },
    { label: "Ready to match", ready: roleReady && identityReady && channelsReady }
  ];

  return (
    <Surface className="gap-4 px-4 py-5" tone="raised">
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-budcast-muted">
            Setup progress
          </Text>
          <Text className="mt-2 text-lg font-black leading-6 text-budcast-text">Build a profile brands can trust.</Text>
        </View>
        <StatusPill tone={steps.every((step) => step.ready) ? "success" : "warning"}>
          {steps.filter((step) => step.ready).length}/{steps.length}
        </StatusPill>
      </View>
      <View className="gap-3">
        {steps.map((step) => (
          <View className="flex-row items-center justify-between gap-3" key={step.label}>
            <Text className="flex-1 text-sm leading-6 text-surface-200">{step.label}</Text>
            <StatusPill tone={step.ready ? "success" : "default"}>{step.ready ? "Done" : "Open"}</StatusPill>
          </View>
        ))}
      </View>
    </Surface>
  );
}

function RoleOption({
  active,
  body,
  label,
  onPress
}: {
  active: boolean;
  body: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`flex-1 rounded-surface border px-4 py-4 active:scale-[0.98] ${
        active ? "border-budcast-lime bg-budcast-limeSoft" : "border-white/10 bg-white/[0.04]"
      }`}
      onPress={onPress}
    >
      <Text className="text-base font-black text-budcast-text">{label}</Text>
      <Text className="mt-2 text-sm leading-6 text-budcast-muted">{body}</Text>
    </Pressable>
  );
}

export default function OnboardingScreen() {
  const { session, profile, loading } = useAuth();
  const onboarding = useOnboarding();
  const saveProfile = useSaveProfile();
  const [feedback, setFeedback] = useState<string | null>(null);
  const hydratedProfileId = useRef<string | null>(null);
  const isCreator = onboarding.userType === "creator";
  const isBrand = onboarding.userType === "brand";
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

  const roleReady = Boolean(onboarding.userType);
  const identityReady = Boolean(onboarding.name.trim());
  const channelsReady = isCreator ? Boolean(onboarding.instagram.trim()) : isBrand ? Boolean(onboarding.companyName.trim()) : false;
  const nichesReady = isCreator ? onboarding.niches.length > 0 : isBrand;

  const canSubmit = useMemo(() => {
    if (!roleReady || !identityReady) return false;
    if (isCreator) return Boolean(onboarding.instagram.trim());
    return Boolean(onboarding.companyName.trim());
  }, [identityReady, isCreator, onboarding.companyName, onboarding.instagram, roleReady]);

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
          <View className="flex-row items-start justify-between gap-4">
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-medium text-budcast-text">Marketplace Setup</Text>
              <Text className="mt-2 text-[10px] uppercase tracking-[2px] text-budcast-muted">
                Creator and brand profile
              </Text>
              <Text className="mt-4 text-3xl font-black leading-9 text-budcast-text">
                Set up your match-ready identity.
              </Text>
            </View>
            <StatusPill tone={canSubmit ? "success" : "warning"}>{canSubmit ? "Ready" : "Draft"}</StatusPill>
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 flex-row gap-3" delay={60}>
        <MetricTile className="flex-1" label="Role" value={onboarding.userType ? "Set" : "Choose"} />
        <MetricTile className="flex-1" label="Channels" value={channelsReady ? "Ready" : "Open"} />
        <MetricTile className="flex-1" label="Niches" value={String(onboarding.niches.length)} />
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={120}>
        <SetupProgress
          channelsReady={channelsReady}
          identityReady={identityReady}
          nichesReady={nichesReady}
          roleReady={roleReady}
        />

        <Surface className="gap-4 px-4 py-5" tone="raised">
          <FieldLabel>I am joining as</FieldLabel>
          <View className="flex-row gap-3">
            <RoleOption
              active={isCreator}
              body="Apply to paid content briefs and manage submissions."
              label="Content creator"
              onPress={() => onboarding.setUserType("creator")}
            />
            <RoleOption
              active={isBrand}
              body="Post campaigns and review creator applicants."
              label="Cannabis brand"
              onPress={() => onboarding.setUserType("brand")}
            />
          </View>
          <View className="flex-row flex-wrap gap-3">
            <SecondaryPill className="px-4 py-3" onPress={onboarding.reset}>
              Reset
            </SecondaryPill>
          </View>
          {!session && !loading ? (
            <Surface className="border-budcast-warning/20 bg-budcast-warning/[0.08] px-4 py-4" tone="overlay">
              <Text className="text-sm leading-6 text-surface-200">
                Sign in first. This flow saves directly into your shared profile record.
              </Text>
            </Surface>
          ) : null}
        </Surface>

        <Surface className="gap-3 px-4 py-5" tone="raised">
          <FieldLabel>Identity</FieldLabel>
          <TextInput
            className="rounded-surface border border-white/10 bg-budcast-canvas px-4 py-4 text-base text-budcast-text"
            onChangeText={(value) => onboarding.setField("name", value)}
            placeholder={isCreator ? "Creator name" : "Brand contact name"}
            placeholderTextColor="#a59a86"
            value={onboarding.name}
          />
          <TextInput
            className="rounded-surface border border-white/10 bg-budcast-canvas px-4 py-4 text-base text-budcast-text"
            onChangeText={(value) => onboarding.setField("location", value)}
            placeholder="Location"
            placeholderTextColor="#a59a86"
            value={onboarding.location}
          />
          <TextInput
            className="min-h-[108px] rounded-surface border border-white/10 bg-budcast-canvas px-4 py-4 text-base text-budcast-text"
            multiline
            onChangeText={(value) => onboarding.setField("bio", value)}
            placeholder={isCreator ? "Tell cannabis brands what kind of content you make." : "Tell creators what your cannabis brand is about."}
            placeholderTextColor="#a59a86"
            textAlignVertical="top"
            value={onboarding.bio}
          />
        </Surface>

        {isCreator ? (
          <Surface className="gap-3 px-4 py-5" tone="raised">
            <FieldLabel>Channels</FieldLabel>
            <TextInput
              className="rounded-surface border border-white/10 bg-budcast-canvas px-4 py-4 text-base text-budcast-text"
              onChangeText={(value) => onboarding.setField("instagram", value)}
              placeholder="Instagram handle"
              placeholderTextColor="#a59a86"
              value={onboarding.instagram}
            />
            <TextInput
              className="rounded-surface border border-white/10 bg-budcast-canvas px-4 py-4 text-base text-budcast-text"
              onChangeText={(value) => onboarding.setField("tiktok", value)}
              placeholder="TikTok handle"
              placeholderTextColor="#a59a86"
              value={onboarding.tiktok}
            />
            <FieldLabel>Niches</FieldLabel>
            <View className="flex-row flex-wrap gap-2">
              {creatorNiches.map((niche) => {
                const selected = onboarding.niches.includes(niche);
                return (
                  <TogglePill active={selected} key={niche} onPress={() => onboarding.toggleNiche(niche)}>
                    {niche.replace(/_/g, " ")}
                  </TogglePill>
                );
              })}
            </View>
          </Surface>
        ) : (
          <Surface className="gap-3 px-4 py-5" tone="raised">
            <FieldLabel>Channels</FieldLabel>
            <TextInput
              className="rounded-surface border border-white/10 bg-budcast-canvas px-4 py-4 text-base text-budcast-text"
              onChangeText={(value) => onboarding.setField("companyName", value)}
              placeholder="Company name"
              placeholderTextColor="#a59a86"
              value={onboarding.companyName}
            />
            <TextInput
              className="rounded-surface border border-white/10 bg-budcast-canvas px-4 py-4 text-base text-budcast-text"
              onChangeText={(value) => onboarding.setField("website", value)}
              placeholder="Website"
              placeholderTextColor="#a59a86"
              value={onboarding.website}
            />
          </Surface>
        )}

        <SoftCard>
          <Text className="text-sm leading-6 text-surface-300">
            Ready to match profiles give brands and creators enough context before a campaign starts.
          </Text>
          <PrimaryPill
            className={`mt-5 py-4 ${!session || saveProfile.isPending || !canSubmit ? "opacity-50" : ""}`}
            disabled={!session || saveProfile.isPending || !canSubmit}
            onPress={handleSave}
          >
            {saveProfile.isPending ? "Saving profile..." : "Save and continue"}
          </PrimaryPill>
          {feedback ? <Text className="mt-4 text-sm leading-6 text-budcast-danger">{feedback}</Text> : null}
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}
