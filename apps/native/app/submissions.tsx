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
import { FadeInSection, GlassCard, HeroChip, PremiumScroll, SectionTitle, SoftCard } from "../components/premium";

const postTypes: PostType[] = [
  "instagram_post",
  "instagram_story",
  "instagram_reel",
  "tiktok_video",
  "youtube_video",
  "youtube_short"
];

export default function SubmissionPipelineScreen() {
  const { loading, session, profile } = useAuth();
  const pipeline = useMySubmissionPipeline();
  const submitContent = useUpsertContentSubmission();
  const confirmPayment = useConfirmSubmissionPayment();
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

    await submitContent.mutateAsync({
      applicationId,
      submissionId: row.submission?.id,
      postUrl: draft.postUrl,
      postType: draft.postType,
      screenshotUrl: draft.screenshotUrl || null,
      paymentMethod: draft.paymentMethod
    });
  }

  async function handleConfirmPayment(applicationId: string, submissionId: string) {
    await confirmPayment.mutateAsync({
      applicationId,
      submissionId
    });
  }

  return (
    <PremiumScroll>
      <FadeInSection>
        <GlassCard>
          <SectionTitle
            eyebrow="Creator submissions"
            title="Submit proof, track verification, and confirm payout."
            description="This screen is wired to accepted applications plus the locked content submission table. It is the creator-side follow-through after application acceptance."
          />
          <View className="mt-6 flex-row flex-wrap gap-2">
            <HeroChip>{rows.length} accepted campaigns</HeroChip>
            <HeroChip>{verifiedCount} verified submissions</HeroChip>
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={80}>
        {rows.map((row) => {
          const draft = drafts[row.id];
          const submission = row.submission;
          const needsForm = !submission || submission.verification_status === "needs_revision";

          return (
            <SoftCard key={row.id}>
              <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">
                {row.opportunity?.brand?.company_name ?? "Brand"} • {formatStatus(row.status)}
              </Text>
              <Text className="mt-2 text-[28px] font-semibold leading-[34px] text-[#221b14]">
                {row.opportunity?.title ?? "Accepted campaign"}
              </Text>

              {submission ? (
                <View className="mt-4 rounded-[20px] border border-[#eadfce] bg-white px-4 py-4">
                  <Text className="text-sm text-[#46392e]">
                    {formatPostType(submission.post_type)} • {formatStatus(submission.verification_status)}
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-[#5e5448]">
                    Payment route: {formatPaymentMethod(submission.payment_method)}
                  </Text>
                  {submission.verification_feedback ? (
                    <Text className="mt-2 text-sm leading-6 text-[#5e5448]">{submission.verification_feedback}</Text>
                  ) : null}
                  <Text className="mt-2 text-sm leading-6 text-[#5e5448]">
                    Brand confirmed: {submission.payment_confirmed_by_brand ? "Yes" : "No"} • You confirmed:{" "}
                    {submission.payment_confirmed_by_creator ? "Yes" : "No"}
                  </Text>
                </View>
              ) : null}

              {needsForm && draft ? (
                <View className="mt-4 gap-3">
                  <TextInput
                    className="rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
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
                    value={draft.postUrl}
                  />
                  <TextInput
                    className="rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
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
                    value={draft.screenshotUrl}
                  />

                  <View className="gap-2">
                    <Text className="text-sm font-medium text-[#46392e]">Post type</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {postTypes.map((postType) => {
                        const active = draft.postType === postType;
                        return (
                          <Pressable
                            className={`rounded-full px-3 py-2 ${active ? "bg-[#435730]" : "border border-[#d7c2ab] bg-white"}`}
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
                            <Text className={`text-sm ${active ? "text-white" : "text-[#624330]"}`}>
                              {formatPostType(postType)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View className="gap-2">
                    <Text className="text-sm font-medium text-[#46392e]">Payment method</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {(row.opportunity?.payment_methods ?? []).map((method) => {
                        const active = draft.paymentMethod === method;
                        return (
                          <Pressable
                            className={`rounded-full px-3 py-2 ${active ? "bg-[#435730]" : "border border-[#d7c2ab] bg-white"}`}
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
                            <Text className={`text-sm ${active ? "text-white" : "text-[#624330]"}`}>
                              {formatPaymentMethod(method)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <Pressable className="rounded-full bg-[#435730] px-5 py-3" onPress={() => void handleSubmit(row.id)}>
                    <Text className="text-sm font-semibold text-white">
                      {submission ? "Resubmit content" : "Submit content"}
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {submission?.verification_status === "verified" && !submission.payment_confirmed_by_creator ? (
                <Pressable
                  className="mt-4 rounded-full border border-[#435730] bg-white px-5 py-3"
                  onPress={() => void handleConfirmPayment(row.id, submission.id)}
                >
                  <Text className="text-sm font-semibold text-[#435730]">Confirm I was paid</Text>
                </Pressable>
              ) : null}
            </SoftCard>
          );
        })}

        {pipeline.isLoading ? (
          <SoftCard>
            <Text className="text-base text-[#5e5448]">Loading accepted campaigns...</Text>
          </SoftCard>
        ) : null}

        {!pipeline.isLoading && rows.length === 0 ? (
          <SoftCard>
            <Text className="text-base leading-7 text-[#5e5448]">
              No accepted campaigns yet. Once a brand accepts your application, the submission workflow appears here.
            </Text>
          </SoftCard>
        ) : null}
      </FadeInSection>
    </PremiumScroll>
  );
}
