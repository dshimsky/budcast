"use client";

import Link from "next/link";
import {
  formatCount,
  formatDeadline,
  formatMarketplaceContentType,
  getCampaignSummaryBadges,
  getCompensationLabel,
  getCompensationValue,
  getPlatformTarget,
  getTrustComplianceGateCopy,
  hasCompletedOnboarding,
  hasCompletedTrustCompliance,
  parseApplyError,
  useApplyToCampaign,
  useAuth,
  useCampaign,
  useMyApplications
} from "@budcast/shared";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards
} from "lucide-react";
import { BudCastLogo } from "../../../components/budcast-logo";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";
import { ProfileSafetyActions } from "../../../components/safety/profile-safety-actions";
import { Button } from "../../../components/ui/button";

function applyCopy(key: ReturnType<typeof parseApplyError>) {
  switch (key) {
    case "ALREADY_APPLIED":
      return "You have already applied to this campaign.";
    case "INSUFFICIENT_CREDITS":
      return "You do not have enough credits to apply to this campaign.";
    case "PITCH_REQUIRED":
      return "Add a short pitch before applying.";
    case "PITCH_LENGTH_INVALID":
      return "Keep your pitch concise and specific.";
    case "OPPORTUNITY_FULL":
      return "This campaign is already full.";
    case "OPPORTUNITY_NOT_AVAILABLE":
      return "This campaign is no longer accepting applications.";
    case "USER_NOT_CREATOR":
      return "Only creator accounts can apply to campaigns.";
    case "COMPLIANCE_REQUIRED":
      return "Finish age, state, and terms setup before applying.";
    default:
      return "Application could not be submitted.";
  }
}

function DetailChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-9 items-center rounded-full border border-white/[0.075] bg-white/[0.05] px-3 text-xs font-black uppercase tracking-[0.16em] text-[#d8ded1] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
      {children}
    </span>
  );
}

function CampaignFact({
  icon: Icon,
  label,
  value,
  detail
}: {
  icon: typeof WalletCards;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <DetailPanel className="p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#8d7f76]">
        <Icon className="h-4 w-4 text-[#e7ff9a]" />
        {label}
      </div>
      <div className="mt-2 text-lg font-black text-[#fbfbf7]">{value}</div>
      {detail ? <div className="mt-1 text-xs leading-5 text-[#c7ccc2]">{detail}</div> : null}
    </DetailPanel>
  );
}

function BriefList({
  empty,
  items,
  prefix
}: {
  empty: string;
  items: string[];
  prefix?: string;
}) {
  if (items.length === 0) {
    return <div className="text-sm leading-6 text-[#c7ccc2]">{empty}</div>;
  }

  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div className="flex gap-3 text-sm leading-6 text-[#d8ded1]" key={item}>
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b8ff3d] shadow-[0_0_12px_rgba(184,255,61,0.45)]" />
          <span>
            {prefix ? <span className="text-[#7d7068]">{prefix}: </span> : null}
            {getCreatorFacingCampaignCopy(item)}
          </span>
        </div>
      ))}
    </div>
  );
}

function getCreatorFacingCampaignCopy(source?: string | null) {
  if (!source) return "Review the brief, confirm the requirements, and apply if your content style fits.";

  return source
    .replace(/\bfree\s+product\b/gi, "Product")
    .replace(/\bunpa(?:id)\b/gi, "Product")
    .replace(/\bgift(?:ing|ed)\b/gi, "Product")
    .replace(/\bhybr(?:id)\b/gi, "Paid + Product")
    .replace(/\bproduct[-\s]?led\b/gi, "Product")
    .replace(/^\$[\d,]+\s+to\s+/i, "")
    .replace(/\bmake a 30-90 sec video\b/gi, "create a 30–90 sec UGC video")
    .replace(/\b30-90 sec video\b/gi, "30–90 sec UGC video")
    .replace(/\bmake a\b/gi, "create a")
    .replace(/\bmake an\b/gi, "create an")
    .replace(/^create\b/i, "Create")
    .replace(/^free\b/i, "Product")
    .replace(/\bfor creators who smoke every day\b/gi, "for everyday cannabis creators");
}

