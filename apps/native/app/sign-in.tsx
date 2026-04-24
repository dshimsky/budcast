import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import { useEffect } from "react";
import { FadeInSection, GlassCard, HeroChip, PremiumScroll, SectionTitle, SoftCard } from "../components/premium";

const authSignals = [
  "Creator access",
  "Brand-safe auth",
  "Premium first impression"
];

export default function SignInScreen() {
  const { signIn, loading, session, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace(hasCompletedOnboarding(profile) ? "/profile" : "/onboarding");
    }
  }, [loading, profile, session]);

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
            eyebrow="BudCast Auth"
            title="Sign in to the creator marketplace."
            description="Shared Supabase auth is already mounted here. Native onboarding and creator flows sit on top of the same backend identity."
          />
          <View className="mt-6 flex-row flex-wrap gap-2">
            {authSignals.map((signal, index) => (
              <HeroChip key={signal}>{signal}{index === 1 ? "" : ""}</HeroChip>
            ))}
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={80}>
        <SoftCard>
          <Text className="text-sm font-medium text-[#46392e]">Email</Text>
          <TextInput
            autoCapitalize="none"
            className="mt-3 rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
            onChangeText={setEmail}
            placeholder="name@brand.com"
            value={email}
          />
          <Text className="mt-4 text-sm font-medium text-[#46392e]">Password</Text>
          <TextInput
            autoCapitalize="none"
            className="mt-3 rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            value={password}
          />

          {error ? <Text className="mt-4 text-sm leading-6 text-[#9a3412]">{error}</Text> : null}
          {profile ? <Text className="mt-4 text-sm text-[#435730]">{profile.email}</Text> : null}

          <Pressable
            className="mt-5 rounded-full bg-[#435730] px-5 py-4"
            disabled={loading || submitting}
            onPress={handleSignIn}
          >
            <Text className="text-center text-sm font-semibold text-white">
              {submitting ? "Signing in..." : "Sign in"}
            </Text>
          </Pressable>
        </SoftCard>

        <SoftCard>
          <Text className="text-sm leading-7 text-[#5e5448]">
            Need an account or want the mobile preview first?
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-3">
            <Link asChild href="/">
              <Pressable className="rounded-full border border-[#d7c2ab] bg-white px-5 py-3">
                <Text className="text-sm text-[#624330]">Back to mobile shell</Text>
              </Pressable>
            </Link>
            <Link asChild href="/sign-up">
              <Pressable className="rounded-full border border-[#d7c2ab] bg-white px-5 py-3">
                <Text className="text-sm text-[#624330]">Create account</Text>
              </Pressable>
            </Link>
          </View>
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}
