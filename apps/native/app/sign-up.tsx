import { useState } from "react";
import { Link, router } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import { useEffect } from "react";
import { FadeInSection, GlassCard, HeroChip, PremiumScroll, SectionTitle, SoftCard } from "../components/premium";

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
            placeholder="Create a password"
            secureTextEntry
            value={password}
          />

          {message ? <Text className="mt-4 text-sm leading-6 text-[#435730]">{message}</Text> : null}
          {error ? <Text className="mt-4 text-sm leading-6 text-[#9a3412]">{error}</Text> : null}

          <Pressable className="mt-5 rounded-full bg-[#435730] px-5 py-4" onPress={handleSignUp}>
            <Text className="text-center text-sm font-semibold text-white">
              {submitting ? "Creating account..." : "Create account"}
            </Text>
          </Pressable>
        </SoftCard>

        <SoftCard>
          <Text className="text-sm leading-7 text-[#5e5448]">Already have an account?</Text>
          <View className="mt-4 flex-row flex-wrap gap-3">
            <Link asChild href="/sign-in">
              <Pressable className="rounded-full border border-[#d7c2ab] bg-white px-5 py-3">
                <Text className="text-sm text-[#624330]">Go to sign in</Text>
              </Pressable>
            </Link>
          </View>
        </SoftCard>
      </FadeInSection>
    </PremiumScroll>
  );
}
