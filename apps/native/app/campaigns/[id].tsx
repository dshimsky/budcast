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
import { Pressable, Text, TextInput, View } from "react-native";
import { FadeInSection, GlassCard, HeroChip, PremiumScroll, SectionTitle, SoftCard } from "../../components/premium";

function applyErrorCopy(key: ReturnType<typeof parseApplyError>) {
  switch (key) {
    case "USER_NOT_CREATOR":
      return "Only creator accounts can apply.";
    case "OPPORTUNITY_NOT_AVAILABLE":
      return "This campaign is no longer available.";
    case "OPPORTUNITY_FULL":
      return "All slots are filled.";
    case "ALREADY_APPLIED":
      return "You already applied to this campaign.";
    case "PITCH_REQUIRED":
      return "Paid and hybrid campaigns require a pitch.";
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

  const row = campaign.data;
  const applied = row ? myApplications.isApplied(row.id) : false;
  const requiresPitch = row?.campaign_type === "paid" || row?.campaign_type === "hybrid";

  async function handleApply() {
    if (!row) return;

    try {
      setFeedback(null);
      await applyMutation.mutateAsync({
        opportunityId: row.id,
        message: requiresPitch ? message : null
      });
      setFeedback("Application submitted.");
    } catch (error) {
      setFeedback(applyErrorCopy(parseApplyError(error)));
    }
  }

  if (!row) {
    return (
      <PremiumScroll>
        <GlassCard>
          <Text className="text-base text-[#5e5448]">
            {campaign.isLoading ? "Loading campaign..." : "Campaign not found."}
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
            description={row.description || row.short_description || "Campaign brief unavailable."}
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
        <SoftCard>
          <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Brand</Text>
          <Text className="mt-2 text-lg font-semibold text-[#221b14]">{row.brand?.company_name ?? "Unknown"}</Text>
          <Text className="mt-2 text-sm leading-6 text-[#5e5448]">
            Review score {row.brand?.review_score ?? "—"} • Payment rate {row.brand?.payment_rate ?? "—"}
          </Text>
        </SoftCard>

        <SoftCard>
          <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Required content</Text>
          <Text className="mt-2 text-sm leading-6 text-[#5e5448]">
            {(row.content_types ?? []).map((item) => formatContentType(item)).join(", ") || "Not specified"}
          </Text>
        </SoftCard>

        <SoftCard>
          <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">Hashtags</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {(row.required_hashtags ?? []).map((tag) => (
              <HeroChip key={tag}>{tag}</HeroChip>
            ))}
          </View>
        </SoftCard>

        {requiresPitch ? (
          <SoftCard>
            <Text className="text-sm font-medium text-[#46392e]">Pitch message</Text>
            <TextInput
              className="mt-3 min-h-[132px] rounded-[22px] border border-[#d9ccb9] bg-white px-4 py-4 text-base"
              multiline
              onChangeText={setMessage}
              placeholder="Tell the brand why you are a fit. Paid and hybrid campaigns require 50-500 characters."
              textAlignVertical="top"
              value={message}
            />
          </SoftCard>
        ) : null}

        {feedback ? (
          <SoftCard>
            <Text className="text-sm leading-6 text-[#9a3412]">{feedback}</Text>
          </SoftCard>
        ) : null}

        <View className="mb-8 mt-2 flex-row flex-wrap gap-3">
          <HeroChip>{profile?.credits_balance ?? 0} credits available</HeroChip>
          <Link asChild href="/store">
            <Pressable className="rounded-full border border-[#d7c2ab] bg-[#fffaf4] px-5 py-3">
              <Text className="text-sm text-[#624330]">Back to store</Text>
            </Pressable>
          </Link>
          <Pressable
            className={`rounded-full px-5 py-3 ${applied ? "bg-[#91a180]" : "bg-[#435730]"}`}
            disabled={applied || applyMutation.isPending}
            onPress={handleApply}
          >
            <Text className="text-sm font-semibold text-white">
              {applied ? "Already applied" : applyMutation.isPending ? "Applying..." : "Apply now"}
            </Text>
          </Pressable>
        </View>
      </FadeInSection>
    </PremiumScroll>
  );
}