function getCreatorCompensationValue(
  campaign: Parameters<typeof getCompensationValue>[0]
) {
  return getCreatorFacingCampaignCopy(getCompensationValue(campaign));
}

function getCreatorCtaCopy(status?: string | null) {
  if (status === "accepted") return "Submit content";
  if (status) return "Application submitted";
  return "Apply to campaign";
}

function getApplicationAvailability(campaign: {
  application_deadline?: string | null;
  slots_available?: number | null;
  slots_filled?: number | null;
  status?: string | null;
}) {
  if (campaign.status && campaign.status !== "active") {
    return {
      available: false,
      copy: "This campaign is not currently accepting new applications.",
      title: "Applications closed"
    };
  }

  const totalSlots = campaign.slots_available ?? 0;
  const filledSlots = campaign.slots_filled ?? 0;
  if (totalSlots > 0 && filledSlots >= totalSlots) {
    return {
      available: false,
      copy: "All creator spots have been filled for this campaign.",
      title: "Campaign is full"
    };
  }

  if (campaign.application_deadline) {
    const deadline = new Date(campaign.application_deadline).getTime();
    if (!Number.isNaN(deadline) && deadline < Date.now()) {
      return {
        available: false,
        copy: "The application window has ended for this campaign.",
        title: "Deadline passed"
      };
    }
  }

  return {
    available: true,
    copy: "Tell the brand why your content style fits this campaign.",
    title: "Apply to campaign"
  };
}

function CampaignTopBar() {
  return (
    <header className="premium-glass-bar flex items-center justify-between gap-4 rounded-[30px] px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <BudCastLogo className="brightness-125 contrast-[1.08]" href="/" size="md" variant="mark" />
        <div className="min-w-0">
          <div className="text-sm font-black leading-none text-[#fbfbf7]">BudCast</div>
          <div className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.22em] text-[#aeb5aa]">
            Creator campaign brief
          </div>
        </div>
      </div>
      <Link
        className="inline-flex min-h-10 items-center rounded-full border border-[#e7ff9a]/12 bg-white/[0.055] px-4 text-xs font-black text-[#fbfbf7] transition hover:-translate-y-0.5 hover:border-[#b8ff3d]/35 hover:bg-[#b8ff3d]/10 hover:text-[#e7ff9a]"
        href="/creator-dashboard"
      >
        Creator demo
      </Link>
    </header>
  );
}

function DetailPanel({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }) {
  return (
    <section
      className={`rounded-[30px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.024))] shadow-[0_24px_70px_rgba(0,0,0,0.38),0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

function DetailSubPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[24px] border border-white/[0.065] bg-black/25 shadow-[0_18px_45px_rgba(0,0,0,0.24),0_1px_0_rgba(255,255,255,0.035)_inset] ${className}`}>
      {children}
    </section>
  );
}

function DetailEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#e7ff9a]">{children}</p>;
}

