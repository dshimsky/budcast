"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, MessageCircle, Radio, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import {
  getBrandTeamRoleLabel,
  supabase,
  useAuth,
  type BrandTeamMember,
  type User
} from "@budcast/shared";
import { PublicMarketplaceHeader } from "../public-marketplace-entry";
import { Button } from "../ui/button";
import { ProfileSafetyActions } from "../safety/profile-safety-actions";

type PublicTeamMember = BrandTeamMember & {
  brand: Pick<User, "id" | "company_name" | "name" | "avatar_url" | "bio" | "location"> | null;
  user: Pick<User, "id" | "email" | "name" | "avatar_url" | "bio" | "location"> | null;
};

type LoadState =
  | { status: "loading"; member: null; error: null }
  | { status: "ready"; member: PublicTeamMember | null; error: null }
  | { status: "error"; member: null; error: string };

function getInitials(value: string) {
  const base = value.replace(/@.*/, "").trim() || "BC";
  return base
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getMemberName(member: PublicTeamMember) {
  return member.user?.name || member.user?.email || "Brand team member";
}

function getBrandName(brand?: PublicTeamMember["brand"]) {
  return brand?.company_name || brand?.name || "Cannabis brand";
}

function getTitleLine(member: PublicTeamMember) {
  const roleLabel = getBrandTeamRoleLabel(member.role);
  return member.title ? `${member.title} · ${roleLabel}` : roleLabel;
}

function TeamStateCard({ description, title }: { description: string; title: string }) {
  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-10 pt-3 text-[#fbfbf7] md:px-8 md:pt-5">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <PublicMarketplaceHeader accountHref="/brands" accountLabel="Brands" signedIn />
        <section className="rounded-[38px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-8 shadow-[0_28px_90px_rgba(0,0,0,0.48)]">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Brand team</div>
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

export function PublicTeamMemberProfile({ userId }: { userId: string | null | undefined }) {
  const { profile } = useAuth();
  const [state, setState] = useState<LoadState>({ error: null, member: null, status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function loadMember() {
      if (!userId) {
        setState({ error: null, member: null, status: "ready" });
        return;
      }

      setState({ error: null, member: null, status: "loading" });

      try {
        const { data: memberRow, error: memberError } = await supabase
          .from("brand_team_members")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .eq("public_display", true)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (memberError) throw memberError;

        if (!memberRow) {
          if (!cancelled) setState({ error: null, member: null, status: "ready" });
          return;
        }

        const [{ data: userRow, error: userError }, { data: brandRow, error: brandError }] = await Promise.all([
          supabase
            .from("users")
            .select("id,email,name,avatar_url,bio,location")
            .eq("id", memberRow.user_id)
            .eq("user_type", "brand_team")
            .maybeSingle(),
          supabase
            .from("users")
            .select("id,company_name,name,avatar_url,bio,location")
            .eq("id", memberRow.brand_id)
            .eq("user_type", "brand")
            .eq("account_status", "active")
            .maybeSingle()
        ]);

        if (userError) throw userError;
        if (brandError) throw brandError;

        if (!cancelled) {
          setState({
            error: null,
            member: {
              ...(memberRow as BrandTeamMember),
              brand: brandRow ?? null,
              user: userRow ?? null
            },
            status: "ready"
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            error: error instanceof Error ? error.message : "Unable to load this team profile.",
            member: null,
            status: "error"
          });
        }
      }
    }

    void loadMember();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (state.status === "loading") {
    return <TeamStateCard description="BudCast is loading this public brand team profile." title="Loading team profile." />;
  }

  if (state.status === "error") {
    return <TeamStateCard description={state.error} title="Team profile could not be loaded." />;
  }

  if (!state.member) {
    return (
      <TeamStateCard
        description="This brand team member is not public, is no longer active, or could not be found."
        title="Team member not available."
      />
    );
  }

  const member = state.member;
  const memberName = getMemberName(member);
  const brandName = getBrandName(member.brand);
  const titleLine = getTitleLine(member);
  const canMessage = profile?.user_type === "creator" && profile.id !== member.user_id;

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-28 pt-3 text-[#fbfbf7] md:px-8 md:pb-10 md:pt-5">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <PublicMarketplaceHeader accountHref="/brands" accountLabel="Brands" signedIn />

        <section className="overflow-hidden rounded-[38px] border border-[#b8ff3d]/18 bg-[radial-gradient(circle_at_82%_8%,rgba(184,255,61,0.18),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] shadow-[0_28px_90px_rgba(0,0,0,0.48),0_1px_0_rgba(255,255,255,0.08)_inset]">
          <div className="bg-[radial-gradient(circle_at_18%_0%,rgba(184,255,61,0.18),transparent_32%),linear-gradient(135deg,#15210f,#050604_66%)] p-5 md:p-8">
            <Link className="inline-flex items-center gap-2 text-sm font-black text-[#c7ccc2] transition hover:text-[#fbfbf7]" href="/brands">
              <ArrowLeft className="h-4 w-4" />
              Back to brands
            </Link>

            <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
              <div>
                <div className="flex flex-wrap items-start gap-4">
                  <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-[30px] border border-white/[0.13] bg-black/45 text-2xl font-black text-[#fbfbf7] shadow-[0_18px_50px_rgba(0,0,0,0.36)]">
                    {member.user?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" className="h-full w-full object-cover" src={member.user.avatar_url} />
                    ) : (
                      getInitials(memberName)
                    )}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-[#b8ff3d]/24 bg-[#b8ff3d]/12 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">
                    <BadgeCheck className="h-4 w-4" />
                    Verified brand team
                  </div>
                </div>

                <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-7xl">
                  {memberName}
                </h1>
                <p className="mt-4 text-lg font-black text-[#e7ff9a]">{titleLine}</p>
                <p className="mt-4 max-w-3xl text-base leading-8 text-[#d8ded1]">
                  {member.user?.bio ||
                    `${memberName} is a public brand-side contact for ${brandName}, helping creators understand campaign expectations and coordination.`}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {canMessage ? (
                    <Link
                      className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] px-4 py-2 text-sm font-black text-[#071007] shadow-[0_12px_28px_rgba(184,255,61,0.22),0_1px_0_rgba(255,255,255,0.22)_inset] transition hover:-translate-y-0.5 hover:brightness-110"
                      href={`/creator-dashboard/messages?user=${member.user_id}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message {memberName.split(" ")[0] || "team"}
                    </Link>
                  ) : null}
                  <Link
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-[#d8ded1] transition hover:bg-white/[0.07]"
                    href={`/brands/${member.brand_id}`}
                  >
                    <BriefcaseBusiness className="h-4 w-4 text-[#e7ff9a]" />
                    View brand profile
                  </Link>
                  <ProfileSafetyActions
                    blockProfileId={member.user_id}
                    reportedUserId={member.user_id}
                    targetId={member.user_id}
                    targetType="profile"
                  />
                </div>
              </div>

              <aside className="rounded-[32px] border border-white/[0.11] bg-black/42 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.38),0_1px_0_rgba(255,255,255,0.07)_inset] backdrop-blur-2xl">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
                  <ShieldCheck className="h-4 w-4" />
                  Parent brand
                </div>
                <Link
                  className="mt-5 flex items-center gap-3 rounded-[24px] border border-white/[0.09] bg-white/[0.04] p-4 transition hover:border-[#b8ff3d]/24 hover:bg-[#b8ff3d]/8"
                  href={`/brands/${member.brand_id}`}
                >
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[18px] border border-white/[0.1] bg-black/32 text-sm font-black text-[#fbfbf7]">
                    {member.brand?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" className="h-full w-full object-cover" src={member.brand.avatar_url} />
                    ) : (
                      getInitials(brandName)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-base font-black text-[#fbfbf7]">{brandName}</div>
                    <div className="mt-1 text-xs font-bold text-[#aeb5aa]">{member.brand?.location || "BudCast brand profile"}</div>
                  </div>
                </Link>
              </aside>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
              <Radio className="h-4 w-4" />
              Recent activity
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7]">Public updates coming soon</h2>
            <p className="mt-3 text-sm leading-6 text-[#c7ccc2]">
              Recent public posts, campaign notes, and creator-facing updates will appear here when available.
            </p>
          </div>
          <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
              <UsersRound className="h-4 w-4" />
              Managed areas
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7]">Campaign responsibility</h2>
            <p className="mt-3 text-sm leading-6 text-[#c7ccc2]">
              BudCast will show managed campaign areas here as brand team workflows become public.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-[#d8ded1]">
              <Sparkles className="h-3.5 w-3.5 text-[#e7ff9a]" />
              {getBrandTeamRoleLabel(member.role)}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
