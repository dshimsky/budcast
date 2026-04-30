import { useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import { useEffect } from "react";
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

const authSignals = [
  "Paid content opportunities",
  "Cannabis brand campaigns",
  "Submissions and payments"
];

export default function SignInScreen() {
  const { signIn, loading, session, profile } = useAuth();
  const params = useLocalSearchParams<{ seed?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const autoLoginAttempted = useRef(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace(hasCompletedOnboarding(profile) ? "/profile" : "/onboarding");
    }
  }, [loading, profile, session]);

  useEffect(() => {
    if (!__DEV__ || autoLoginAttempted.current || loading || session) return;

    const seed = params.seed;
    if (seed !== "creator" && seed !== "brand") return;

    const seedEmail =
      seed === "creator"
        ? process.env.EXPO_PUBLIC_QA_CREATOR_EMAIL
        : process.env.EXPO_PUBLIC_QA_BRAND_EMAIL;
    const seedPassword =
      seed === "creator"
        ? process.env.EXPO_PUBLIC_QA_CREATOR_PASSWORD
        : process.env.EXPO_PUBLIC_QA_BRAND_PASSWORD;

    if (!seedEmail || !seedPassword) {
      setError(`Missing local QA credentials for ${seed}.`);
      autoLoginAttempted.current = true;
      return;
    }

    autoLoginAttempted.current = true;
    setEmail(seedEmail);
    setPassword(seedPassword);
    setSubmitting(true);
    setError(null);

    signIn(seedEmail, seedPassword)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Seed sign in failed.");
        autoLoginAttempted.current = false;
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [loading, params.seed, session, signIn]);

  async function handleSignIn() {
    setSubmitting(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PremiumScroll>
      <FadeInSection>
        <GlassCard>
          <SectionTitle
            eyebrow="BudCast Sign In"
            title="Sign in to find paid content work or manage creator campaigns."
            description="Creators use the phone app to browse cannabis brand opportunities, apply, submit content, and track payment status."
          />
          <View className="mt-6 flex-row flex-wrap gap-2">
            {authSignals.map((signal) => (
              <HeroChip key={signal}>{signal}</HeroChip>
            ))}
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={80}>
        <SoftCard>
          <Text className="text-sm font-medium text-surface-300">Email</Text>
          <TextInput
            autoCapitalize="none"
            className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
            onChangeText={setEmail}
            placeholder="creator@email.com or brand@company.com"
            placeholderTextColor="#a59a86"
            value={email}
          />
          <Text className="mt-4 text-sm font-medium text-surface-300">Password</Text>
          <TextInput
            autoCapitalize="none"
            className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#a59a86"
            secureTextEntry
            value={password}
          />

          {error ? <Text className="mt-4 text-sm leading-6 text-[#d7a07d]">{error}</Text> : null}
          {profile ? <Text className="mt-4 text-sm text-herb-300">{profile.email}</Text> : null}

          <PrimaryPill
            className={`mt-5 py-4 ${loading || submitting ? "opacity-60" : ""}`}
            disabled={loading || submitting}
            onPress={handleSignIn}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </PrimaryPill>
        </SoftCard>

        <SoftCard>
          <Text className="text-sm leading-7 text-surface-300">
            New to BudCast? Create an account, then choose creator or cannabis brand during setup.
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-3">
            <Link asChild href="/">
              <SecondaryPill>Back to mobile shell</SecondaryPill>
            </Link>
            <Link asChild href="/sign-up">
              <SecondaryPill>Create account</SecondaryPill>
            </Link>
          </View>
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}
