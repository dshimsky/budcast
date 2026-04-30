"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import { BrandTeamManagementScreen } from "../../../components/brand-team";
import { BrandWorkspaceShell } from "../../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";

export default function BrandTeamPage() {
  const router = useRouter();
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
      router.replace("/creator-dashboard");
    }
  }, [loading, profile, router, session]);

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing brand team."
        description="BudCast is checking your account before loading team roles and invites."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Your brand profile is almost ready."
        description="Finish setup before managing brand teammates."
      />
    );
  }

  return (
    <BrandWorkspaceShell>
      <BrandTeamManagementScreen />
    </BrandWorkspaceShell>
  );
}
