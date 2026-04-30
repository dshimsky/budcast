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
    case "USER_NOT_CREATOR":
      return "Only creator accounts can apply.";
    case "OPPORTUNITY_NOT_AVAILABLE":
      return "This opportunity is no longer available.";
    case "OPPORTUNITY_FULL":
      return "All slots are filled.";
    case "ALREADY_APPLIED":
      return "You already applied to this opportunity.";
    case "PITCH_REQUIRED":
      return "Paid and hybrid briefs require a pitch.";
    case "PITCH_LENGTH_INVALID":
      return "Pitch must be between 50 and 500 characters.";
    case "INSUFFICIENT_CREDITS":
      return "You do not have enough credits to apply.";
    default:
      return "Application failed.";
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

  if (!row) {
    return (
      <PremiumScroll>
        <GlassCard>
          <Text className="text-base text-surface-300">
            {campaign.isLoading ? "Loading opportunity..." : "Opportunity not found."}
          </Text>
        </GlassCard>
      </PremiumScroll>
    );
  }

  return (
    <PremiumScroll>
      <FadeInSection>
        <GlassCard>
          <SectionTitle
            eyebrow={formatCampaignType(row.campaign_type)}
            title={row.title}
            description={row.short_description || row.description || "Campaign brief unavailable."}
          />

          <View className="mt-6 flex-row flex-wrap gap-2">
            <HeroChip>{row.cash_amount ? formatCurrency(row.cash_amount) : "Product-led"}</HeroChip>
            <HeroChip>{row.credit_cost_per_slot ?? row.credit_cost} credits</HeroChip>
            <HeroChip>{formatDeadline(row.application_deadline)}</HeroChip>
            <HeroChip>{row.brand?.company_name ?? "Unknown brand"}</HeroChip>
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 gap-4" delay={80}>
        <SectionBlock>
          <SectionEyebrow>Brand</SectionEyebrow>
          <Text className="mt-2 text-lg font-semibold text-[#fbf8f4]">{row.brand?.company_name ?? "Unknown"}</Text>
          <Text className="mt-2 text-sm leading-6 text-[#d7cdbd]">
            Review score {row.brand?.review_score ?? "—"} • Payment rate {row.brand?.payment_rate ?? "—"}
          </Text>
        </SectionBlock>

        <SectionBlock>
          <SectionEyebrow>Required content</SectionEyebrow>
          <Text className="mt-2 text-sm leading-6 text-[#d7cdbd]">
            {(row.content_types ?? []).map((item) => formatContentType(item)).join(", ") || "Not specified"}
          </Text>
        </SectionBlock>

        <SectionBlock>
          <SectionEyebrow>Hashtags</SectionEyebrow>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {(row.required_hashtags ?? []).map((tag) => (
              <HeroChip key={tag}>{tag}</HeroChip>
            ))}
          </View>
        </SectionBlock>

        {requiresPitch ? (
          <SoftCard>
            <Text className="text-sm font-medium text-surface-300">Pitch message</Text>
            <TextInput
              className="mt-3 min-h-[132px] rounded-[22px] border border-white/10 bg-[#0d0f0c] px-4 py-4 text-base text-[#fbf8f4]"
              multiline
              onChangeText={setMessage}
              placeholder="Tell the cannabis brand why your content fits this brief. Paid and hybrid briefs require 50-500 characters."
              placeholderTextColor="#a59a86"
              textAlignVertical="top"
              value={message}
            />
          </SoftCard>
        ) : null}

        {feedback ? (
          <InfoTile label={feedbackTone === "success" ? "Application sent" : "Application blocked"}>
            <Text className={`text-sm leading-6 ${feedbackTone === "success" ? "text-herb-300" : "text-[#d7a07d]"}`}>
              {feedback}
            </Text>
          </InfoTile>
        ) : null}

        <View className="mb-8 mt-2 flex-row flex-wrap gap-3">
          <HeroChip>{profile?.credits_balance ?? 0} credits available</HeroChip>
          <Link asChild href="/store">
            <SecondaryPill>Back to opportunities</SecondaryPill>
          </Link>
          <PrimaryPill
            className={applied ? "opacity-50" : ""}
            disabled={applied || applyMutation.isPending}
            onPress={handleApply}
          >
            {applied ? "Already applied" : applyMutation.isPending ? "Applying..." : "Apply now"}
          </PrimaryPill>
        </View>
      </FadeInSection>
    </PremiumScroll>
  );
}
