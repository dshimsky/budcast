"use client";

import Link from "next/link";
import {
  formatCompact,
  getProfileFollowStatsLabels,
  getTrustBadgeDescriptors,
  hasCompletedOnboarding,
  useAuth,
  useProfileFollowStats,
  useProfileReviews,
  type ProfileReview,
  type ReviewDimensionKey
} from "@budcast/shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, Eye, LogOut, PencilLine, ShieldCheck, Sparkles, Star } from "lucide-react";
import { BudCastLogo } from "../../components/budcast-logo";
import { MediaGrid, type MediaGridItem } from "../../components/marketplace/media-grid";
import { MetadataStrip, type MetadataItem } from "../../components/marketplace/metadata-strip";
import { SocialPlatformGrid, type SocialPlatformItem } from "../../components/marketplace/social-platform-grid";
import { TrustBadgeRow } from "../../components/marketplace/trust-badge";
import { WorkQueueItem } from "../../components/marketplace/work-queue-item";
import { BrandMobileBottomNav } from "../../components/brand-mobile";
import { CreatorSocialShell } from "../../components/creator-social";
import { RouteTransitionScreen } from "../../components/route-transition-screen";
import { ProfileSafetyActions } from "../../components/safety/profile-safety-actions";
import { Button } from "../../components/ui/button";

type Profile = NonNullable<ReturnType<typeof useAuth>["profile"]>;
type ProfileViewProps = {
  profile: Profile;
  signOut: ReturnType<typeof useAuth>["signOut"];
};

