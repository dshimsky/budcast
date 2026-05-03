import {
  formatDeadline,
  formatPaymentMethod,
  formatPostType,
  formatStatus,
  hasCompletedOnboarding,
  type SubmissionPipelineRow,
  useAuth,
  useConfirmSubmissionPayment,
  useMySubmissionPipeline,
  useUpsertContentSubmission
} from "@budcast/shared";
import type { PaymentMethod, PostType } from "@budcast/shared";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, Pressable, Text, TextInput, View } from "react-native";
import { StatusPill, Surface, TrustRow } from "../components/mobile-system";
import { FadeInSection, GlassCard, MetricTile, PremiumScroll, PrimaryPill, SoftCard } from "../components/premium";

const postTypes: PostType[] = [
  "instagram_post",
  "instagram_story",
  "instagram_reel",
  "tiktok_video",
  "youtube_video",
  "youtube_short"
];

const timelineSteps = ["Accepted", "Submit", "Review", "Payment", "Complete"] as const;

type SubmissionMomentTone = "action" | "danger" | "premium" | "success" | "trust" | "warning";

interface SubmissionMoment {
  body: string;
  cta: string;
  label: string;
  stage: number;
  tone: SubmissionMomentTone;
}

function getSubmissionMoment(row: SubmissionPipelineRow): SubmissionMoment {
  const submission = row.submission;

  if (row.status === "disputed" || row.disputes.length > 0) {
    return {
      body: "A dispute or campaign issue is open. Review the brand feedback before you resubmit or close the job.",
      cta: "Review issue",
      label: "Revision requested",
      stage: 1,
      tone: "danger"
    };
  }

  if (!submission) {
    return {
      body: "Accepted by brand. Add the live post, proof, and payout method so the brand can review it.",
      cta: "Submit content",
      label: "Accepted by brand",
      stage: 1,
      tone: "action"
    };
  }

  if (submission.verification_status === "needs_revision") {
    return {
      body: "Revision requested. Update the creator link or proof using the notes below, then resubmit.",
      cta: "Resubmit content",
      label: "Revision requested",
      stage: 1,
      tone: "danger"
    };
  }

  if (submission.verification_status === "pending") {
    return {
      body: "Submitted for review. The brand is checking your content, screenshot, and campaign requirements.",
      cta: "Track review",
      label: "In brand review",
      stage: 2,
      tone: "trust"
    };
  }

  if (submission.verification_status === "verified" && !submission.payment_confirmed_by_creator) {
    return {
      body: "Payment ready. Content is approved, so confirm payment only after the payout or product value lands.",
      cta: "Confirm payment",
      label: "Payment ready",
      stage: 3,
      tone: "warning"
    };
  }

  if (submission.payment_confirmed_by_creator || row.status === "completed") {
    return {
      body: "Completed. Keep this campaign in your receipts as proof of content, approval, and payment.",
      cta: "Completed",
      label: "Completed",
      stage: 4,
      tone: "success"
    };
  }

  return {
    body: "Coordinate details with the brand before this job closes.",
    cta: "Coordinate details",
    label: "Coordinate details",
    stage: 3,
    tone: "premium"
  };
}

function SubmissionPulse() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 900,
          toValue: 1,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          duration: 900,
          toValue: 0,
          useNativeDriver: true
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View
      className="absolute h-9 w-9 rounded-full bg-budcast-lime/[0.12]"
      style={{
        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] }),
        transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.2] }) }]
      }}
    />
  );
}

