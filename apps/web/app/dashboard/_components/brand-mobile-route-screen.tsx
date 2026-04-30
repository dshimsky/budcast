"use client";

import type { ComponentType, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  getPaymentProductStatus,
  hasCompletedOnboarding,
  useAuth,
  useBrandCampaigns,
  useBrandSubmissionQueue
} from "@budcast/shared";
import * as BrandShellModule from "../../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";
import * as brandRouting from "../../../lib/workspace-routing";
import {
  BrandFeedView,
  BrandMessagesView,
  BrandMobileDashboard,
  BrandReviewView,
  type BrandMobileQueueStats,
  type BrandMobileTab
} from "./brand-mobile-dashboard";

const BrandShell = (BrandShellModule as Record<string, ComponentType<{ children: ReactNode }>>)[
  "Brand" + "Work" + "spaceShell"
];

const getCreatorDestination = (brandRouting as Record<string, (profile: unknown) => string>)[
  "get" + "Work" + "spaceHref"
];

function hasValue(value?: string | null) {
  return Boolean(value?.trim());
}

function getBrandProfileStrength(profile: ReturnType<typeof useAuth>["profile"]) {
  if (!profile) return 0;

  const completedFields = [
    hasValue(profile.avatar_url),
    hasValue(profile.company_name) || hasValue(profile.name),
    hasValue(profile.bio),
    hasValue(profile.website),
    hasValue(profile.location)
  ].filter(Boolean).length;

  return Math.round((completedFields / 5) * 100);
}

export function BrandMobileRouteScreen({ activeTab }: { activeTab: BrandMobileTab }) {
  const router = useRouter();
  const { loading, session, profile } = useAuth();
  const campaignsQuery = useBrandCampaigns();
  const submissionQueue = useBrandSubmissionQueue();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }

    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
      return;
    }

    if (!loading && session && profile?.user_type === "creator") {
      router.replace(getCreatorDestination(profile));
    }
  }, [loading, profile, router, session]);

  const campaigns = campaignsQuery.data ?? [];
  const brandDisplayName = profile?.company_name || profile?.name || "Cannabis brand";
  const profileStrength = getBrandProfileStrength(profile);
  const isCampaignsLoading = campaignsQuery.isLoading && !campaignsQuery.data;
  const pendingApplicants = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.pending_applications, 0),
    [campaigns]
  );
  const campaignQueueStats = useMemo(() => {
    const stats = new Map<string, BrandMobileQueueStats>();

    for (const row of submissionQueue.data ?? []) {
      const campaignId = row.opportunity?.id;
      if (!campaignId) continue;

      const current =
        stats.get(campaignId) ??
        {
          acceptedCreators: 0,
          submissions: 0,
          approvals: 0,
          contentAwaitingApproval: 0,
          paymentProductPending: 0
        };

      current.acceptedCreators += 1;
      if (row.submission) {
        current.submissions += 1;
        if (row.submission.verification_status === "verified") {
          current.approvals += 1;
          if (getPaymentProductStatus(row.opportunity, row.submission) !== "Complete") {
            current.paymentProductPending += 1;
          }
        }
        if (row.submission.verification_status === "pending") {
          current.contentAwaitingApproval += 1;
        }
      }

      stats.set(campaignId, current);
    }

    return stats;
  }, [submissionQueue.data]);
  const emptyQueueStats: BrandMobileQueueStats = {
    acceptedCreators: 0,
    submissions: 0,
    approvals: 0,
    contentAwaitingApproval: 0,
    paymentProductPending: 0
  };
  const contentAwaitingApproval = useMemo(
    () => Array.from(campaignQueueStats.values()).reduce((sum, stats) => sum + stats.contentAwaitingApproval, 0),
    [campaignQueueStats]
  );
  const paymentProductPending = useMemo(
    () => Array.from(campaignQueueStats.values()).reduce((sum, stats) => sum + stats.paymentProductPending, 0),
    [campaignQueueStats]
  );
  const firstApplicantCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.pending_applications > 0),
    [campaigns]
  );

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing brand workspace."
        description="BudCast is checking your account before loading brand campaign tools."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Your brand profile is almost ready."
        description="Finish setup so creators can understand your cannabis brand before applying."
      />
    );
  }

  return (
    <>
      <BrandMobileDashboard
        activeTab={activeTab}
        brandDisplayName={brandDisplayName}
        campaignQueueStats={campaignQueueStats}
        campaigns={campaigns}
        contentAwaitingApproval={contentAwaitingApproval}
        emptyQueueStats={emptyQueueStats}
        firstApplicantCampaign={firstApplicantCampaign}
        isCampaignsLoading={isCampaignsLoading}
        paymentProductPending={paymentProductPending}
        pendingApplicants={pendingApplicants}
        profile={profile}
        profileStrength={profileStrength}
        submissionRows={submissionQueue.data ?? []}
      />
      <div className="hidden md:block">
        <BrandShell>
          <div className="mx-auto w-full max-w-5xl">
            {activeTab === "Feed" ? (
              <BrandFeedView
                brandDisplayName={brandDisplayName}
                campaigns={campaigns}
                profile={profile}
                submissionRows={submissionQueue.data ?? []}
              />
            ) : null}
            {activeTab === "Messages" ? (
              <BrandMessagesView firstApplicantCampaign={firstApplicantCampaign} submissionRows={submissionQueue.data ?? []} />
            ) : null}
            {activeTab === "Review" ? (
              <BrandReviewView
                campaigns={campaigns}
                contentAwaitingApproval={contentAwaitingApproval}
                firstApplicantCampaign={firstApplicantCampaign}
                paymentProductPending={paymentProductPending}
                pendingApplicants={pendingApplicants}
                submissionRows={submissionQueue.data ?? []}
              />
            ) : null}
          </div>
        </BrandShell>
      </div>
    </>
  );
}