export default function CreatorCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, session, profile } = useAuth();
  const campaign = useCampaign(params.id);
  const applications = useMyApplications();
  const applyToCampaign = useApplyToCampaign();
  const [pitch, setPitch] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedPortfolioIndex, setSelectedPortfolioIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }
    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
      return;
    }
    if (!loading && session && !hasCompletedTrustCompliance(profile)) {
      router.replace("/onboarding");
      return;
    }
    if (!loading && profile?.user_type === "brand") {
      router.replace("/dashboard");
    }
  }, [loading, profile, router, session]);

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!campaign.data || applications.isLoading || !acknowledged) return;

    const availability = getApplicationAvailability(campaign.data);
    if (!availability.available) {
      setFeedback(availability.copy);
      return;
    }

    try {
      setFeedback(null);
      await applyToCampaign.mutateAsync({
        opportunityId: campaign.data.id,
        message: pitch.trim()
      });
      setPitch("");
      setAcknowledged(false);
      setSelectedPortfolioIndex(null);
      setFeedback("Application submitted.");
    } catch (error) {
      setFeedback(applyCopy(parseApplyError(error)));
    }
  }

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing campaign details."
        description="BudCast is checking your account before opening this creator opportunity."
        primaryAction={{ href: "/sign-in", label: "Sign in" }}
        secondaryAction={{ href: "/creator-dashboard", label: "Creator demo" }}
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Finish your creator profile before applying."
        description="Brands review your profile beside every campaign application."
        primaryAction={{ href: "/profile/edit", label: "Edit profile" }}
        secondaryAction={{ href: "/creator-dashboard", label: "Creator demo" }}
      />
    );
  }

  if (!hasCompletedTrustCompliance(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Compliance setup"
        title="Finish trust setup before applying."
        description={getTrustComplianceGateCopy(profile)}
        primaryAction={{ href: "/onboarding", label: "Finish setup" }}
        secondaryAction={{ href: "/creator-dashboard", label: "Creator demo" }}
      />
    );
  }

  if (profile?.user_type !== "creator") {
    return (
      <RouteTransitionScreen
        eyebrow="Creator campaign"
        title="This campaign application page is for creators."
        description="Brand accounts manage campaign briefs from their dashboard."
        primaryAction={{ href: "/dashboard", label: "Brand dashboard" }}
        secondaryAction={{ href: "/dashboard/campaigns/new", label: "Post campaign" }}
      />
    );
  }

  if (campaign.isLoading) {
    return (
      <RouteTransitionScreen
        eyebrow="Loading campaign"
        title="Pulling campaign brief."
        description="BudCast is loading compensation, deliverables, brand context, and application status."
        secondaryAction={{ href: "/creator-dashboard", label: "Creator demo" }}
      />
    );
  }

  if (!campaign.data) {
    return (
      <main className="min-h-screen bg-[#030303] px-6 py-8 text-[#fbfbf7] md:px-10">
        <div className="mx-auto max-w-4xl">
          <DetailPanel className="p-8">
            <DetailEyebrow>Campaign detail</DetailEyebrow>
            <h1 className="mt-3 text-5xl font-black tracking-[-0.04em] text-[#fbfbf7]">Campaign not available.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8ded1]">
              This campaign is no longer accepting creator applications or could not be loaded.
            </p>
            <Button asChild className="mt-6 rounded-full bg-[#b8ff3d] text-[#071007] hover:bg-[#d7ff72]">
              <Link href="/creator-dashboard">Open creator demo</Link>
            </Button>
          </DetailPanel>
        </div>
      </main>
    );
  }

  const detail = campaign.data;
  const application = applications.getApplication(detail.id);
  const applied = Boolean(application);
  const compensationLabel = getCompensationLabel(detail);
  const compensationValue = getCreatorCompensationValue(detail);
  const remainingSlots = Math.max((detail.slots_available ?? 0) - (detail.slots_filled ?? 0), 0);
  const portfolioItems = profile.portfolio_image_urls ?? [];
  const rawBrandBio = (detail.brand as { bio?: string | null } | null)?.bio;
  const brandBio = rawBrandBio
    ? getCreatorFacingCampaignCopy(rawBrandBio)
    : "Brand details are limited for this campaign. Use the brief, compensation, and guidelines to decide if the work fits your profile.";
  const briefSummary = getCreatorFacingCampaignCopy(detail.short_description || detail.description);
  const contentDirection = getCreatorFacingCampaignCopy(detail.description);
  const brandName = detail.brand?.company_name ?? "Cannabis brand";
  const brandInitials = brandName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "BC";
  const deliverables = detail.content_types?.map(formatMarketplaceContentType).join(", ") || "UGC Video";
  const platformTarget = getPlatformTarget(detail);
  const deadlineLabel = formatDeadline(detail.application_deadline);
  const locationLabel = detail.location || "Brand-managed market coordination";
  const mustIncludes = (detail.must_includes ?? []).filter(Boolean);
  const offLimits = (detail.off_limits ?? []).filter(Boolean);
  const hashtags = (detail.required_hashtags ?? []).filter(Boolean);
  const referenceImages = (detail.reference_image_urls ?? []).filter(Boolean);
  const eligibleStates = detail.eligible_states ?? [];
  const targetPlatforms = detail.target_platforms ?? [];
  const disclosureTags = detail.disclosure_tags?.length ? detail.disclosure_tags : hashtags;
  const rightsSummary = [
    detail.rights_organic_repost ? "Organic repost" : null,
    detail.rights_paid_ads ? "Paid ads" : null,
    detail.rights_whitelisting ? "Handle whitelisting" : null,
    detail.rights_handle_licensing ? "Handle licensing" : null,
    detail.rights_exclusive ? "Exclusivity" : null,
    detail.rights_no_ai_training ? "No AI training" : null
  ].filter(Boolean) as string[];
  const hasAcceptedAssetAccess = application?.status === "accepted" || application?.status === "completed";
  const visibleReferenceImages = hasAcceptedAssetAccess ? referenceImages.slice(0, 6) : referenceImages.slice(0, 2);
  const availability = getApplicationAvailability(detail);
  const ctaCopy = applications.isLoading
    ? "Checking status"
    : applied
      ? getCreatorCtaCopy(application?.status)
      : availability.title;

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 py-5 text-[#fbfbf7] md:px-10 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <CampaignTopBar />

        <DetailPanel className="animate-enter overflow-hidden border-[#b8ff3d]/16 bg-[radial-gradient(circle_at_86%_0%,rgba(184,255,61,0.16),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.024))] p-4 md:p-6">
          <div className="rounded-[30px] border border-white/[0.085] bg-[linear-gradient(135deg,#16210f,#050604_68%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-4xl">
              <Link
                className="inline-flex items-center gap-2 text-sm font-black text-[#d8ded1] transition hover:text-[#e7ff9a]"
                href="/creator-dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
                Open creator demo
              </Link>

              <div className="mt-7 flex items-center gap-4">
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-white/[0.13] bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(184,255,61,0.1))] text-base font-black uppercase tracking-[0.14em] text-[#fbfbf7] shadow-[0_18px_50px_rgba(0,0,0,0.36),0_1px_0_rgba(255,255,255,0.08)_inset]">
                  {detail.brand?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="h-full w-full object-cover" src={detail.brand.avatar_url} />
                  ) : (
                    brandInitials
                  )}
                </div>
                <div>
                  <DetailEyebrow>Creator campaign brief</DetailEyebrow>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#d8ded1]">
                    <span className="font-black text-[#fbfbf7]">{brandName}</span>
                    <span className="h-1 w-1 rounded-full bg-stone-600" />
                    <span>{compensationLabel}</span>
                    <span className="h-1 w-1 rounded-full bg-stone-600" />
                    <span>{formatCount("spot", remainingSlots)} open</span>
                  </div>
                </div>
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-6xl">
                {detail.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#d8ded1]">
                {briefSummary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {getCampaignSummaryBadges(detail).map((badge) => (
                  <DetailChip key={badge}>{badge}</DetailChip>
                ))}
              </div>
            </div>

            {detail.brand?.id ? (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="secondary">
                  <Link href={`/brands/${detail.brand.id}`}>
                    View brand
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/creator-dashboard">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message brand
                  </Link>
                </Button>
                <ProfileSafetyActions
                  blockProfileId={detail.brand.id}
                  reportedUserId={detail.brand.id}
                  targetId={detail.id}
                  targetType="campaign"
                />
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <CampaignFact
              detail={compensationValue}
              icon={WalletCards}
              label="Compensation"
              value={compensationLabel}
            />
            <CampaignFact
              detail={platformTarget}
              icon={BriefcaseBusiness}
              label="Deliverable"
              value={deliverables}
            />
            <CampaignFact
              detail={`${detail.slots_filled}/${detail.slots_available} filled`}
              icon={UsersRound}
              label="Creator spots"
              value={`${remainingSlots} open`}
            />
            <CampaignFact
              detail={locationLabel}
              icon={CalendarClock}
              label="Apply by"
              value={deadlineLabel}
            />
          </div>
          </div>
        </DetailPanel>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="grid gap-5">
            <DetailPanel className="p-5 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <DetailEyebrow>Brand context</DetailEyebrow>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">{brandName}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#d8ded1]">{brandBio}</p>
                </div>
                <div className="rounded-[24px] border border-white/[0.065] bg-black/25 px-4 py-3 text-sm leading-6 text-[#d8ded1] shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
                  <div className="flex items-center gap-2 font-black text-[#fbfbf7]">
                    <MapPin className="h-4 w-4 text-[#e7ff9a]" />
                    Market coordination
                  </div>
                  <div className="mt-1 text-[#c7ccc2]">{locationLabel}</div>
                </div>
              </div>
            </DetailPanel>

            <DetailPanel className="p-5 md:p-7">
              <DetailEyebrow>What you will create</DetailEyebrow>
              <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                <DetailSubPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#e7ff9a]">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Content direction</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#d8ded1]">{contentDirection}</p>
                </DetailSubPanel>
                <DetailSubPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#e7ff9a]">
                    <PackageCheck className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Campaign summary</span>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm leading-6 text-[#d8ded1]">
                    <div>
                      <span className="text-[#83766e]">Create: </span>
                      {deliverables}
                    </div>
                    <div>
                      <span className="text-[#83766e]">Platform: </span>
                      {platformTarget}
                    </div>
                    <div>
                      <span className="text-[#83766e]">Receive: </span>
                      {compensationLabel} · {compensationValue}
                    </div>
                  </div>
                </DetailSubPanel>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <DetailSubPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#e7ff9a]">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Must include</span>
                  </div>
                  <div className="mt-3">
                    <BriefList empty="The brand has not added required talking points yet." items={mustIncludes.slice(0, 5)} />
                  </div>
                </DetailSubPanel>
                <DetailSubPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#e7ff9a]">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Avoid</span>
                  </div>
                  <div className="mt-3">
                    <BriefList
                      empty="Avoid medical claims, direct sales CTAs, overconsumption language, and content that could appear targeted to minors."
                      items={offLimits.slice(0, 5)}
                    />
                  </div>
                </DetailSubPanel>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <DetailSubPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#e7ff9a]">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Brand-safe notes</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#d8ded1]">
                    Keep the content creator-led and brand-safe. Do not make medical claims, target minors,
                    encourage overconsumption, or include direct sales language.
                  </p>
                  {hashtags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {hashtags.slice(0, 6).map((tag) => (
                        <span className="rounded-full border border-white/[0.075] bg-white/[0.04] px-3 py-1.5 text-xs text-[#d8ded1]" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </DetailSubPanel>
                <DetailSubPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#e7ff9a]">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Coordination</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#d8ded1]">
                    If this campaign includes Product, coordinate campaign timing, usage context, and product status
                    directly with the brand after acceptance.
                  </p>
                </DetailSubPanel>
              </div>

              <DetailSubPanel className="mt-5 p-5">
                <div className="flex items-center gap-2 text-[#e7ff9a]">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Rights & compliance</span>
                </div>
                <div className="mt-4 grid gap-4 text-sm leading-6 text-[#d8ded1]">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-[#83766e]">Usage rights</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(rightsSummary.length ? rightsSummary : ["Organic repost"]).map((item) => (
                        <DetailChip key={item}>{item}</DetailChip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-[#83766e]">Markets and platforms</div>
                    <div className="mt-2 text-[#c7ccc2]">
                      Markets: {eligibleStates.length ? eligibleStates.join(", ") : "Brand-defined legal markets"} · Platforms:{" "}
                      {targetPlatforms.length ? targetPlatforms.map((platform) => platform.replace(/\b\w/g, (letter) => letter.toUpperCase())).join(", ") : platformTarget}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-[#83766e]">Required disclosures</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {disclosureTags.slice(0, 6).map((tag) => (
                        <DetailChip key={tag}>{tag}</DetailChip>
                      ))}
                    </div>
                  </div>
                </div>
              </DetailSubPanel>

              {referenceImages.length > 0 ? (
                <DetailSubPanel className="mt-5 p-5">
                  <div className="flex items-center gap-2 text-[#e7ff9a]">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">
                      {hasAcceptedAssetAccess ? "Campaign asset pack" : "Brand asset preview"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#d8ded1]">
                    {hasAcceptedAssetAccess
                      ? "These are the working assets attached to the campaign. Use them for logos, product visuals, packaging references, and approved creative direction."
                      : "Preview assets help you understand the campaign style before applying. The full working asset pack is emphasized after the brand accepts you."}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleReferenceImages.map((image, index) => (
                      <div className="overflow-hidden rounded-[22px] border border-white/[0.075] bg-black/30 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]" key={`${image}-${index}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="" className="aspect-[4/3] w-full object-cover" src={image} />
                      </div>
                    ))}
                  </div>
                  {!hasAcceptedAssetAccess && referenceImages.length > visibleReferenceImages.length ? (
                    <div className="mt-4 rounded-[20px] border border-[#b8ff3d]/16 bg-[#b8ff3d]/8 px-4 py-3 text-sm font-semibold leading-6 text-[#d8ded1]">
                      {referenceImages.length - visibleReferenceImages.length} additional campaign asset
                      {referenceImages.length - visibleReferenceImages.length === 1 ? "" : "s"} unlock after acceptance.
                    </div>
                  ) : null}
                </DetailSubPanel>
              ) : null}
            </DetailPanel>
          </div>

          <aside className="grid content-start gap-5 xl:sticky xl:top-6">
            <DetailPanel className="p-5" id="apply">
              <DetailEyebrow>Application</DetailEyebrow>
              <div className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                {ctaCopy}
              </div>
              <p className="mt-3 text-sm leading-7 text-[#d8ded1]">
                {applications.isLoading
                  ? "BudCast is checking your application status before showing the next action."
                  : applied
                  ? application?.status === "accepted"
                    ? "You are accepted. Submit content from your creator work queue."
                    : "The brand can now review your profile, pitch, and portfolio context."
                  : availability.copy}
              </p>

              {applications.isLoading ? (
                <div className="mt-5 rounded-[24px] border border-white/[0.075] bg-black/20 p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
                  <div className="flex items-center gap-2 text-[#fbfbf7]">
                    <LoaderCircle className="h-5 w-5 animate-spin text-[#e7ff9a]" />
                    <span className="text-sm font-semibold">Checking application status</span>
                  </div>
                  <Button className="mt-5 w-full" disabled variant="secondary">
                    Checking status
                  </Button>
                </div>
              ) : applied ? (
                <div className="mt-5 rounded-[24px] border border-[#c8f060]/20 bg-[#c8f060]/10 p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
                  <div className="flex items-center gap-2 text-[#dff7a8]">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-semibold capitalize">{application?.status ?? "pending"}</span>
                  </div>
                  <Button asChild className="mt-5 w-full" variant="secondary">
                    <Link href="/creator-dashboard">
                      {application?.status === "accepted" ? "Submit content" : "View status"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : !availability.available ? (
                <div className="mt-5 rounded-[24px] border border-white/[0.075] bg-black/20 p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
                  <div className="flex items-center gap-2 text-[#fbfbf7]">
                    <Clock3 className="h-5 w-5 text-[#e7ff9a]" />
                    <span className="text-sm font-semibold">{availability.title}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#aeb5aa]">{availability.copy}</p>
                  <Button asChild className="mt-5 w-full" variant="secondary">
                    <Link href="/creator-dashboard">
                      Open creator demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <form className="mt-5 grid gap-4" onSubmit={handleApply}>
                  <div className="rounded-[20px] border border-white/[0.075] bg-black/20 p-4 text-sm leading-6 text-[#d8ded1] shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
                    <div className="font-black text-[#fbfbf7]">Before you apply</div>
                    <div className="mt-2">{compensationLabel}: {compensationValue}</div>
                    <div>Deliverable: {deliverables}</div>
                    <div>Apply by: {deadlineLabel}</div>
                    <div>Location: {locationLabel}</div>
                  </div>
                  <label className="text-sm font-black text-[#fbfbf7]">
                    Pitch to the brand
                    <textarea
                      className="premium-textarea mt-2 min-h-[132px]"
                      onChange={(event) => setPitch(event.target.value)}
                      placeholder="Tell the brand why your content style fits this campaign."
                      value={pitch}
                    />
                  </label>
                  <div className="rounded-[20px] border border-white/[0.075] bg-white/[0.04] p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
                    <div className="text-sm font-black text-[#fbfbf7]">Portfolio examples</div>
                    <p className="mt-2 text-xs leading-5 text-[#aeb5aa]">
                      Pick one example to reference in your pitch. Brands can review saved work from your creator profile.
                    </p>
                    {portfolioItems.length > 0 ? (
                      <div className="mt-3 grid gap-2">
                        {portfolioItems.slice(0, 3).map((item, index) => (
                          <button
                            className={`flex items-center gap-3 rounded-[18px] border px-3 py-3 text-left text-sm transition ${
                              selectedPortfolioIndex === index
                                ? "border-[#b8ff3d]/45 bg-[#b8ff3d]/12 text-[#fbfbf7] shadow-[0_12px_28px_rgba(184,255,61,0.12)]"
                                : "border-white/[0.075] bg-black/20 text-[#d8ded1] hover:border-white/20"
                            }`}
                            key={`${item}-${index}`}
                            onClick={() => setSelectedPortfolioIndex(index)}
                            type="button"
                          >
                            {item.startsWith("http") ? (
                              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-[14px] border border-white/[0.075] bg-black/30">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt="" className="h-full w-full object-cover" src={item} />
                              </span>
                            ) : (
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.075] bg-black/30 text-xs uppercase text-[#e7ff9a]">
                                UGC
                              </span>
                            )}
                            <span>
                              <span className="block font-black">Portfolio example {index + 1}</span>
                              <span className="mt-1 block text-xs text-[#aeb5aa]">
                                {item.startsWith("http") ? "Saved media from your profile" : item}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-[18px] border border-dashed border-white/[0.12] bg-black/20 px-4 py-3 text-sm leading-6 text-[#aeb5aa]">
                        Add portfolio examples to your creator profile to strengthen future applications.
                      </div>
                    )}
                  </div>
                  <label className="flex items-start gap-3 rounded-[20px] border border-white/[0.075] bg-white/[0.04] p-4 text-sm leading-6 text-[#d8ded1] shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
                    <input
                      checked={acknowledged}
                      className="mt-1 accent-[#b8ff3d]"
                      onChange={(event) => setAcknowledged(event.target.checked)}
                      type="checkbox"
                    />
                    <span>I reviewed the campaign requirements, usage rights, market limits, disclosures, and content guidelines.</span>
                  </label>
                  <Button className="w-full" disabled={!pitch.trim() || !acknowledged || applyToCampaign.isPending} type="submit">
                    {applyToCampaign.isPending ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      "Apply to campaign"
                    )}
                  </Button>
                  {feedback ? (
                    <div className="rounded-[20px] border border-white/[0.075] bg-black/20 p-4 text-sm text-[#fbfbf7]" role="status">
                      {feedback}
                    </div>
                  ) : null}
                </form>
              )}
            </DetailPanel>

            <DetailSubPanel className="p-5">
              <DetailEyebrow>What happens next</DetailEyebrow>
              <div className="mt-4 grid gap-3">
                {[
                  ["Apply", "Your pitch and profile go to the brand."],
                  ["Brand review", "The brand accepts or declines from applicant review."],
                  ["Coordinate details", "Use messages to confirm campaign timing, payment expectations, product status, and content usage."],
                  ["Create content", "If accepted, submit the content link for approval."],
                  ["Track status", "BudCast keeps submission, payment, and product status visible."]
                ].map(([title, copy]) => (
                  <div className="rounded-[18px] border border-white/[0.065] bg-black/20 p-3 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]" key={title}>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#fbfbf7]">
                      <Clock3 className="h-4 w-4 text-[#e7ff9a]" />
                      {title}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[#aeb5aa]">{copy}</div>
                  </div>
                ))}
              </div>
            </DetailSubPanel>
          </aside>
        </section>
      </div>
    </main>
  );
}
