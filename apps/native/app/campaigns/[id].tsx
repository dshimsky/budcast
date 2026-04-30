import {
  formatCampaignType,
  formatContentType,
  formatCurrency,
  formatDeadline,
  parseApplyError,
  useApplyToCampaign,
  useAuth,
  useCampaign,
  useMyApplications
} from "@budcast/shared";
import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import {
  FadeInSection,
  GlassCard,
  HeroChip,
  PremiumScroll,
  PrimaryPill,
  SecondaryPill,
  SectionTitle,
  SoftCard
} from "../../components/premium";
import { InfoTile, SectionBlock, SectionEyebrow } from "../../components/sections";

function applyErrorCopy(key: ReturnType<typeof parseApplyError>) {
  switch (key) {
    case "USER_NOT_CREATOR":      return "Only creator accounts can apply.";
    case "OPPORTUNITY_NOT_AVAILABLE": return "This opportunity is no longer available.";
    case "OPPORTUNITY_FULL":      return "All slots are filled.";
    case "ALREADY_APPLIED":       return "You already applied to this opportunity.";
    case "PITCH_REQUIRED":        return "Paid and hybrid briefs require a pitch.";
    case "PITCH_LENGTH_INVALID":  return "Pitch must be between 50 and 500 characters.";
    case "INSUFFICIENT_CREDITS":  return "You do not have enough credits to apply.";
    default:                      return "Application failed. Try again.";
  }
}

export default function CampaignDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const campaign = useCampaign(params.id);
  const myApplications = useMyApplications();
  const applyMutation = useApplyToCampaign();
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error" | null>(null);

  const row = campaign.data;
  const applied = row ? myApplications.isApplied(row.id) : false;
  const requiresPitch = row?.campaign_type === "paid" || row?.campaign_type === "hybrid";
  const creditCost = row?.credit_cost_per_slot ?? row?.credit_cost ?? 0;
  const creditsBalance = profile?.credits_balance ?? 0;

  async function handleApply() {
    if (!row) return;
    try {
      setFeedback(null);
      setFeedbackTone(null);
      await applyMutation.mutateAsync({
        opportunityId: row.id,
        message: requiresPitch ? message : null
      });
      setFeedback("Application submitted.");
      setFeedbackTone("success");
    } catch (error) {
      setFeedback(applyErrorCopy(parseApplyError(error)));
      setFeedbackTone("error");
    }
  }

  // ── Loading / not found ──────────────────────────────────────────
  if (!row) {
    return (
      <PremiumScroll>
        <GlassCard>
          <Text className="text-sm text-[#a59a86]">
            {campaign.isLoading ? "Loading opportunity…" : "Opportunity not found."}
          </Text>
        </GlassCard>
      </PremiumScroll>
    );
  }

  // ── Campaign detail ────────────────────────────────────────────
  return (
    <PremiumScroll>

      {/* ── Hero card ── */}
      <FadeInSection>
        <GlassCard>
          <SectionTitle
            eyebrow={formatCampaignType(row.campaign_type)}
            title={row.title}
            description={row.short_description || row.description || "Campaign brief unavailable."}
          />

          {/* Primary stats: payout + deadline */}
          <View className="mt-5 flex-row flex-wrap gap-2">
            <HeroChip>{row.cash_amount ? formatCurrency(row.cash_amount) : "Product gifting"}</HeroChip>
            <HeroChip>{formatDeadline(row.application_deadline)}</HeroChip>
          </View>

          {/* Application cost */}
          <Text className="mt-3 text-xs text-[#a59a86]">
            Costs {creditCost} {creditCost === 1 ? "credit" : "credits"} to apply
          </Text>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4" delay={80}>

        {/* ── Brand ── */}
        <SectionBlock>
          <SectionEyebrow>Brand</SectionEyebrow>
          <Text className="mt-2 text-base font-semibold text-[#fbf8f4]">
            {row.brand?.company_name ?? "Unknown brand"}
          </Text>
          <View className="mt-3 flex-row gap-4">
            <View>
              <Text className="text-xs uppercase tracking-[2px] text-[#a59a86]">Review score</Text>
              <Text className="mt-1 text-base font-semibold text-[#fbf8f4]">
                {row.brand?.review_score ?? "—"}
              </Text>
            </View>
            <View>
              <Text className="text-xs uppercase tracking-[2px] text-[#a59a86]">Payment rate</Text>
              <Text className="mt-1 text-base font-semibold text-[#fbf8f4]">
                {row.brand?.payment_rate ?? "—"}
              </Text>
            </View>
          </View>
        </SectionBlock>

        {/* ── Required content ── */}
        <SectionBlock>
          <SectionEyebrow>Required content</SectionEyebrow>
          <Text className="mt-2 text-sm leading-6 text-[#d7cdbd]">
            {(row.content_types ?? []).map((item) => formatContentType(item)).join(", ") || "Not specified"}
          </Text>
        </SectionBlock>

        {/* ── Hashtags ── */}
        {(row.required_hashtags ?? []).length > 0 ? (
          <SectionBlock>
            <SectionEyebrow>Required hashtags</SectionEyebrow>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {(row.required_hashtags ?? []).map((tag) => (
                <HeroChip key={tag}>{tag}</HeroChip>
              ))}
            </View>
          </SectionBlock>
        ) : null}

        {/* ── Pitch input (paid + hybrid only) ── */}
        {requiresPitch ? (
          <SoftCard>
            <Text className="text-xs uppercase tracking-[2px] text-[#a59a86]">Your pitch</Text>
            <TextInput
              className="mt-3 min-h-[132px] rounded-[16px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-sm text-[#fbf8f4]"
              multiline
              onChangeText={setMessage}
              placeholder="Tell the brand why your content fits this brief. Paid and hybrid briefs require 50–500 characters."
              placeholderTextColor="#5a5957"
              textAlignVertical="top"
              value={message}
            />
            <Text className="mt-2 text-xs text-[#a59a86]">
              {message.length} / 500 characters
            </Text>
          </SoftCard>
        ) : null}

        {/* ── Feedback ── */}
        {feedback ? (
          <InfoTile label={feedbackTone === "success" ? "Application sent" : "Application blocked"}>
            {feedbackTone === "success"
              ? `✓ ${feedback}`
              : `✕ ${feedback}`}
          </InfoTile>
        ) : null}

        {/* ── Actions ── */}
        <View className="mb-8 gap-3">
          {/* Credits balance line */}
          <Text className="text-xs text-[#a59a86]">
            You have {creditsBalance} {creditsBalance === 1 ? "credit" : "credits"} · this brief costs {creditCost}
          </Text>

          {/* CTA row */}
          <View className="flex-row gap-3">
            <Link asChild href="/store">
              <SecondaryPill>Back</SecondaryPill>
            </Link>
            <PrimaryPill
              className={`flex-1 ${applied ? "opacity-50" : ""}`}
              disabled={applied || applyMutation.isPending}
              onPress={handleApply}
            >
              {applied
                ? "Already applied"
                : applyMutation.isPending
                ? "Applying…"
                : "Apply now"}
            </PrimaryPill>
          </View>
        </View>

      </FadeInSection>
    </PremiumScroll>
  );
}