function CreatorProfileView({ profile, signOut: _signOut }: ProfileViewProps) {
  const reviews = useProfileReviews(profile.id);
  const followStats = useProfileFollowStats(profile.id);
  const badges = profile.badges ?? [];
  const niches = profile.niches ?? [];
  const portfolioUrls = profile.portfolio_image_urls ?? [];
  const publicHandle = getPublicHandle(profile);
  const profileStrength = getProfileStrength(profile, niches, portfolioUrls);
  const portfolioItems = getPortfolioItems(portfolioUrls);
  const creatorBio =
    profile.bio ??
    "Cannabis UGC creator focused on honest product reviews, lifestyle visuals, and short-form content for premium brands.";
  const profileStats = [
    { label: "Brands", value: formatCompact(followStats.data?.brandFollowers ?? 0) },
    { label: "Creators", value: formatCompact(followStats.data?.creatorFollowers ?? 0) },
    { label: "Jobs", value: formatCompact(profile.successful_campaigns ?? 0) },
    { label: "Rating", value: profile.review_score ? profile.review_score.toFixed(1) : "New" }
  ];
  const firstPortfolioItem = portfolioItems[0];

  return (
    <section className="grid min-w-0 gap-4">
      <div className="overflow-hidden rounded-[34px] border border-[#b8ff3d]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018)),#060804] shadow-[0_28px_88px_rgba(0,0,0,0.46),0_1px_0_rgba(255,255,255,0.075)_inset]">
        <div
          className="relative min-h-[172px] overflow-hidden rounded-b-[30px] border-b border-white/[0.075] bg-[radial-gradient(circle_at_78%_20%,rgba(184,255,61,0.26),transparent_24%),linear-gradient(135deg,#1d3012,#060805_62%)]"
          style={
            profile.cover_url
              ? {
                  backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.58)), url(${profile.cover_url})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover"
                }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0_48%,rgba(184,255,61,0.08)_49%,transparent_63%)]" />
          <span className="absolute bottom-4 right-4 rounded-full border border-white/[0.14] bg-black/40 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#eef7df] backdrop-blur-xl">
            Creator cover
          </span>
        </div>

        <div className="-mt-7 px-4 pb-4">
          <div className="relative rounded-[32px] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(255,255,255,0.065),rgba(255,255,255,0.02)),rgba(5,7,4,0.94)] p-4 shadow-[0_24px_76px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.08)_inset] backdrop-blur-2xl">
            <div className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-3">
              <div className="grid h-[76px] w-[76px] shrink-0 place-items-center overflow-hidden rounded-[26px] border border-[#e7ff9a]/18 bg-[radial-gradient(circle_at_30%_22%,rgba(231,255,154,0.25),transparent_34%),linear-gradient(145deg,#243417,#090705)] text-xl font-black text-[#fbfbf7] shadow-[0_16px_45px_rgba(0,0,0,0.34)]">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" className="h-full w-full object-cover" src={profile.avatar_url} />
                ) : (
                  getInitials(profile.name ?? profile.email)
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-[2rem] font-black leading-[1.05] tracking-[-0.035em] text-[#fbfbf7]">
                  {profile.name ?? "Creator"}
                </h1>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-sm font-bold leading-5 text-[#c7ccc2]">
                  <span className="whitespace-nowrap">{publicHandle}</span>
                  <span className="whitespace-nowrap">{profile.location ?? "Location not added"}</span>
                  <span className="whitespace-nowrap">{profileStrength}% profile strength</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[15px] font-semibold leading-7 text-[#d8ded1]">{creatorBio}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {getCreatorSocialPlatformItems(profile)
                .filter((item) => item.value)
                .slice(0, 4)
                .map((item) => (
                  <ProfileSocialChip item={item} key={item.label} />
                ))}
              <TrustBadgeRow badges={getTrustBadgeDescriptors({ badges, profileType: "creator" })} limit={2} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button asChild className="justify-center">
                <Link href="/profile/edit">
                  <PencilLine className="mr-2 h-4 w-4" />
                  Customize
                </Link>
              </Button>
              <Button asChild className="justify-center" variant="secondary">
                <Link href="/profile">Public view</Link>
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-4 overflow-hidden rounded-[24px] border border-white/[0.08] bg-black/20">
              {profileStats.map((stat) => (
                <div className="border-r border-white/[0.07] px-2 py-3 text-center last:border-r-0" key={stat.label}>
                  <div className="text-xl font-black leading-none text-[#fbfbf7]">{stat.value}</div>
                  <div className="mt-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-[#83766e]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {["Posts", "Portfolio", "Reviews", "About"].map((tab, index) => (
          <span
            className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-black ${
              index === 0
                ? "bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_10px_24px_rgba(184,255,61,0.2),0_1px_0_rgba(255,255,255,0.2)_inset]"
                : "border border-white/[0.075] bg-white/[0.04] text-[#c7ccc2]"
            }`}
            key={tab}
          >
            {tab}
          </span>
        ))}
      </div>

      <ProfilePanel className="p-4">
        <div className="overflow-hidden rounded-[24px] border border-[#b8ff3d]/16 bg-[radial-gradient(circle_at_72%_24%,rgba(184,255,61,0.24),transparent_28%),linear-gradient(135deg,#2a140d,#090706_66%)]">
          {firstPortfolioItem?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="aspect-[16/10] w-full object-cover" src={firstPortfolioItem.imageUrl} />
          ) : (
            <div className="grid aspect-[16/10] place-items-center text-[#e7ff9a]">
              <Sparkles className="h-9 w-9" />
            </div>
          )}
        </div>
        <h2 className="mt-4 text-xl font-black leading-tight tracking-[-0.025em] text-[#fbfbf7]">
          {firstPortfolioItem?.label ?? "Product review reel for a premium flower drop"}
        </h2>
        <p className="mt-1 text-sm font-bold leading-5 text-[#aeb5aa]">
          Instagram Reel · UGC video · Brand approved
        </p>
      </ProfilePanel>

      <ProfilePanel className="p-4">
        <ProfileEyebrow>About</ProfileEyebrow>
        <div className="mt-4 divide-y divide-white/[0.065] border-y border-white/[0.065]">
          <ProfileRow
            label="Content specialties"
            value={niches.length ? formatList(niches) : "Add specialties so brands can judge audience fit."}
          />
          <ProfileRow
            label="Portfolio media"
            value={
              portfolioUrls.length
                ? `${portfolioUrls.length} saved item${portfolioUrls.length === 1 ? "" : "s"}`
                : "Portfolio media has not been added."
            }
          />
          <ProfileRow label="Campaign posture" value="Responsible cannabis language and brand review workflow." />
        </div>
      </ProfilePanel>

      <ProfileReviewsPanel
        dimensionAverages={reviews.data?.dimensionAverages}
        emptyCopy="Brand feedback appears here after completed campaign work. Finished assignments can unlock ratings for content quality, professionalism, and timeliness."
        isLoading={reviews.isLoading}
        mode="creator"
        reviewCount={reviews.data?.reviewCount ?? profile.review_count ?? 0}
        reviews={reviews.data?.reviews ?? []}
        score={profile.review_score ?? reviews.data?.averageScore ?? null}
        title="Reviews"
      />
    </section>
  );
}

function BrandProfileView({ profile, signOut }: ProfileViewProps) {
  const reviews = useProfileReviews(profile.id);
  const followStats = useProfileFollowStats(profile.id);
  const badges = profile.badges ?? [];
  const niches = profile.niches ?? [];
  const brandName = profile.company_name || profile.name || "Cannabis brand";
  const profileStrength = getBrandProfileStrength(profile, niches);
  const portfolioItems = getPortfolioItems(profile.portfolio_image_urls ?? []);
  const socialItems = getBrandSocialItems(profile);
  const trustItems: MetadataItem[] = [
    ...getProfileFollowStatsLabels({
      brandFollowers: followStats.data?.brandFollowers ?? 0,
      creatorFollowers: followStats.data?.creatorFollowers ?? 0,
      followingCount: followStats.data?.followingCount ?? 0,
      profileType: "brand",
      totalFollowers: followStats.data?.totalFollowers ?? 0
    }),
    { label: "Campaigns", value: formatCompact(profile.total_campaigns ?? 0) },
    { label: "Completed", value: formatCompact(profile.successful_campaigns ?? 0) },
    { label: "Payment rate", value: formatPercent(profile.payment_rate) },
    { label: "Review score", value: formatRating(profile.review_score, profile.review_count) }
  ];

  return (
    <section className="grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid gap-4 md:gap-5">
        <ProfileStudioHero
          avatarFallback={getInitials(brandName)}
          avatarUrl={profile.avatar_url}
          badges={badges}
          bio={
            profile.bio ??
            "Add a brand story that tells creators what you make, who your community is, and what kind of collaborations you value."
          }
          coverUrl={profile.cover_url}
          dashboardHref="/dashboard"
          eyebrow="Creator-facing brand page"
          metaItems={[
            profile.website ?? "Website not added",
            profile.location ?? "Location not added",
            `${profileStrength}% profile strength`
          ]}
          mode="brand"
          primaryLabel="Campaigns"
          profileStrength={profileStrength}
          publicHref={profile.id ? `/brands/${profile.id}` : undefined}
          signOut={signOut}
          socialItems={socialItems}
          title={brandName}
        />

        <ProfilePanel className="p-5 sm:p-6 md:p-7">
          <ProfileEyebrow>Trust signals</ProfileEyebrow>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7] md:text-4xl">What creators can evaluate</h2>
          <MetadataStrip className="mt-5 sm:grid-cols-4" items={trustItems} />
          <div className="mt-5 divide-y divide-white/[0.065] border-y border-white/[0.065]">
            <ProfileRow
              label="Product and category fit"
              value={niches.length ? formatList(niches) : "Add category signals so creators know whether their audience matches."}
            />
            <ProfileRow
              label="Public destination"
              value={profile.website ? `${profile.website} gives creators a place to verify the brand.` : "Add a website so creators can verify the brand before applying."}
            />
          </div>
        </ProfilePanel>

        <ProfileReviewsPanel
          emptyCopy="Creator feedback appears here after completed campaign work. Completed assignments can unlock ratings for payment speed, communication, and product or campaign experience."
          mode="brand"
          reviews={reviews.data?.reviews ?? []}
          reviewCount={reviews.data?.reviewCount ?? profile.review_count ?? 0}
          score={profile.review_score ?? reviews.data?.averageScore ?? null}
          title="Creator feedback from completed campaigns"
          isLoading={reviews.isLoading}
          dimensionAverages={reviews.data?.dimensionAverages}
        />

        {socialItems.length > 0 ? (
          <ProfilePanel className="p-5 sm:p-6 md:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <ProfileEyebrow>Social proof</ProfileEyebrow>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7] md:text-4xl">Where creators can verify the brand</h2>
              </div>
              <p className="max-w-lg text-sm leading-6 text-[#c7ccc2]">
                These links help creators decide whether a campaign feels credible before they apply.
              </p>
            </div>
            <SocialPlatformGrid className="mt-5 md:grid-cols-3" items={socialItems} />
          </ProfilePanel>
        ) : null}

        <ProfilePanel className="p-5 sm:p-6 md:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <ProfileEyebrow>Brand kit</ProfileEyebrow>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7] md:text-4xl">Reusable creator assets</h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-[#c7ccc2]">
              Store logos, product visuals, packaging shots, and approved examples creators may need when building campaign content.
            </p>
          </div>
          <MediaGrid className="mt-5 sm:grid-cols-3" items={portfolioItems} />
        </ProfilePanel>

        <ProfilePanel className="p-5 sm:p-6 md:p-7">
          <ProfileEyebrow>Creator expectations</ProfileEyebrow>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7] md:text-4xl">Collaboration basics</h2>
          <div className="mt-5 divide-y divide-white/[0.065] border-y border-white/[0.065]">
            <ProfileRow
              label="Brand story"
              value={profile.bio ? "Added" : "Add a story so creators understand brand voice and audience fit."}
            />
            <ProfileRow
              label="Category clarity"
              value={niches.length ? formatList(niches) : "Add category signals before recruiting creators."}
            />
            <ProfileRow
              label="Payment trust"
              value={profile.payment_rate == null ? "Pending campaign history" : `${Math.round(profile.payment_rate)}% payment rate`}
            />
          </div>
        </ProfilePanel>
      </div>

      <ProfileSidebar
        accountStatus={profile.account_status}
        completionHint={getBrandCompletionHint(profile, niches)}
        profileStrength={profileStrength}
        secondary={
          <>
            {profile.id ? (
              <WorkQueueItem
                actionHref={`/brands/${profile.id}`}
                actionLabel="View"
                description="Preview the page creators use to judge trust, fit, and collaboration expectations."
                title="Public brand page"
              />
            ) : null}
            <SidebarSignal
              icon={<Sparkles className="h-4 w-4 text-[#e7ff9a]" />}
              label="Creator confidence"
              value="Strong brand pages answer fit, payment, product, and review questions before creators apply."
            />
          </>
        }
      />
    </section>
  );
}

function ProfileStudioHero({
  avatarFallback,
  avatarUrl,
  badges,
  bio,
  coverUrl,
  dashboardHref,
  eyebrow,
  metaItems,
  mode,
  primaryLabel,
  profileStrength,
  publicHref,
  signOut,
  socialItems,
  title
}: {
  avatarFallback: string;
  avatarUrl?: string | null;
  badges: string[];
  bio: string;
  coverUrl?: string | null;
  dashboardHref: string;
  eyebrow: string;
  metaItems: string[];
  mode: "brand" | "creator";
  primaryLabel: string;
  profileStrength: number;
  publicHref?: string;
  signOut: ReturnType<typeof useAuth>["signOut"];
  socialItems: SocialPlatformItem[];
  title: string;
}) {
  const connectedSocials = socialItems.filter((item) => item.value).slice(0, 5);
  const trustBadges = getTrustBadgeDescriptors({ badges, profileType: mode });
  const progressCopy =
    profileStrength >= 85
      ? "Profile is ready for marketplace review."
      : mode === "brand"
        ? "Add campaign examples and social links to help creators trust the brand."
        : "Add portfolio examples and social links to improve brand review.";

  return (
    <section className="profile-studio-hero overflow-hidden rounded-[34px] border border-[#b8ff3d]/18 bg-[radial-gradient(circle_at_82%_10%,rgba(184,255,61,0.16),transparent_28%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.026))] shadow-[0_28px_90px_rgba(0,0,0,0.48),0_1px_0_rgba(255,255,255,0.08)_inset]">
      <div className="relative bg-[radial-gradient(circle_at_18%_0%,rgba(184,255,61,0.14),transparent_32%),linear-gradient(135deg,#16210f,#060705_66%)] p-4 sm:p-5 md:p-6">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#b8ff3d]/18 bg-black/25 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#e7ff9a] backdrop-blur-xl">
            {eyebrow}
          </div>
          <Link
            className="inline-flex min-h-10 items-center rounded-full border border-white/[0.11] bg-white/[0.065] px-4 text-xs font-black text-[#fbfbf7] transition hover:-translate-y-0.5 hover:border-[#b8ff3d]/32 hover:text-[#e7ff9a]"
            href={publicHref ?? "/profile"}
          >
            Preview
          </Link>
        </div>

        <div
          className="relative z-10 mt-4 flex min-h-[170px] items-end justify-end overflow-hidden rounded-[30px] border border-white/[0.11] bg-[radial-gradient(circle_at_84%_28%,rgba(184,255,61,0.34),transparent_20%),linear-gradient(135deg,#344422,#10180b_52%,#050604)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:min-h-[210px]"
          style={
            coverUrl
              ? {
                  backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.03),rgba(0,0,0,0.58)), url(${coverUrl})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover"
                }
              : undefined
          }
        >
          <span className="rounded-full border border-white/[0.14] bg-black/35 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#eef7df] backdrop-blur-xl">
            {mode === "brand" ? "Brand cover" : "Creator cover"}
          </span>
        </div>

        <div className="relative z-10 mt-4 rounded-[30px] border border-white/[0.105] bg-black/45 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.08)_inset] backdrop-blur-2xl sm:p-5">
          <div className={`flex flex-col gap-4 ${mode === "creator" ? "" : "sm:flex-row sm:items-start sm:justify-between"}`}>
            <div className="flex min-w-0 gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-[24px] border border-white/[0.13] bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(184,255,61,0.13))] text-xl font-black text-[#fbfbf7] shadow-[0_18px_50px_rgba(0,0,0,0.36)]">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
                ) : (
                  avatarFallback
                )}
              </div>
              <div className="min-w-0">
                <h1 className={`font-black text-[#fbfbf7] ${mode === "creator" ? "text-[2rem] leading-[1.08] tracking-[-0.032em]" : "truncate text-3xl leading-none tracking-[-0.05em] sm:text-4xl"}`}>
                  {title}
                </h1>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-sm font-bold leading-5 text-[#c7ccc2]">
                  {metaItems.map((item) => (
                    <span className="min-w-0 whitespace-nowrap" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d8ded1] sm:text-[15px]">{bio}</p>
              </div>
            </div>

            <div className={`rounded-[24px] border border-white/[0.08] bg-white/[0.045] p-4 ${mode === "creator" ? "" : "sm:min-w-[180px]"}`}>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#aeb5aa]">Profile strength</div>
              <div className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#fbfbf7]">{profileStrength}%</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#b8ff3d,#d7ff72)] shadow-[0_0_18px_rgba(184,255,61,0.26)]"
                  style={{ width: `${profileStrength}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {connectedSocials.length ? (
              connectedSocials.map((item) => <ProfileSocialChip item={item} key={item.label} />)
            ) : (
              <span className="rounded-full border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-xs font-black text-[#c7ccc2]">
                Add social profiles
              </span>
            )}
          </div>

          <TrustBadgeRow badges={trustBadges} className="mt-4" />

          <div className={`mt-5 grid gap-2 ${mode === "creator" ? "" : "sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]"}`}>
            <Button asChild className="justify-center">
              <Link href="/profile/edit">
                <PencilLine className="mr-2 h-4 w-4" />
                Customize profile
              </Link>
            </Button>
            <Button asChild className="justify-center" variant="secondary">
              <Link href={dashboardHref}>
                {primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {publicHref ? (
              <Button asChild className="justify-center" variant="ghost">
                <Link href={publicHref}>
                  <Eye className="mr-2 h-4 w-4" />
                  Public view
                </Link>
              </Button>
            ) : null}
            <Button className="justify-center" onClick={() => void signOut()} variant="ghost">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#aeb5aa]">{progressCopy}</p>
        </div>
      </div>
    </section>
  );
}

function ProfileSocialChip({ item }: { item: SocialPlatformItem }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.055] px-3 py-2 text-xs font-black text-[#d8ded1]">
      <span className={`h-4 w-4 rounded-md ${getPlatformSwatch(item.platform)}`} />
      {item.label}
    </span>
  );
}

function ProfileSidebar({
  accountStatus,
  completionHint,
  mobileOnly = false,
  profileStrength,
  secondary
}: {
  accountStatus: Profile["account_status"];
  completionHint: string;
  mobileOnly?: boolean;
  profileStrength: number;
  secondary: React.ReactNode;
}) {
  return (
    <aside className={`grid content-start gap-4 ${mobileOnly ? "" : "md:grid-cols-2 md:gap-5 lg:sticky lg:top-6 lg:grid-cols-1"}`}>
      <ProfilePanel className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <ProfileEyebrow>Profile strength</ProfileEyebrow>
          <span className="text-xs text-[#c7ccc2]">{accountStatus === "active" ? "Active" : "Pending review"}</span>
        </div>
        <div className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#fbfbf7]">{profileStrength}%</div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#b8ff3d,#d7ff72)] shadow-[0_0_18px_rgba(184,255,61,0.28)]" style={{ width: `${profileStrength}%` }} />
        </div>
        <p className="mt-4 text-sm leading-7 text-[#d8ded1]">{completionHint}</p>
      </ProfilePanel>

      <div className="grid gap-3">{secondary}</div>
    </aside>
  );
}

function SidebarSignal({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <ProfilePanel className="p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-black text-[#fbfbf7]">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">{value}</p>
    </ProfilePanel>
  );
}

const creatorReviewDimensions: Array<{ key: ReviewDimensionKey; label: string }> = [
  { key: "content_quality_score", label: "Content quality" },
  { key: "professionalism_score", label: "Professionalism" },
  { key: "timeliness_score", label: "Timeliness" }
];

const brandReviewDimensions: Array<{ key: ReviewDimensionKey; label: string }> = [
  { key: "payment_speed_score", label: "Payment speed" },
  { key: "communication_score", label: "Communication" },
  { key: "product_quality_score", label: "Product/campaign experience" }
];

function ProfileReviewsPanel({
  dimensionAverages,
  emptyCopy,
  isLoading,
  mode,
  reviewCount,
  reviews,
  score,
  title
}: {
  dimensionAverages?: Record<ReviewDimensionKey, number | null>;
  emptyCopy: string;
  isLoading: boolean;
  mode: "brand" | "creator";
  reviewCount: number;
  reviews: ProfileReview[];
  score: number | null;
  title: string;
}) {
  const dimensions = mode === "creator" ? creatorReviewDimensions : brandReviewDimensions;
  const writtenReviews = reviews.filter((review) => review.review_text?.trim()).slice(0, 3);

  return (
    <ProfilePanel className="overflow-hidden p-0">
      <div className="border-b border-white/[0.075] bg-[radial-gradient(circle_at_88%_0%,rgba(184,255,61,0.14),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-5 sm:p-6 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <ProfileEyebrow>Reviews</ProfileEyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7] md:text-4xl">{title}</h2>
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
          {dimensions.map((dimension) => (
            <div className="rounded-[22px] border border-white/[0.08] bg-black/28 p-4" key={dimension.key}>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7d7068]">{dimension.label}</div>
              <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                {formatScore(dimensionAverages?.[dimension.key] ?? null)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-black tracking-[-0.03em] text-[#fbfbf7]">Recent written reviews</h3>
          {isLoading ? <span className="text-xs font-bold text-[#aeb5aa]">Loading...</span> : null}
        </div>

        {writtenReviews.length ? (
          <div className="mt-4 grid gap-3">
            {writtenReviews.map((review) => (
              <ProfileReviewCard key={review.id} mode={mode} review={review} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[26px] border border-dashed border-white/[0.12] bg-white/[0.025] p-5">
            <p className="text-sm font-black text-[#fbfbf7]">{isLoading ? "Loading reviews..." : "No written reviews yet."}</p>
            <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">{emptyCopy}</p>
          </div>
        )}
      </div>
    </ProfilePanel>
  );
}

function ProfileReviewCard({ mode, review }: { mode: "brand" | "creator"; review: ProfileReview }) {
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
              {mode === "creator" ? "Brand feedback" : "Creator feedback"} · {formatReviewDate(review.created_at)}
            </div>
          </div>
        </div>
        <div className="rounded-full border border-[#b8ff3d]/16 bg-[#b8ff3d]/10 px-3 py-1 text-xs font-black text-[#e7ff9a]">
          {formatScore(review.overall_score)} / 5
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-[#d8ded1]">“{review.review_text}”</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-white/[0.07] bg-black/22 px-3 py-2 text-xs font-bold text-[#aeb5aa]">
        <span>{campaignTitle ? `Campaign: ${campaignTitle}` : "Completed campaign work"}</span>
        <ProfileSafetyActions
          blockProfileId={review.reviewer?.id}
          compact
          reportLabel="Report review"
          reportedUserId={review.reviewer?.id}
          targetId={review.id}
          targetType="review"
        />
      </div>
    </article>
  );
}

function ProfileTopBar({ dashboardHref, isCreator }: { dashboardHref: string; isCreator: boolean }) {
  return (
    <header className="premium-glass-bar flex items-center justify-between gap-4 rounded-[30px] px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <BudCastLogo className="brightness-125 contrast-[1.08]" href="/" size="md" variant="mark" />
        <div className="min-w-0">
          <div className="text-sm font-black leading-none text-[#fbfbf7]">BudCast</div>
          <div className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.22em] text-[#aeb5aa]">
            {isCreator ? "Creator profile" : "Brand profile"}
          </div>
        </div>
      </div>
      <Link
        className="inline-flex min-h-10 items-center rounded-full border border-[#e7ff9a]/12 bg-white/[0.055] px-4 text-xs font-black text-[#fbfbf7] transition hover:-translate-y-0.5 hover:border-[#b8ff3d]/35 hover:bg-[#b8ff3d]/10 hover:text-[#e7ff9a]"
        href={dashboardHref}
      >
        {isCreator ? "Mobile app" : "Campaigns"}
      </Link>
    </header>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-5">
      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7d7068]">{label}</div>
      <div className="min-w-0 text-sm leading-6 text-[#d8ded1]">{value}</div>
    </div>
  );
}

function ProfilePanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[28px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.024))] shadow-[0_24px_70px_rgba(0,0,0,0.38),0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

function ProfileEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#e7ff9a]">{children}</p>;
}

function getPublicHandle(profile: Profile) {
  return profile.instagram || profile.tiktok || profile.youtube || profile.email.split("@")[0] || "creator";
}

function hasProfileValue(value?: string | null) {
  return Boolean(value?.trim());
}

function getProfileStrength(profile: Profile, niches = profile.niches ?? [], portfolioUrls = profile.portfolio_image_urls ?? []) {
  const checks = [
    Boolean(profile.cover_url),
    Boolean(profile.avatar_url),
    Boolean(profile.bio),
    Boolean(profile.instagram),
    Boolean(profile.tiktok),
    Boolean(profile.youtube),
    Boolean(niches.length),
    Boolean(portfolioUrls.length)
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function getBrandProfileStrength(profile: Profile, niches = profile.niches ?? []) {
  const checks = [
    hasProfileValue(profile.cover_url),
    hasProfileValue(profile.avatar_url),
    hasProfileValue(profile.company_name) || hasProfileValue(profile.name),
    hasProfileValue(profile.bio),
    hasProfileValue(profile.website),
    hasProfileValue(profile.location),
    Boolean(niches.length)
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function getCompletionHint(profile: Profile, portfolioUrls = profile.portfolio_image_urls ?? []) {
  const missing = [];
  if (!profile.tiktok) missing.push("TikTok");
  if (!profile.cover_url) missing.push("a cover image");
  if (portfolioUrls.length < 2) missing.push("2 portfolio examples");
  if (!profile.bio) missing.push("a tighter bio");
  if (!missing.length) return "Profile is ready for brand review. Keep examples fresh as campaigns go live.";
  return `Add ${missing.slice(0, 2).join(" and ")} to improve campaign visibility.`;
}

function getBrandCompletionHint(profile: Profile, niches = profile.niches ?? []) {
  const missing = [];
  if (!profile.avatar_url) missing.push("a logo");
  if (!profile.cover_url) missing.push("a cover image");
  if (!profile.website) missing.push("a website");
  if (!profile.bio) missing.push("a brand story");
  if (!niches.length) missing.push("category signals");
  if (!missing.length) return "Profile is ready for creator review. Keep campaign details and expectations current.";
  return `Add ${missing.slice(0, 2).join(" and ")} so creators can evaluate opportunities faster.`;
}

function formatPercent(value?: number | null) {
  if (value == null) return "Pending";
  return `${Math.round(value)}%`;
}

function formatRating(score?: number | null, count?: number | null) {
  if (score == null) return "No reviews yet";
  return `${score.toFixed(1)} / 5${count ? ` (${formatCompact(count)})` : ""}`;
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
    review.reviewer?.company_name ||
    review.reviewer?.name ||
    review.reviewer?.instagram ||
    review.reviewer?.tiktok ||
    "BudCast member"
  );
}

function formatList(values: string[] = []) {
  return values
    .map((value) => value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()))
    .join(", ");
}

function getCreatorSocialItems(profile: Profile): MetadataItem[] {
  return [
    {
      label: "Instagram",
      value: profile.instagram ? `${normalizeHandle(profile.instagram)} · ${formatCompact(profile.follower_count_instagram)} followers` : "Not added"
    },
    {
      label: "TikTok",
      value: profile.tiktok ? `${normalizeHandle(profile.tiktok)} · ${formatCompact(profile.follower_count_tiktok)} followers` : "Not added"
    },
    {
      label: "YouTube",
      value: profile.youtube ? `${normalizeHandle(profile.youtube)} · ${formatCompact(profile.follower_count_youtube)} followers` : "Not added"
    }
  ];
}

function getCreatorSocialPlatformItems(profile: Profile): SocialPlatformItem[] {
  const items: SocialPlatformItem[] = [
    { label: "Instagram", platform: "instagram", value: profile.instagram ? normalizeHandle(profile.instagram) : null },
    { label: "TikTok", platform: "tiktok", value: profile.tiktok ? normalizeHandle(profile.tiktok) : null },
    { label: "YouTube", platform: "youtube", value: profile.youtube ? normalizeHandle(profile.youtube) : null },
    { label: "Facebook", platform: "facebook", value: profile.facebook },
    { label: "LinkedIn", platform: "linkedin", value: profile.linkedin },
    { label: "X", platform: "x", value: profile.x_profile ? normalizeHandle(profile.x_profile) : null }
  ];
  return items.filter((item) => item.value != null);
}

function getBrandSocialItems(profile: Profile): SocialPlatformItem[] {
  const items: SocialPlatformItem[] = [
    { label: "Instagram", platform: "instagram", value: profile.instagram ? normalizeHandle(profile.instagram) : null },
    { label: "TikTok", platform: "tiktok", value: profile.tiktok ? normalizeHandle(profile.tiktok) : null },
    { label: "YouTube", platform: "youtube", value: profile.youtube ? normalizeHandle(profile.youtube) : null },
    { label: "Facebook", platform: "facebook", value: profile.facebook },
    { label: "LinkedIn", platform: "linkedin", value: profile.linkedin },
    { label: "X", platform: "x", value: profile.x_profile ? normalizeHandle(profile.x_profile) : null }
  ];
  return items.filter((item) => item.value != null);
}

function getPortfolioItems(portfolioUrls: string[] = []): MediaGridItem[] {
  if (!portfolioUrls.length) {
    return [{ id: "portfolio-placeholder", label: "Add portfolio media", type: "image" }];
  }

  return portfolioUrls.slice(0, 6).map((imageUrl, index) => ({
    id: `${imageUrl}-${index}`,
    imageUrl,
    label: `Portfolio ${index + 1}`,
    type: "image"
  }));
}

function normalizeHandle(handle: string) {
  return handle.startsWith("@") ? handle : `@${handle}`;
}

function getPlatformSwatch(platform: SocialPlatformItem["platform"]) {
  switch (platform) {
    case "instagram":
      return "bg-[linear-gradient(135deg,#feda75,#d62976_55%,#4f5bd5)]";
    case "tiktok":
      return "bg-[linear-gradient(135deg,#00f2ea,#111111_48%,#ff0050)]";
    case "youtube":
      return "bg-[#ff2b20]";
    case "facebook":
      return "bg-[#1877f2]";
    case "linkedin":
      return "bg-[#0a66c2]";
    case "x":
      return "bg-[#f3f4ee]";
  }
}

function getInitials(value: string) {
  const parts = value
    .replace(/@.*/, "")
    .split(/\s+/)
    .filter(Boolean);
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : value.slice(0, 2);
  return initials.toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { loading, session, profile, signOut } = useAuth();
  const isCreator = profile?.user_type === "creator";

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }

    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
    }
  }, [loading, profile, router, session]);

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Loading your BudCast profile."
        description="BudCast is checking your account before loading your public marketplace profile."
      />
    );
  }

  if (!profile || !hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Your profile needs a few setup details."
        description="Finishing onboarding comes first so BudCast can present the right creator or brand profile."
      />
    );
  }

  if (isCreator) {
    return (
      <CreatorSocialShell
        activeTab="Profile"
        avatarFallback={getInitials(profile.name ?? profile.email)}
        avatarUrl={profile.avatar_url}
        handle={getPublicHandle(profile)}
        profileHref="/profile"
      >
        <CreatorProfileView profile={profile} signOut={signOut} />
      </CreatorSocialShell>
    );
  }

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-28 pt-4 text-[#fbfbf7] sm:px-6 sm:py-7 md:px-10">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 md:gap-5">
        <ProfileTopBar dashboardHref="/dashboard" isCreator={false} />
        <BrandProfileView profile={profile} signOut={signOut} />
      </div>
      <BrandMobileBottomNav
        activeTab="Profile"
        avatarFallback={getInitials(profile.company_name || profile.name || profile.email)}
        avatarUrl={profile.avatar_url}
        items={[
          { href: "/dashboard", label: "Campaigns" },
          { href: "/dashboard/feed", label: "Feed" },
          { href: "/dashboard/messages", label: "Messages" },
          { href: "/dashboard/review", label: "Review" },
          {
            avatarFallback: getInitials(profile.company_name || profile.name || profile.email),
            avatarUrl: profile.avatar_url,
            href: "/profile",
            label: "Profile"
          }
        ]}
      />
    </main>
  );
}
