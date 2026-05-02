"use client";

import Link from "next/link";
import { hasCompletedOnboarding, useAuth, useContentLibrary } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, LibraryBig } from "lucide-react";
import { BrandWorkspaceShell } from "../../../components/brand-workspace-shell";
import { ContentLibraryPanel } from "../../../components/content-library/content-library-panel";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";
import { Button } from "../../../components/ui/button";
import { Eyebrow } from "../../../components/ui/eyebrow";

export default function BrandContentLibraryPage() {
  const router = useRouter();
  const { brandContext, loading, session, profile } = useAuth();
  const library = useContentLibrary();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }
    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
      return;
    }
    if (!loading && profile?.user_type && !brandContext) {
      router.replace("/dashboard");
    }
  }, [brandContext, loading, profile, router, session]);

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing the content library."
        description="BudCast is validating your session before opening approved campaign assets."
        primaryAction={{ href: "/sign-in", label: "Sign in" }}
        secondaryAction={{ href: "/", label: "Back to BudCast" }}
      />
    );
  }

  if (!brandContext) {
    return (
      <RouteTransitionScreen
        eyebrow="Brand only"
        title="The content library is for cannabis brand teams."
        description="Creators submit content from the mobile app; brands use this vault to track approved assets and usage rights."
        primaryAction={{ href: "/dashboard", label: "Campaign control" }}
        secondaryAction={{ href: "/sign-in", label: "Switch account" }}
      />
    );
  }

  return (
    <BrandWorkspaceShell>
      <div className="flex flex-col gap-6">
        <section className="rounded-[30px] border border-white/[0.075] bg-[radial-gradient(circle_at_86%_0%,rgba(184,255,61,0.14),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.024))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34),0_1px_0_rgba(255,255,255,0.05)_inset] md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <Eyebrow className="text-[#e7ff9a]">Content library</Eyebrow>
              <h1 className="mt-3 text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-6xl">
                Rights vault for approved assets.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#d8ded1]">
                Filter creator content by Usage terms, Creator, Campaign, Market, Product category, and Platform before reuse.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Campaign control
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/campaigns/new">
                  <LibraryBig className="mr-2 h-4 w-4" />
                  New campaign
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <ContentLibraryPanel error={library.error} loading={library.isLoading} rows={library.data ?? []} />
      </div>
    </BrandWorkspaceShell>
  );
}