function SubmissionTimeline({ activeStage }: { activeStage: number }) {
  return (
    <View className="mt-5">
      <View className="flex-row items-start justify-between">
        {timelineSteps.map((step, index) => {
          const complete = index < activeStage;
          const active = index === activeStage;
          return (
            <View className="flex-1 items-center gap-2" key={step}>
              <View className="h-9 w-full items-center justify-center">
                {active ? <SubmissionPulse /> : null}
                <View
                  className={`h-4 w-4 rounded-full border ${
                    complete
                      ? "border-budcast-lime bg-budcast-lime"
                      : active
                      ? "border-budcast-lime bg-budcast-canvas"
                      : "border-white/15 bg-white/[0.04]"
                  }`}
                />
              </View>
              <Text
                className={`text-center text-[9px] font-bold uppercase tracking-[1px] ${
                  active || complete ? "text-budcast-text" : "text-budcast-muted"
                }`}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <Text className="text-xs font-bold uppercase tracking-[1.6px] text-budcast-muted">{children}</Text>;
}

function SelectionPill({
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
      className={`rounded-pill px-3 py-2 active:scale-[0.97] ${
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
        paymentMethod: PaymentMethod | null;
        postType: PostType;
        postUrl: string;
        screenshotUrl: string;
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
          paymentMethod:
            (row.submission?.payment_method as PaymentMethod | null) ??
            ((row.opportunity?.payment_methods?.[0] as PaymentMethod | undefined) ?? null),
          postType: (row.submission?.post_type as PostType | null) ?? "instagram_reel",
          postUrl: row.submission?.post_url ?? "",
          screenshotUrl: row.submission?.screenshot_url ?? ""
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
  const actionCount = useMemo(
    () =>
      rows.filter((row) => {
        const moment = getSubmissionMoment(row);
        return moment.tone === "action" || moment.tone === "danger" || moment.tone === "warning";
      }).length,
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
        paymentMethod: draft.paymentMethod,
        postType: draft.postType,
        postUrl: draft.postUrl,
        screenshotUrl: draft.screenshotUrl || null,
        submissionId: row.submission?.id
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
          <View className="flex-row items-start justify-between gap-4">
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-medium text-budcast-text">Submissions</Text>
              <Text className="mt-2 text-[10px] uppercase tracking-[2px] text-budcast-muted">
                Creator delivery pipeline
              </Text>
              <Text className="mt-4 text-3xl font-black leading-9 text-budcast-text">
                Turn accepted jobs into paid proof.
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-3xl font-black text-budcast-lime">{actionCount}</Text>
              <Text className="text-xs uppercase tracking-[2px] text-budcast-muted">to do</Text>
            </View>
          </View>
          {actionError ? <Text className="mt-4 text-sm leading-6 text-budcast-danger">{actionError}</Text> : null}
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 flex-row gap-3" delay={60}>
        <MetricTile className="flex-1" label="Active" value={String(rows.length)} />
        <MetricTile className="flex-1" label="Verified" value={String(verifiedCount)} />
        <MetricTile className="flex-1" label="Needs action" value={String(actionCount)} />
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4 pb-8" delay={100}>
        {rows.map((row) => {
          const draft = drafts[row.id];
          const submission = row.submission;
          const moment = getSubmissionMoment(row);
          const needsForm = !submission || submission.verification_status === "needs_revision";
          const needsPayment = submission?.verification_status === "verified" && !submission.payment_confirmed_by_creator;

          return (
            <Surface className="gap-4 px-4 py-5" key={row.id} tone="raised">
              <View className="flex-row items-start justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-budcast-muted">
                    {row.opportunity?.brand?.company_name ?? "Brand"} - {formatStatus(row.status)}
                  </Text>
                  <Text className="mt-2 text-lg font-black leading-6 text-budcast-text">
                    {row.opportunity?.title ?? "Accepted campaign"}
                  </Text>
                </View>
                <StatusPill tone={moment.tone}>{moment.label}</StatusPill>
              </View>

              <Surface className="px-4 py-4" tone="overlay">
                <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-budcast-muted">
                  Current moment
                </Text>
                <Text className="mt-2 text-xl font-black leading-7 text-budcast-text">{moment.label}</Text>
                <Text className="mt-2 text-sm leading-6 text-surface-200">{moment.body}</Text>
                <SubmissionTimeline activeStage={moment.stage} />
              </Surface>

              <TrustRow
                items={[
                  { label: `Due ${formatDeadline(row.completion_deadline)}`, tone: "default" },
                  {
                    label: submission ? formatPostType(submission.post_type) : "Post needed",
                    tone: submission ? "trust" : "action"
                  },
                  {
                    label: submission?.payment_method ? formatPaymentMethod(submission.payment_method) : "Payment method",
                    tone: "premium"
                  }
                ]}
              />

              {submission ? (
                <Surface className="px-4 py-4" tone="overlay">
                  <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-budcast-muted">
                    Submission receipt
                  </Text>
                  <Text className="mt-2 text-sm font-black text-budcast-text">
                    {formatPostType(submission.post_type)} - {formatStatus(submission.verification_status)}
                  </Text>
                  <Text className="mt-2 text-xs leading-5 text-budcast-muted">
                    Brand confirmed: {submission.payment_confirmed_by_brand ? "Yes" : "No"} / You confirmed:{" "}
                    {submission.payment_confirmed_by_creator ? "Yes" : "No"}
                  </Text>
                  {submission.verification_feedback ? (
                    <Text className="mt-3 text-sm leading-6 text-surface-200">{submission.verification_feedback}</Text>
                  ) : null}
                </Surface>
              ) : null}

              {needsForm && draft ? (
                <View className="gap-4">
                  <View className="gap-2">
                    <FieldLabel>Creator link</FieldLabel>
                    <TextInput
                      className="rounded-surface border border-white/10 bg-budcast-canvas px-4 py-4 text-base text-budcast-text"
                      onChangeText={(value) =>
                        setDrafts((current) => ({
                          ...current,
                          [row.id]: {
                            ...current[row.id],
                            postUrl: value
                          }
                        }))
                      }
                      placeholder="Paste Instagram, TikTok, or YouTube URL"
                      placeholderTextColor="#a59a86"
                      value={draft.postUrl}
                    />
                  </View>

                  <View className="gap-2">
                    <FieldLabel>Proof screenshot</FieldLabel>
                    <TextInput
                      className="rounded-surface border border-white/10 bg-budcast-canvas px-4 py-4 text-base text-budcast-text"
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
                  </View>

                  <View className="gap-2">
                    <FieldLabel>Post type</FieldLabel>
                    <View className="flex-row flex-wrap gap-2">
                      {postTypes.map((postType) => (
                        <SelectionPill
                          active={draft.postType === postType}
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
                          {formatPostType(postType)}
                        </SelectionPill>
                      ))}
                    </View>
                  </View>

                  <View className="gap-2">
                    <FieldLabel>Payment method</FieldLabel>
                    <View className="flex-row flex-wrap gap-2">
                      {(row.opportunity?.payment_methods ?? []).map((method) => (
                        <SelectionPill
                          active={draft.paymentMethod === method}
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
                          {formatPaymentMethod(method)}
                        </SelectionPill>
                      ))}
                    </View>
                  </View>

                  <PrimaryPill isLoading={submitContent.isPending} onPress={() => void handleSubmit(row.id)}>
                    {moment.cta}
                  </PrimaryPill>
                </View>
              ) : null}

              {needsPayment && submission ? (
                <View className="gap-3">
                  <Surface className="border-budcast-warning/20 bg-budcast-warning/[0.08] px-4 py-4" tone="overlay">
                    <Text className="text-sm font-black text-budcast-text">Payment ready</Text>
                    <Text className="mt-2 text-sm leading-6 text-surface-200">
                      Confirm after the payout clears. This closes the job and moves it into Completed.
                    </Text>
                  </Surface>
                  <PrimaryPill
                    isLoading={confirmPayment.isPending}
                    onPress={() => void handleConfirmPayment(row.id, submission.id)}
                  >
                    Confirm I was paid
                  </PrimaryPill>
                </View>
              ) : null}
            </Surface>
          );
        })}

        {pipeline.isLoading ? (
          <SoftCard>
            <Text className="text-base text-surface-200">Loading accepted campaigns...</Text>
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
