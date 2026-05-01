"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Globe2, MapPin, MessageCircle, ShieldCheck, Sparkles, Star, UsersRound } from "lucide-react";
import {
  getBrandTeamRoleLabel,
  formatCompact,
  formatDeadline,
  getCompensationLabel,
  getCompensationValue,
  getTrustBadgeDescriptors,
  getProfileFollowStatsLabels,
  getPlatformTarget,
  getPrimaryContentType,
  supabase,
  useAuth,
  useBrandProfile,
  useProfileFollowStats,
  useProfileReviews,
  type BrandTeamMember,
  type ProfileReview,
  type ReviewDimensionKey,
  type User
} from "@budcast/shared";
import { useParams } from "next/navigation";
import { BrandMobileBottomNav } from "../../../components/brand-mobile";
import { PublicMarketplaceHeader } from "../../../components/public-marketplace-entry";
import {
  CampaignFeedCard,
  MarketplaceBadge,
  MediaGrid,
  MetadataStrip,
  SocialPlatformGrid,
  TrustBadgeRow,
  WorkQueueItem,
  type SocialPlatformItem
} from "../../../components/marketplace";
import { Button } from "../../../components/ui/button";
import { ProfileFollowButton } from "../../../components/profile-follow-button";
import { ProfileSafetyActions } from "../../../components/safety/profile-safety-actions";

function formatPercent(value?: number | null) {
  if (value == null) return "Pending";
  return `${Math.round(value)}%`;
}

function formatRating(score?: number | null, count?: number | null) {
  if (score == null) return "No reviews yet";
  return `${score.toFixed(1)} · ${formatCompact(count ?? 0)} reviews`;
}

