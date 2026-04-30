"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import { BrandWorkspaceShell } from "../../../components/brand-workspace-shell";
import { BudCastDmInbox } from "../../../components/messaging";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";

function BrandMessagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, session, profile } = useAuth();

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
      router.replace("/creator-dashboard/messages");
    }
  }, [loading, profile, router, session]);

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing messages."
        description="BudCast is opening your brand direct messages."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Your brand profile is almost ready."
        description="Finish setup before messaging creators from BudCast."
      />
    );
  }

  return (
    <BrandWorkspaceShell>
      <BudCastDmInbox
        initialUserId={searchParams.get("user")}
        searchTargetType="creator"
        subtitle="Search creators, send DMs, and coordinate pickup, creative direction, review notes, payment timing, and content details."
        title="Messages"
      />
    </BrandWorkspaceShell>
  );
}

export default function BrandMessagesPage() {
  return (
    <Suspense
      fallback={
        <RouteTransitionScreen
          eyebrow="Opening messages"
          title="Preparing direct messages."
          description="BudCast is loading your brand inbox."
        />
      }
    >
      <BrandMessagesPageContent />
    </Suspense>
  );
}
