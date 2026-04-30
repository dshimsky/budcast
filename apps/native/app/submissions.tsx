import {
  formatPaymentMethod,
  formatPostType,
  formatStatus,
  hasCompletedOnboarding,
  useAuth,
  useConfirmSubmissionPayment,
  useMySubmissionPipeline,
  useUpsertContentSubmission
} from "@budcast/shared";
import type { PaymentMethod, PostType } from "@budcast/shared";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  FadeInSection,
  GlassCard,
  HeroChip,
  PremiumScroll,
  PrimaryPill,
  SectionTitle,
  SoftCard
} from "../components/premium";
import { InfoTile, SectionBlock, SectionEyebrow } from "../components/sections";

const postTypes: PostType[] = [
  "instagram_post",
  "instagram_story",
  "instagram_reel",
  "tiktok_video",
  "youtube_video",
  "youtube_short"
];

const selectedPillClass = "bg-[#6b4c2e]";
const unselectedPillClass = "border border-white/10 bg-white/[0.04]";
const selectedPillTextClass = "font-semibold text-[#fff8ec]";
const unselectedPillTextClass = "font-medium text-[#e8dccd]";

export default function SubmissionPipelineScreen() {
  const { loading, session, profile } = useAuth();
  const pipeline = useMySubmissionPipeline();
  const submitContent = useUpsertContentSubmission();
  const confirmPayment = useConfirmSubmissionPayment();
  const [actionError, setActionError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        postUrl: string;
        postType: PostType;
        screenshotUrl: string;
        paymentMethod: PaymentMethod | null;
      }
    >
  >({});

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }
    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
      return;
    }
    if (!loading && profile?.user_type === "brand") {
      router.replace("/");
    }
  }, [loading, profile, session]);

  useEffect(() => {
    setDrafts((current) => {
      const next = { ...current };
      for (const row of pipeline.data ?? []) {
        if (next[row.id]) continue;
        next[row.id] = {
          postUrl: row.submission?.post_url ?? "",
          postType: (row.submission?.post_type as PostType | null) ?? "instagram_reel",
          screenshotUrl: row.submission?.screenshot_url ?? "",
          paymentMethod:
            (row.submission?.payment_method as PaymentMethod | null) ??
            ((row.opportunity?.payment_methods?.[0] as PaymentMethod | undefined) ?? null)
        };
      }
      return next;
    });
  }, [pipeline.data]);

  const rows = pipeline.data ?? [];
  const verifiedCount = useMemo(
    () => rows.filter((row) => row.submission?.verification_status === "verified").length,
    [rows]
  );

  async function handleSubmit(applicationId: string) {
    const draft = drafts[applicationId];
    const row = rows.find((item) => item.id === applicationId);
    if (!draft || !row) return;

    try {
      setActionError(null);
      await submitContent.mutateAsync({
        applicationId,
        submissionId: row.submission?.id,
        postUrl: draft.postUrl,
        postType: draft.postType,
        screenshotUrl: draft.screenshotUrl || null,
        paymentMethod: draft.paymentMethod
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Content submission failed.");
    }
  }

  async function handleConfirmPayment(applicationId: string, submissionId: string) {
    try {
      setActionError(null);
      await confirmPayment.mutateAsync({
        applicationId,
        submissionId
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Payment confirmation failed.");
    }
  }

  return (
    <PremiumScroll>
      <FadeInSection>
        <GlassCard>
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-sm font-medium text-[#e8dccd]">Submissions</Text>
              <Text className="mt-1 text-[10px] uppercase tracking-[2px] text-[#a59a86]">
                Content &amp; payment pipeline
              </Text>
            </View>
            <View className="items-end gap-4 flex-row">
              <View className="items-end">
                <Text className="text-3xl font-black text-[#fbf8f4]">{rows.length}</Text>
                <Text className="text-xs uppercase tracking-[2px] text-[#a59a86]">active</Text>
              </View>
              <View className="items-end">
                <Text className="text-3xl font-black text-[#b8ff3d]">{verifiedCount}</Text>
                <Text className="text-xs uppercase tracking-[2px] text-[#a59a86]">verified</Text>
              </View>
            </View>
          </View>
          {actionError ? <Text className="mt-4 text-sm leading-6 text-[#d7a07d]">{actionError}</Text> : null}
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={80}>
        {rows.map((row) => {
          const draft = drafts[row.id];
          const submission = row.submission;
          const needsForm = !submission || submission.verification_status === "needs_revision";

          return (
            <SectionBlock className="bg-[#11130f]" key={row.id}>
              <SectionEyebrow>
                {row.opportunity?.brand?.company_name ?? "Brand"} • {formatStatus(row.status)}
              </SectionEyebrow>
              <Text className="mt-2 text-[17px] font-extrabold leading-snug text-[#fbf8f4] tracking-tight">
                {row.opportunity?.title ?? "Accepted campaign"}
              </Text>

              {submission ? (
                <View className={`mt-4 rounded-2xl px-4 py-4 ${
                  submission.verification_status === "verified"
                    ? "border border-[#b8ff3d]/25 bg-[#b8ff3d]/[0.04]"
                    : submission.verification_status === "needs_revision"
                    ? "border border-red-500/20 bg-red-500/[0.04]"
                    : "border border-[#a98c5b]/25 bg-[#1a1710]"
                }`}>
                  <SectionEyebrow>Submission state</SectionEyebrow>
                  <Text className={`mt-2 text-[15px] font-extrabold tracking-tight ${
                    submission.verification_status === "verified" ? "text-[#b8ff3d]" :
                    submission.verification_status === "needs_revision" ? "text-red-400" :
                    "text-[#fbf8f4]"
                  }`}>
                    {formatPostType(submission.post_type)} · {formatStatus(submission.verification_status)}
                  </Text>
                  <Text className="mt-2 text-xs leading-relaxed text-[#a59a86]">
                    Payment: {formatPaymentMethod(submission.payment_method)}
                  </Text>
                  {submission.verification_feedback ? (
                    <Text className="mt-2 text-xs leading-relaxed text-[#d7cdbd]">{submission.verification_feedback}</Text>
                  ) : null}
                  <Text className="mt-2 text-[10px] font-medium uppercase tracking-wide text-[#a59a86]">
                    Brand confirmed: {submission.payment_confirmed_by_brand ? "Yes" : "No"} · You confirmed:{" "}
                    {submission.payment_confirmed_by_creator ? "Yes" : "No"}
                  </Text>
                </View>
              ) : null}

              {needsForm && draft ? (
                <View className="mt-4 gap-3">
                  <TextInput
                    className="rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
                    onChangeText={(value) =>
                      setDrafts((current) => ({
                        ...current,
                        [row.id]: {
                          ...current[row.id],
                          postUrl: value
                        }
                      }))
                    }
                    placeholder="Paste the Instagram, TikTok, or YouTube URL"
                    placeholderTextColor="#a59a86"
                    value={draft.postUrl}
                  />
                  <TextInput
                    className="rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
                    onChangeText={(value) =>
                      setDrafts((current) => ({
                        ...current,
                        [row.id]: {
                          ...current[row.id],
                          screenshotUrl: value
                        }
                      }))
                    }
                    placeholder="Optional screenshot URL"
                    placeholderTextColor="#a59a86"
                    value={draft.screenshotUrl}
                  />

                  <View className="gap-2">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-[#a59a86]">Post type</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {postTypes.map((postType) => {
                        const active = draft.postType === postType;
                        return (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            className={`rounded-full px-3 py-2 ${active ? selectedPillClass : unselectedPillClass}`}
                            key={postType}
                            onPress={() =>
                              setDrafts((current) => ({
                                ...current,
                                [row.id]: {
                                  ...current[row.id],
                                  postType
                                }
                              }))
                            }
                          >
                            <Text className={`text-sm ${active ? selectedPillTextClass : unselectedPillTextClass}`}>
                              {formatPostType(postType)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View className="gap-2">
                    <Text className="text-sm font-medium text-surface-300">Payment method</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {(row.opportunity?.payment_methods ?? []).map((method) => {
                        const active = draft.paymentMethod === method;
                        return (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            className={`rounded-full px-3 py-2 ${active ? selectedPillClass : unselectedPillClass}`}
                            key={method}
                            onPress={() =>
                              setDrafts((current) => ({
                                ...current,
                                [row.id]: {
                                  ...current[row.id],
                                  paymentMethod: method as PaymentMethod
                                }
                              }))
                            }
                          >
                            <Text className={`text-sm ${active ? selectedPillTextClass : unselectedPillTextClass}`}>
                              {formatPaymentMethod(method)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <PrimaryPill onPress={() => void handleSubmit(row.id)}>
                    {submission ? "Resubmit content" : "Submit content"}
                  </PrimaryPill>
                </View>
              ) : null}

              {submission?.verification_status === "verified" && !submission.payment_confirmed_by_creator ? (
                <View className="mt-4 gap-3">
                  <InfoTile label="Payment checkpoint">
                    Approved content is waiting for your payment confirmation. Confirm only after the brand has paid you.
                  </InfoTile>
                  <PrimaryPill onPress={() => void handleConfirmPayment(row.id, submission.id)}>
                    Confirm I was paid
                  </PrimaryPill>
                </View>
              ) : null}
            </SectionBlock>
          );
        })}

        {pipeline.isLoading ? (
          <SoftCard>
            <Text className="text-base text-[#d7cdbd]">Loading accepted campaigns...</Text>
          </SoftCard>
        ) : null}

        {!pipeline.isLoading && rows.length === 0 ? (
          <SoftCard>
            <Text className="text-base leading-7 text-surface-300">
              No accepted campaigns yet. Once a brand accepts your application, the submission workflow appears here.
            </Text>
          </SoftCard>
        ) : null}
      </FadeInSection>
    </PremiumScroll>
  );
}
