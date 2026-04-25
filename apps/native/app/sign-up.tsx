import { useState } from "react";
import { Link, router } from "expo-router";
import { Text, TextInput, View } from "react-native";
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

const signUpSignals = [
  "Creator discovery",
  "Paid opportunities",
  "Clean payout follow-through"
];

export default function SignUpScreen() {
  const { signUp, loading, session, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace(hasCompletedOnboarding(profile) ? "/profile" : "/onboarding");
    }
  }, [loading, profile, session]);

  async function handleSignUp() {
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await signUp(email, password);
      setMessage("Account request created. Check your inbox if confirmation is enabled.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PremiumScroll>
      <FadeInSection>
        <GlassCard>
          <SectionTitle
            eyebrow="BudCast Auth"
            title="Create an account that opens into the marketplace, not a dead form."
            description="Sign-up is wired to the same shared auth provider as web. Onboarding remains native-first so the creator path feels more personal."
          />
          <View className="mt-6 flex-row flex-wrap gap-2">
            {signUpSignals.map((signal) => (
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
            placeholder="name@brand.com"
            placeholderTextColor="#a59a86"
            value={email}
          />
          <Text className="mt-4 text-sm font-medium text-surface-300">Password</Text>
          <TextInput
            autoCapitalize="none"
            className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor="#a59a86"
            secureTextEntry
            value={password}
          />

          {message ? <Text className="mt-4 text-sm leading-6 text-herb-300">{message}</Text> : null}
          {error ? <Text className="mt-4 text-sm leading-6 text-[#d7a07d]">{error}</Text> : null}

          <PrimaryPill
            className={`mt-5 py-4 ${loading || submitting ? "opacity-60" : ""}`}
            disabled={loading || submitting}
            onPress={handleSignUp}
          >
            {submitting ? "Creating account..." : "Create account"}
          </PrimaryPill>
        </SoftCard>

        <SoftCard>
          <Text className="text-sm leading-7 text-surface-300">Already have an account?</Text>
          <View className="mt-4 flex-row flex-wrap gap-3">
            <Link asChild href="/sign-in">
              <SecondaryPill>Go to sign in</SecondaryPill>
            </Link>
          </View>
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}