function normalizeWebsiteUrl(website?: string | null) {
  const value = website?.trim();
  if (!value) return null;

  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function BrandStateCard({
  description,
  title
}: {
  description: string;
  title: string;
}) {
  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-10 pt-3 text-[#fbfbf7] md:px-8 md:pt-5">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <PublicMarketplaceHeader accountHref="/brands" accountLabel="Brands" signedIn />
        <section className="rounded-[38px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-8 shadow-[0_28px_90px_rgba(0,0,0,0.48)]">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Brand profile</div>
          <h1 className="mt-4 text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">{description}</p>
          <Button asChild className="mt-6 border-white/10 bg-white/[0.04] text-[#fbfbf7]" variant="secondary">
            <Link href="/brands">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to brands
            </Link>
          </Button>
        </section>
      </div>
    </main>
  );
}

const brandReviewDimensions: Array<{ key: ReviewDimensionKey; label: string }> = [
  { key: "payment_speed_score", label: "Payment speed" },
  { key: "communication_score", label: "Communication" },
  { key: "product_quality_score", label: "Product/campaign experience" }
];

type PublicBrandTeamMember = BrandTeamMember & {
  user?: Pick<User, "id" | "email" | "name" | "avatar_url"> | null;
};

function usePublicBrandTeamMembers(brandId: string | null | undefined) {
  const [members, setMembers] = useState<PublicBrandTeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      if (!brandId) {
        setMembers([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data: memberRows, error: membersError } = await supabase
          .from("brand_team_members")
          .select("*")
          .eq("brand_id", brandId)
          .eq("status", "active")
          .eq("public_display", true)
          .order("created_at", { ascending: true });

        if (membersError) throw membersError;

        const activeRows = (memberRows ?? []) as BrandTeamMember[];
        const userIds = activeRows.map((member) => member.user_id);
        const { data: userRows, error: usersError } = userIds.length
          ? await supabase.from("users").select("id,email,name,avatar_url").in("id", userIds).eq("user_type", "brand_team")
          : { data: [], error: null };

        if (usersError) throw usersError;

        const userById = new Map((userRows ?? []).map((user) => [user.id, user]));

        if (!cancelled) {
          setMembers(activeRows.map((member) => ({ ...member, user: userById.get(member.user_id) ?? null })));
        }
      } catch (memberError) {
        if (!cancelled) {
          setError(memberError instanceof Error ? memberError.message : "Unable to load this brand team.");
          setMembers([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [brandId]);

  return { error, isLoading, members };
}

function PublicBrandTeamSection({
  brandName,
  members,
  isLoading,
  error,
  viewerProfile
}: {
  brandName: string;
  members: PublicBrandTeamMember[];
  isLoading: boolean;
  error: string | null;
  viewerProfile?: User | null;
}) {
  return (
    <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
            <UsersRound className="h-4 w-4" />
            Public team
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7] md:text-4xl">
            People behind {brandName}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c7ccc2]">
            Active public brand-side contacts help creators understand who manages campaigns, reviews, and coordination.
          </p>
        </div>
        <MarketplaceBadge tone="neutral">{isLoading ? "Loading" : `${formatCompact(members.length)} public`}</MarketplaceBadge>
      </div>

      {error ? (
        <div className="mt-5 rounded-[26px] border border-dashed border-white/[0.12] bg-white/[0.025] p-5">
          <p className="text-sm font-black text-[#fbfbf7]">Team unavailable right now.</p>
          <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">{error}</p>
        </div>
      ) : null}

      {!error && members.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => {
            const memberName = member.user?.name || member.user?.email || "Brand team member";
            const roleLabel = getBrandTeamRoleLabel(member.role);
            const canMessage = viewerProfile?.user_type === "creator" && viewerProfile.id !== member.user_id;

            return (
              <article
                className="rounded-[26px] border border-white/[0.075] bg-white/[0.04] p-4 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]"
                key={member.id}
              >
                <div className="flex items-start gap-3">
                  <Link
                    className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[18px] border border-white/[0.1] bg-black/32 text-sm font-black text-[#fbfbf7]"
                    href={`/team/${member.user_id}`}
                  >
                    {member.user?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" className="h-full w-full object-cover" src={member.user.avatar_url} />
                    ) : (
                      getInitials(memberName)
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link className="block truncate text-base font-black text-[#fbfbf7] transition hover:text-[#e7ff9a]" href={`/team/${member.user_id}`}>
                      {memberName}
                    </Link>
                    <div className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-[#aeb5aa]">
                      {member.title ? `${member.title} · ${roleLabel}` : roleLabel}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    className="inline-flex items-center gap-2 rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1.5 text-xs font-black text-[#e7ff9a] transition hover:bg-[#b8ff3d]/14"
                    href={`/team/${member.user_id}`}
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified team
                  </Link>
                  {canMessage ? (
                    <Link
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black text-[#d8ded1] transition hover:bg-white/[0.07]"
                      href={`/creator-dashboard/messages?user=${member.user_id}`}
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-[#e7ff9a]" />
                      Message
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {!error && !members.length ? (
        <div className="mt-5 rounded-[26px] border border-dashed border-white/[0.12] bg-white/[0.025] p-5">
          <p className="text-sm font-black text-[#fbfbf7]">
            {isLoading ? "Loading public brand team..." : "No public team members yet."}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
            When {brandName} publishes public team contacts, creators will see names, roles, and profile links here.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function BrandReviewsSection({
  dimensionAverages,
  isLoading,
  reviewCount,
  reviews,
  score
}: {
  dimensionAverages?: Record<ReviewDimensionKey, number | null>;
  isLoading: boolean;
  reviewCount: number;
  reviews: ProfileReview[];
  score: number | null;
}) {
  const writtenReviews = reviews.filter((review) => review.review_text?.trim()).slice(0, 3);

  return (
    <section className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.035] shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]">
      <div className="border-b border-white/[0.075] bg-[radial-gradient(circle_at_88%_0%,rgba(184,255,61,0.14),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Creator reviews</div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7] md:text-4xl">
              Feedback from completed campaigns
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c7ccc2]">
              Creator feedback helps future applicants understand payment speed, communication, and the campaign experience.
            </p>
          </div>
          <div className="rounded-[24px] border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-5 py-4 text-right shadow-[0_18px_52px_rgba(184,255,61,0.08)]">
            <div className="flex items-center justify-end gap-2 text-4xl font-black tracking-[-0.06em] text-[#fbfbf7]">
              <Star className="h-6 w-6 fill-[#e7ff9a] text-[#e7ff9a]" />
              {formatScore(score)}
            </div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#e7ff9a]">
              {formatCompact(reviewCount)} review{reviewCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {brandReviewDimensions.map((dimension) => (
            <div className="rounded-[22px] border border-white/[0.08] bg-black/28 p-4" key={dimension.key}>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7d7068]">{dimension.label}</div>
              <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                {formatScore(dimensionAverages?.[dimension.key] ?? null)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-black tracking-[-0.03em] text-[#fbfbf7]">Recent written reviews</h3>
          {isLoading ? <span className="text-xs font-bold text-[#aeb5aa]">Loading...</span> : null}
        </div>

        {writtenReviews.length ? (
          <div className="mt-4 grid gap-3">
            {writtenReviews.map((review) => (
              <BrandReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[26px] border border-dashed border-white/[0.12] bg-white/[0.025] p-5">
            <p className="text-sm font-black text-[#fbfbf7]">{isLoading ? "Loading reviews..." : "No written reviews yet."}</p>
            <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
              Reviews appear after completed campaign work, once creators can rate payment speed, communication, and the product or campaign experience.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function BrandReviewCard({ review }: { review: ProfileReview }) {
  const reviewerName = getReviewerName(review);
  const campaignTitle = review.application?.opportunity?.title;

  return (
    <article className="rounded-[26px] border border-white/[0.075] bg-white/[0.04] p-4 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[16px] border border-white/[0.1] bg-black/32 text-xs font-black text-[#fbfbf7]">
            {review.reviewer?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-full w-full object-cover" src={review.reviewer.avatar_url} />
            ) : (
              getInitials(reviewerName)
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-black text-[#fbfbf7]">{reviewerName}</div>
            <div className="mt-1 text-xs font-bold text-[#aeb5aa]">
              Creator feedback · {formatReviewDate(review.created_at)}
            </div>
          </div>
        </div>
        <div className="rounded-full border border-[#b8ff3d]/16 bg-[#b8ff3d]/10 px-3 py-1 text-xs font-black text-[#e7ff9a]">
          {formatScore(review.overall_score)} / 5
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-[#d8ded1]">“{review.review_text}”</p>
      <div className="mt-4 rounded-[18px] border border-white/[0.07] bg-black/22 px-3 py-2 text-xs font-bold text-[#aeb5aa]">
        {campaignTitle ? `Campaign: ${campaignTitle}` : "Completed campaign work"}
      </div>
    </article>
  );
}

export default function BrandProfilePage() {
  const params = useParams<{ id: string }>();
  const { profile: viewerProfile } = useAuth();
  const profile = useBrandProfile(params.id);
  const reviews = useProfileReviews(params.id);
  const followStats = useProfileFollowStats(params.id);
  const publicTeam = usePublicBrandTeamMembers(params.id);

  if (profile.isLoading) {
    return (
      <BrandStateCard
        description="BudCast is loading public brand details and active creator campaigns."
        title="Loading brand profile."
      />
    );
  }

  if (profile.isError) {
    return (
      <BrandStateCard
        description="BudCast could not load this public brand profile. Refresh or return to the brand directory."
        title="Brand profile could not be loaded."
      />
    );
  }

  if (!profile.data) {
    return (
      <BrandStateCard
        description="This brand profile is not public or could not be loaded."
        title="Brand not available."
      />
    );
  }

  const { brand, campaigns } = profile.data;
  const displayName = brand.company_name || brand.name || "Cannabis brand";
  const trustBadges = getTrustBadgeDescriptors({ badges: brand.badges, profileType: "brand" });
  const websiteUrl = normalizeWebsiteUrl(brand.website);
  const isOwnBrandProfile = viewerProfile?.user_type === "brand" && viewerProfile.id === brand.id;
  const socialItems: SocialPlatformItem[] = [
    { label: "Instagram", platform: "instagram", value: brand.instagram ? normalizeHandle(brand.instagram) : null },
    { label: "TikTok", platform: "tiktok", value: brand.tiktok ? normalizeHandle(brand.tiktok) : null },
    { label: "YouTube", platform: "youtube", value: brand.youtube ? normalizeHandle(brand.youtube) : null },
    { label: "Facebook", platform: "facebook", value: brand.facebook },
    { label: "LinkedIn", platform: "linkedin", value: brand.linkedin },
    { label: "X", platform: "x", value: brand.x_profile ? normalizeHandle(brand.x_profile) : null }
  ];
  const exampleItems = (brand.portfolio_image_urls ?? []).length
    ? (brand.portfolio_image_urls ?? []).slice(0, 6).map((imageUrl, index) => ({
        id: `${imageUrl}-${index}`,
        imageUrl,
        label: `Campaign example ${index + 1}`,
        type: "image" as const
      }))
    : [{ id: "brand-example-placeholder", label: "Brand kit assets not added yet", type: "image" as const }];

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-28 pt-3 text-[#fbfbf7] md:px-8 md:pb-10 md:pt-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <PublicMarketplaceHeader
          accountHref={isOwnBrandProfile ? "/dashboard" : "/brands"}
          accountLabel={isOwnBrandProfile ? "Campaigns" : "Brands"}
          signedIn
        />

        <section className="overflow-hidden rounded-[38px] border border-[#b8ff3d]/18 bg-[radial-gradient(circle_at_82%_8%,rgba(184,255,61,0.18),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] shadow-[0_28px_90px_rgba(0,0,0,0.48),0_1px_0_rgba(255,255,255,0.08)_inset]">
          <div className="relative bg-[radial-gradient(circle_at_16%_0%,rgba(184,255,61,0.18),transparent_32%),linear-gradient(135deg,#16210f,#050604_66%)] p-5 md:p-8">
            <div
              className="relative z-10 mb-5 flex min-h-[170px] items-end justify-end overflow-hidden rounded-[30px] border border-white/[0.11] bg-[radial-gradient(circle_at_84%_28%,rgba(184,255,61,0.34),transparent_20%),linear-gradient(135deg,#344422,#10180b_52%,#050604)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:min-h-[230px]"
              style={
                brand.cover_url
                  ? {
                      backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.03),rgba(0,0,0,0.58)), url(${brand.cover_url})`,
                      backgroundPosition: "center",
                      backgroundSize: "cover"
                    }
                  : undefined
              }
            >
              <span className="rounded-full border border-white/[0.14] bg-black/35 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#eef7df] backdrop-blur-xl">
                Brand cover
              </span>
            </div>
            <div className="relative z-10 grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
              <div>
              <Link
                className="inline-flex items-center gap-2 text-sm font-black text-[#c7ccc2] transition hover:text-[#fbfbf7]"
                href={isOwnBrandProfile ? "/dashboard" : "/brands"}
              >
                <ArrowLeft className="h-4 w-4" />
                {isOwnBrandProfile ? "Back to campaign control" : "Back to brands"}
              </Link>

              <div className="mt-8 flex flex-wrap items-start gap-4">
                <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-[26px] border border-white/[0.13] bg-black/45 text-xl font-black text-[#fbfbf7] shadow-[0_18px_50px_rgba(0,0,0,0.36)]">
                  {brand.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="h-full w-full object-cover" src={brand.avatar_url} />
                  ) : (
                    getInitials(displayName)
                  )}
                </div>
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-7xl">
                {displayName}
              </h1>
              <TrustBadgeRow badges={trustBadges} className="mt-5" />
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#d8ded1]">
                {brand.bio || "Brand profile details are being built out."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {viewerProfile?.user_type === "creator" ? (
                  <Link
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] px-4 py-2 text-sm font-black text-[#071007] shadow-[0_12px_28px_rgba(184,255,61,0.22),0_1px_0_rgba(255,255,255,0.22)_inset] transition hover:-translate-y-0.5 hover:brightness-110"
                    href="/creator-dashboard"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message brand
                  </Link>
                ) : null}
                <ProfileFollowButton profileId={brand.id} />
                <ProfileSafetyActions
                  blockProfileId={brand.id}
                  reportedUserId={brand.id}
                  targetId={brand.id}
                  targetType="profile"
                />
                {brand.location ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-[#d8ded1]">
                    <MapPin className="h-4 w-4 text-[#e7ff9a]" />
                    {brand.location}
                  </span>
                ) : null}
                {websiteUrl ? (
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-[#b8ff3d]/22 bg-[#b8ff3d]/10 px-4 py-2 text-sm font-bold text-[#e7ff9a] transition hover:bg-[#b8ff3d]/14"
                    href={websiteUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Globe2 className="h-4 w-4" />
                    Website
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-[#aeb5aa]">
                    <Globe2 className="h-4 w-4" />
                    Website pending
                  </span>
                )}
              </div>
            </div>

            <aside className="rounded-[32px] border border-white/[0.11] bg-black/42 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.38),0_1px_0_rgba(255,255,255,0.07)_inset] backdrop-blur-2xl">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
                <Sparkles className="h-4 w-4" />
                Trust signals
              </div>
              <MetadataStrip
                className="mt-5 grid-cols-2 border-t-0 pt-0"
                items={[
                  ...getProfileFollowStatsLabels({
                    brandFollowers: followStats.data?.brandFollowers ?? 0,
                    creatorFollowers: followStats.data?.creatorFollowers ?? 0,
                    followingCount: followStats.data?.followingCount ?? 0,
                    profileType: "brand",
                    totalFollowers: followStats.data?.totalFollowers ?? 0
                  }),
                  { label: "Review score", value: formatRating(brand.review_score, brand.review_count) },
                  { label: "Payment rate", value: formatPercent(brand.payment_rate) },
                  { label: "Completed", value: formatCompact(brand.successful_campaigns) },
                  { label: "Campaign history", value: formatCompact(brand.total_campaigns) }
                ]}
              />
            </aside>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] md:p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Social profiles</div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7] md:text-4xl">
              Verify the brand before applying
            </h2>
            <SocialPlatformGrid className="mt-5 md:grid-cols-3 xl:grid-cols-2" items={socialItems} />
          </div>
          <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] md:p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Brand kit</div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7] md:text-4xl">Assets and campaign proof</h2>
            <p className="mt-3 text-sm leading-6 text-[#c7ccc2]">
              Public brand visuals stay inside BudCast so creators can verify the brand and understand the creative standard before applying.
            </p>
            <MediaGrid className="mt-5 sm:grid-cols-3 xl:grid-cols-2" items={exampleItems} />
          </div>
        </section>

        <BrandReviewsSection
          dimensionAverages={reviews.data?.dimensionAverages}
          isLoading={reviews.isLoading}
          reviewCount={reviews.data?.reviewCount ?? brand.review_count ?? 0}
          reviews={reviews.data?.reviews ?? []}
          score={brand.review_score ?? reviews.data?.averageScore ?? null}
        />

        <PublicBrandTeamSection
          brandName={displayName}
          error={publicTeam.error}
          isLoading={publicTeam.isLoading}
          members={publicTeam.members}
          viewerProfile={viewerProfile}
        />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="grid gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Active campaigns</div>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7] md:text-4xl">
                  Creator briefs from {displayName}
                </h2>
              </div>
              <MarketplaceBadge tone="neutral">{formatCompact(campaigns.length)} active</MarketplaceBadge>
            </div>

            {campaigns.map((campaign) => (
              <CampaignFeedCard
                applyHref={`/campaigns/${campaign.id}`}
                applyLabel="Apply"
                brandAvatarUrl={brand.avatar_url}
                brandLocation={brand.location}
                brandName={displayName}
                brandBadges={brand.badges}
                brandWebsite={brand.website}
                compensationLabel={getCompensationLabel(campaign)}
                compensationValue={getCompensationValue(campaign)}
                contentTypeLabel={getPrimaryContentType(campaign)}
                detailHref={`/campaigns/${campaign.id}`}
                key={campaign.id}
                metadata={[
                  { label: "Deadline", value: formatDeadline(campaign.application_deadline) },
                  { label: "Platform", value: getPlatformTarget(campaign) },
                  {
                    label: "Spots",
                    value: `${Math.max((campaign.slots_available ?? 0) - (campaign.slots_filled ?? 0), 0)} open`
                  }
                ]}
                platformLabel={getPlatformTarget(campaign)}
                summary={campaign.short_description || campaign.description}
                title={campaign.title}
                urgencyLabel={campaign.slots_filled > 0 ? "Creators applying" : "Open"}
              />
            ))}

            {campaigns.length === 0 ? (
              <div className="rounded-[34px] border border-dashed border-white/12 bg-white/[0.025] p-8 text-center">
                <p className="text-lg font-black text-[#fbfbf7]">No active campaigns right now.</p>
                <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                  Active creator briefs will appear here when this brand publishes new opportunities.
                </p>
              </div>
            ) : null}
          </div>

          <aside className="grid gap-3 xl:sticky xl:top-6">
            <WorkQueueItem
              description="Creators can message brands after acceptance to coordinate campaign details, content details, and payment status."
              title="Campaign coordination happens in BudCast messages"
            />
            <WorkQueueItem
              description="BudCast tracks submission, review, approval, and payment/product status inside each assignment."
              title="From application to completed work"
            />
            <WorkQueueItem
              description="Brand details shown here come from the public brand profile and current active campaign data."
              title="Profile visibility for creators"
            />
            <div className="rounded-[28px] border border-white/8 bg-white/[0.035] p-4">
              <div className="flex items-center gap-2 text-sm font-black text-[#fbfbf7]">
                <MessageCircle className="h-4 w-4 text-[#e7ff9a]" />
                Brand-safe workflow
              </div>
              <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                Product campaigns require direct coordination. BudCast does not imply cannabis shipping.
              </p>
              <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#c7ccc2]">
                <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[#e7ff9a]" />
                Confirm usage rights, campaign details, and payment expectations before creating content.
              </div>
            </div>
          </aside>
        </section>
      </div>
      {isOwnBrandProfile ? (
        <BrandMobileBottomNav
          activeTab="Profile"
          avatarFallback={getInitials(displayName)}
          avatarUrl={brand.avatar_url}
          items={[
            { href: "/dashboard", label: "Campaigns" },
            { href: "/dashboard/feed", label: "Feed" },
            { href: "/dashboard/messages", label: "Messages" },
            { href: "/dashboard/review", label: "Review" },
            {
              avatarFallback: getInitials(displayName),
              avatarUrl: brand.avatar_url,
              href: "/profile",
              label: "Profile"
            }
          ]}
        />
      ) : null}
    </main>
  );
}

function normalizeHandle(handle: string) {
  return handle.startsWith("@") ? handle : `@${handle}`;
}

function formatScore(score?: number | null) {
  if (score == null) return "New";
  return score.toFixed(1);
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getReviewerName(review: ProfileReview) {
  return (
    review.reviewer?.name ||
    review.reviewer?.company_name ||
    review.reviewer?.instagram ||
    review.reviewer?.tiktok ||
    "BudCast creator"
  );
}

function getInitials(value: string) {
  const parts = value
    .replace(/@.*/, "")
    .split(/\s+/)
    .filter(Boolean);
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : value.slice(0, 2);
  return initials.toUpperCase();
}
