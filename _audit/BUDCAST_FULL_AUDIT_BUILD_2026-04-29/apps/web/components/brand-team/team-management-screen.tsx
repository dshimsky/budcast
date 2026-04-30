"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BRAND_TEAM_ROLES,
  canBrandTeamRole,
  getBrandTeamDisplayLine,
  getBrandTeamRoleLabel,
  supabase,
  useAuth,
  type BrandActivityLog,
  type BrandTeamCapability,
  type BrandTeamInvite,
  type BrandTeamInviteRole,
  type BrandTeamMember,
  type BrandTeamRole,
  type User
} from "@budcast/shared";
import { Activity, AlertCircle, Crown, MailPlus, ShieldCheck, Sparkles, UserRoundCheck, UsersRound } from "lucide-react";
import { Button } from "../ui/button";

type RuntimeBrandContext = {
  brand?: Partial<User> | null;
  brandId?: string | null;
  brand_id?: string | null;
  brandName?: string | null;
  canManageTeam?: boolean;
  capabilities?: BrandTeamCapability[] | null;
  role?: BrandTeamRole | null;
};

type ActiveMember = BrandTeamMember & {
  user?: Pick<User, "id" | "email" | "name" | "avatar_url"> | null;
  synthetic?: boolean;
};

type TeamActivity = BrandActivityLog & {
  actor?: Pick<User, "id" | "email" | "name" | "avatar_url"> | null;
};

type BrandResolution = {
  brandId: string | null;
  brandName: string;
  brandProfile: User | null;
  role: BrandTeamRole | null;
  canManageTeam: boolean;
  loading: boolean;
  error: string | null;
};

const INVITE_ROLES = BRAND_TEAM_ROLES.filter((role) => role !== "owner") as BrandTeamInviteRole[];

const CAPABILITY_COPY: Record<BrandTeamCapability, string> = {
  confirm_payment_product: "Confirm payment and product handoffs",
  manage_brand_profile: "Edit brand identity and setup",
  manage_campaigns: "Create and update campaign briefs",
  manage_team: "Invite and administer teammates",
  message_creators: "Message creators from the brand",
  review_applicants: "Review creator applications",
  review_submissions: "Approve submitted content",
  view_brand_activity: "View brand activity and queues"
};

function getRuntimeBrandContext(auth: ReturnType<typeof useAuth>) {
  return (auth as ReturnType<typeof useAuth> & { brandContext?: RuntimeBrandContext | null }).brandContext ?? null;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function getInitials(value: string) {
  const base = value.replace(/@.*/, "").trim() || "BC";
  return base
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function roleCapabilities(role: BrandTeamRole) {
  return [
    "manage_team",
    "manage_campaigns",
    "review_applicants",
    "review_submissions",
    "message_creators",
    "view_brand_activity",
    "confirm_payment_product",
    "manage_brand_profile"
  ].filter((capability): capability is BrandTeamCapability => canBrandTeamRole(role, capability as BrandTeamCapability));
}

function roleTone(role: BrandTeamRole) {
  if (role === "owner") return "border-[#e7ff9a]/35 bg-[#b8ff3d]/15 text-[#e7ff9a]";
  if (role === "admin") return "border-[#d7b46a]/35 bg-[#d7b46a]/12 text-[#f0d28d]";
  return "border-white/10 bg-white/[0.045] text-[#d8ded1]";
}

function resolveCanManageTeam(context: RuntimeBrandContext | null, role: BrandTeamRole | null) {
  if (typeof context?.canManageTeam === "boolean") return context.canManageTeam;
  if (context?.capabilities?.includes("manage_team")) return true;
  return role ? canBrandTeamRole(role, "manage_team") : false;
}

function formatActivityAction(actionType: string) {
  return actionType
    .split("_")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatEntityType(entityType: string) {
  return entityType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getActivityMetadataItems(metadata: Record<string, unknown>) {
  return Object.entries(metadata)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 3)
    .map(([key, value]) => ({
      key: formatEntityType(key),
      value: typeof value === "object" ? JSON.stringify(value) : String(value)
    }));
}

export function BrandTeamManagementScreen() {
  const auth = useAuth();
  const { profile } = auth;
  const brandContext = getRuntimeBrandContext(auth);
  const [resolution, setResolution] = useState<BrandResolution>({
    brandId: null,
    brandName: "Cannabis brand",
    brandProfile: null,
    canManageTeam: false,
    error: null,
    loading: true,
    role: null
  });
  const [members, setMembers] = useState<ActiveMember[]>([]);
  const [invites, setInvites] = useState<BrandTeamInvite[]>([]);
  const [activity, setActivity] = useState<TeamActivity[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<BrandTeamInviteRole>("admin");
  const [inviteTitle, setInviteTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveBrand() {
      if (!profile) {
        setResolution((current) => ({ ...current, loading: false, error: "No profile is available." }));
        return;
      }

      const contextBrandId = brandContext?.brandId ?? brandContext?.brand_id ?? brandContext?.brand?.id ?? null;
      const contextRole = brandContext?.role ?? null;

      if (contextBrandId) {
        let brandProfile = brandContext?.brand?.id === contextBrandId ? (brandContext.brand as User) : null;

        if (!brandProfile) {
          const { data, error } = await supabase.from("users").select("*").eq("id", contextBrandId).maybeSingle();
          if (error) {
            if (!cancelled) {
              setResolution({
                brandId: contextBrandId,
                brandName: brandContext?.brandName ?? "Cannabis brand",
                brandProfile: null,
                canManageTeam: resolveCanManageTeam(brandContext, contextRole),
                error: error.message,
                loading: false,
                role: contextRole
              });
            }
            return;
          }
          brandProfile = data;
        }

        if (!cancelled) {
          const role = contextRole ?? (profile.user_type === "brand" ? "owner" : null);
          setResolution({
            brandId: contextBrandId,
            brandName:
              brandContext?.brandName ??
              brandProfile?.company_name ??
              brandProfile?.name ??
              brandProfile?.email ??
              "Cannabis brand",
            brandProfile,
            canManageTeam: resolveCanManageTeam(brandContext, role),
            error: null,
            loading: false,
            role
          });
        }
        return;
      }

      if (profile.user_type === "brand") {
        if (!cancelled) {
          setResolution({
            brandId: profile.id,
            brandName: profile.company_name || profile.name || profile.email || "Cannabis brand",
            brandProfile: profile,
            canManageTeam: true,
            error: null,
            loading: false,
            role: "owner"
          });
        }
        return;
      }

      if (profile.user_type === "brand_team") {
        const { data, error } = await supabase
          .from("brand_team_members")
          .select("*")
          .eq("user_id", profile.id)
          .eq("status", "active")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error || !data) {
          if (!cancelled) {
            setResolution({
              brandId: null,
              brandName: "Cannabis brand",
              brandProfile: null,
              canManageTeam: false,
              error: error?.message ?? "No active brand team membership was found for this account.",
              loading: false,
              role: null
            });
          }
          return;
        }

        const { data: brandProfile, error: brandError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.brand_id)
          .maybeSingle();

        if (!cancelled) {
          setResolution({
            brandId: data.brand_id,
            brandName: brandProfile?.company_name || brandProfile?.name || brandProfile?.email || "Cannabis brand",
            brandProfile: brandProfile ?? null,
            canManageTeam: canBrandTeamRole(data.role, "manage_team"),
            error: brandError?.message ?? null,
            loading: false,
            role: data.role
          });
        }
      }
    }

    setResolution((current) => ({ ...current, loading: true, error: null }));
    void resolveBrand();

    return () => {
      cancelled = true;
    };
  }, [brandContext, profile]);

  async function loadTeam(brandId: string, brandProfile: User | null) {
    setTeamLoading(true);
    setTeamError(null);

    try {
      const [
        { data: memberRows, error: membersError },
        { data: inviteRows, error: invitesError },
        { data: activityRows, error: activityError }
      ] = await Promise.all([
        supabase
          .from("brand_team_members")
          .select("*")
          .eq("brand_id", brandId)
          .eq("status", "active")
          .order("created_at", { ascending: true }),
        supabase
          .from("brand_team_invites")
          .select("*")
          .eq("brand_id", brandId)
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        supabase
          .from("brand_activity_log")
          .select("*")
          .eq("brand_id", brandId)
          .order("created_at", { ascending: false })
          .limit(6)
      ]);

      if (membersError) throw membersError;
      if (invitesError) throw invitesError;
      if (activityError) throw activityError;

      const activeRows = memberRows ?? [];
      const actorIds = (activityRows ?? [])
        .map((entry) => entry.actor_id)
        .filter((actorId): actorId is string => Boolean(actorId));
      const userIds = Array.from(new Set([...activeRows.map((member) => member.user_id), ...actorIds]));
      const { data: userRows, error: usersError } = userIds.length
        ? await supabase.from("users").select("id,email,name,avatar_url").in("id", userIds)
        : { data: [], error: null };

      if (usersError) throw usersError;

      const userById = new Map((userRows ?? []).map((user) => [user.id, user]));
      const activeMembers: ActiveMember[] = activeRows.map((member) => ({
        ...member,
        user: userById.get(member.user_id) ?? null
      }));

      if (brandProfile && !activeMembers.some((member) => member.user_id === brandProfile.id)) {
        activeMembers.unshift({
          accepted_at: brandProfile.created_at,
          brand_id: brandId,
          created_at: brandProfile.created_at,
          id: `${brandId}-owner-profile`,
          invited_by: null,
          joined_at: brandProfile.created_at,
          public_display: true,
          removed_at: null,
          role: "owner",
          status: "active",
          suspended_at: null,
          synthetic: true,
          title: "Brand Owner",
          updated_at: brandProfile.updated_at,
          user: {
            avatar_url: brandProfile.avatar_url,
            email: brandProfile.email,
            id: brandProfile.id,
            name: brandProfile.name
          },
          user_id: brandProfile.id
        });
      }

      setMembers(activeMembers);
      setInvites(inviteRows ?? []);
      setActivity(
        (activityRows ?? []).map((entry) => ({
          ...entry,
          actor: entry.actor_id ? userById.get(entry.actor_id) ?? null : null
        }))
      );
    } catch (error) {
      setTeamError(error instanceof Error ? error.message : "Unable to load brand team.");
    } finally {
      setTeamLoading(false);
    }
  }

  useEffect(() => {
    if (!resolution.brandId || resolution.loading) return;
    void loadTeam(resolution.brandId, resolution.brandProfile);
  }, [resolution.brandId, resolution.brandProfile, resolution.loading]);

  const totalTeamCount = useMemo(() => members.length + invites.length, [invites.length, members.length]);
  const canInvite = resolution.canManageTeam && Boolean(resolution.brandId);
  const inviteDisabled = !canInvite || isSubmitting || resolution.loading;

  function handleInviteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!resolution.brandId || !profile?.id || !canInvite) {
      setFormError("Your current role cannot manage this brand team.");
      return;
    }

    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setFormError("Enter a valid teammate email.");
      return;
    }

    const brandId = resolution.brandId;
    const brandProfile = resolution.brandProfile;

    setIsSubmitting(true);
    void (async () => {
      try {
        const { error } = await supabase.from("brand_team_invites").insert({
          brand_id: brandId,
          email,
          invited_by: profile.id,
          role: inviteRole,
          status: "pending",
          title: inviteTitle.trim() || null
        });

        if (error) {
          setFormError(error.message);
          return;
        }

        setInviteEmail("");
        setInviteRole("admin");
        setInviteTitle("");
        setFormSuccess(`${email} is pending for ${resolution.brandName}. No email was sent from BudCast.`);
        await loadTeam(brandId, brandProfile);
      } finally {
        setIsSubmitting(false);
      }
    })();
  }

  return (
    <div className="grid gap-5 pb-4">
      <section className="relative overflow-hidden rounded-[36px] border border-white/[0.09] bg-[radial-gradient(circle_at_16%_0%,rgba(184,255,61,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025)_44%,rgba(184,255,61,0.055))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.42)] md:p-7">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 blur-2xl" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#e7ff9a]">
              <Sparkles className="h-3.5 w-3.5" />
              Team control
            </div>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.065em] text-[#fbfbf7] md:text-7xl">
              {resolution.brandName}
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-[#c7ccc2]">
              Official brand workspace access. Teammates are shown as people working under this brand, with role-based
              capabilities kept separate from the public brand identity. Invites created here are pending access records
              only; BudCast does not send invite emails.
            </p>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[#070605]/70 p-5 shadow-[0_1px_0_rgba(255,255,255,0.07)_inset]">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#7d7068]">Team footprint</div>
            <div className="mt-3 flex items-end gap-3">
              <div className="text-6xl font-black leading-none tracking-[-0.08em] text-[#fbfbf7]">{totalTeamCount}</div>
              <div className="pb-2 text-sm font-black uppercase tracking-[0.16em] text-[#e7ff9a]">
                {members.length} active / {invites.length} pending
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-[#d8ded1]">
              <Crown className="h-4 w-4 text-[#e7ff9a]" />
              Your access: {resolution.role ? getBrandTeamRoleLabel(resolution.role) : "Read-only"}
            </div>
          </div>
        </div>
      </section>

      {resolution.error ? (
        <StatusPanel tone="warning" title="Brand context needs attention" body={resolution.error} />
      ) : null}
      {teamError ? <StatusPanel tone="warning" title="Team data could not load" body={teamError} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="grid gap-5">
          <Panel
            eyebrow="Active members"
            icon={UsersRound}
            title={teamLoading ? "Loading team members" : `${members.length} active brand ${members.length === 1 ? "member" : "members"}`}
          >
            <div className="grid gap-3">
              {members.map((member) => {
                const personName = member.user?.name || member.user?.email || "Brand teammate";
                const displayLine = getBrandTeamDisplayLine({
                  brandName: resolution.brandName,
                  role: member.role,
                  title: member.title
                });

                return (
                  <article
                    className="grid gap-4 rounded-[26px] border border-white/10 bg-[#0b0908] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                    key={member.id}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[18px] bg-[#b8ff3d]/14 text-sm font-black text-[#e7ff9a] ring-1 ring-[#b8ff3d]/18">
                        {member.user?.avatar_url ? (
                          <img alt="" className="h-full w-full object-cover" src={member.user.avatar_url} />
                        ) : (
                          getInitials(personName)
                        )}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-black tracking-[-0.03em] text-[#fbfbf7]">{personName}</h3>
                        <p className="mt-1 text-sm font-medium text-[#aeb5aa]">{displayLine}</p>
                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6e625c]">
                          Joined {formatDate(member.joined_at ?? member.accepted_at ?? member.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`w-fit rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${roleTone(member.role)}`}>
                      {getBrandTeamRoleLabel(member.role)}
                    </span>
                  </article>
                );
              })}
              {!teamLoading && members.length === 0 ? (
                <EmptyState title="No active team members yet" body="Invite teammates to branch people from this official brand workspace." />
              ) : null}
            </div>
          </Panel>

          <Panel eyebrow="Pending invites" icon={MailPlus} title={`${invites.length} pending ${invites.length === 1 ? "invite" : "invites"}`}>
            <div className="grid gap-3">
              {invites.map((invite) => (
                <article
                  className="rounded-[26px] border border-[#d7b46a]/20 bg-[#d7b46a]/[0.055] p-4"
                  key={invite.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black tracking-[-0.03em] text-[#fbfbf7]">{invite.email}</h3>
                      <p className="mt-1 text-sm text-[#c7ccc2]">
                        {getBrandTeamDisplayLine({
                          brandName: resolution.brandName,
                          role: invite.role,
                          title: invite.title
                        })}
                      </p>
                    </div>
                    <span className="rounded-full border border-[#d7b46a]/35 bg-[#d7b46a]/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#f0d28d]">
                      Pending
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[#8d7f76]">
                    <span>Role: {getBrandTeamRoleLabel(invite.role)}</span>
                    <span>Expires: {formatDate(invite.expires_at)}</span>
                    <span>Pending access only</span>
                  </div>
                </article>
              ))}
              {!teamLoading && invites.length === 0 ? (
                <EmptyState title="No pending invites" body="Create a pending invite record here, then share access instructions outside BudCast." />
              ) : null}
            </div>
          </Panel>

          <Panel eyebrow="Recent activity" icon={Activity} title={teamLoading ? "Loading activity" : "Latest brand actions"}>
            <div className="grid gap-3">
              {activity.map((entry) => {
                const actorName = entry.actor?.name || entry.actor?.email || "Brand actor";
                const metadataItems = getActivityMetadataItems(entry.metadata ?? {});

                return (
                  <article className="rounded-[26px] border border-white/10 bg-[#0b0908] p-4" key={entry.id}>
                    <div className="flex items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[16px] bg-white/[0.055] text-xs font-black text-[#e7ff9a] ring-1 ring-white/10">
                        {entry.actor?.avatar_url ? (
                          <img alt="" className="h-full w-full object-cover" src={entry.actor.avatar_url} />
                        ) : (
                          getInitials(actorName)
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black tracking-[-0.025em] text-[#fbfbf7]">
                            {formatActivityAction(entry.action_type)}
                          </h3>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#aeb5aa]">
                            {formatEntityType(entry.entity_type)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-[#aeb5aa]">
                          {actorName}
                          {entry.actor_role ? ` · ${getBrandTeamRoleLabel(entry.actor_role)}` : ""}
                        </p>
                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6e625c]">
                          {formatDateTime(entry.created_at)}
                        </p>
                      </div>
                    </div>
                    {metadataItems.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {metadataItems.map((item) => (
                          <span
                            className="rounded-full border border-white/10 bg-[#050403] px-2.5 py-1.5 text-[10px] font-bold text-[#c7ccc2]"
                            key={`${entry.id}-${item.key}`}
                          >
                            {item.key}: {item.value}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })}
              {!teamLoading && activity.length === 0 ? (
                <EmptyState
                  title="No team activity yet"
                  body="Recent campaign, application, and team actions will appear here once this brand starts using team workflows."
                />
              ) : null}
            </div>
          </Panel>
        </section>

        <aside className="grid gap-5 self-start">
          <Panel eyebrow="Invite teammate" icon={UserRoundCheck} title={canInvite ? "Create pending access" : "Read-only access"}>
            <form className="grid gap-4" onSubmit={handleInviteSubmit}>
              <p className="rounded-[20px] border border-[#d7b46a]/20 bg-[#d7b46a]/[0.055] p-3 text-sm font-medium leading-6 text-[#d8ded1]">
                This creates a pending invite record only. Share next steps with the teammate outside BudCast.
              </p>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#7d7068]">Email</span>
                <input
                  className="rounded-[18px] border border-white/10 bg-[#050403] px-4 py-3 text-sm font-bold text-[#fbfbf7] outline-none transition placeholder:text-[#6e625c] focus:border-[#b8ff3d]/45 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={inviteDisabled}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="teammate@brand.com"
                  type="email"
                  value={inviteEmail}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#7d7068]">Role</span>
                <select
                  className="rounded-[18px] border border-white/10 bg-[#050403] px-4 py-3 text-sm font-bold text-[#fbfbf7] outline-none transition focus:border-[#b8ff3d]/45 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={inviteDisabled}
                  onChange={(event) => setInviteRole(event.target.value as BrandTeamInviteRole)}
                  value={inviteRole}
                >
                  {INVITE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {getBrandTeamRoleLabel(role)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#7d7068]">Title</span>
                <input
                  className="rounded-[18px] border border-white/10 bg-[#050403] px-4 py-3 text-sm font-bold text-[#fbfbf7] outline-none transition placeholder:text-[#6e625c] focus:border-[#b8ff3d]/45 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={inviteDisabled}
                  onChange={(event) => setInviteTitle(event.target.value)}
                  placeholder="Marketing Lead"
                  type="text"
                  value={inviteTitle}
                />
              </label>
              {!canInvite ? (
                <p className="rounded-[20px] border border-white/10 bg-white/[0.04] p-3 text-sm font-medium leading-6 text-[#aeb5aa]">
                  Only owners and admins with team management capability can create pending invites.
                </p>
              ) : null}
              {formError ? <p className="text-sm font-bold text-[#ffb4a8]">{formError}</p> : null}
              {formSuccess ? <p className="text-sm font-bold text-[#e7ff9a]">{formSuccess}</p> : null}
              <Button className="w-full justify-center" disabled={inviteDisabled} type="submit">
                {isSubmitting ? "Creating invite..." : "Create pending invite"}
              </Button>
            </form>
          </Panel>

          <Panel eyebrow="Role explainer" icon={ShieldCheck} title="Capability map">
            <div className="grid gap-3">
              {BRAND_TEAM_ROLES.map((role) => (
                <article className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4" key={role}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-black text-[#fbfbf7]">{getBrandTeamRoleLabel(role)}</h3>
                    <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${roleTone(role)}`}>
                      {roleCapabilities(role).length} caps
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {roleCapabilities(role).map((capability) => (
                      <span
                        className="rounded-full border border-white/10 bg-[#050403] px-2.5 py-1.5 text-[10px] font-bold text-[#c7ccc2]"
                        key={capability}
                      >
                        {CAPABILITY_COPY[capability]}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Panel({
  children,
  eyebrow,
  icon: Icon,
  title
}: {
  children: React.ReactNode;
  eyebrow: string;
  icon: typeof UsersRound;
  title: string;
}) {
  return (
    <section className="rounded-[32px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.024))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.34)] md:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 text-[#e7ff9a]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7d7068]">{eyebrow}</div>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.045em] text-[#fbfbf7]">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.025] p-5">
      <h3 className="text-base font-black text-[#fbfbf7]">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-[#aeb5aa]">{body}</p>
    </div>
  );
}

function StatusPanel({ body, title, tone }: { body: string; title: string; tone: "warning" }) {
  const toneClass = tone === "warning" ? "border-[#ffb4a8]/25 bg-[#ffb4a8]/[0.07] text-[#ffcabf]" : "";

  return (
    <div className={`flex gap-3 rounded-[24px] border p-4 ${toneClass}`}>
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <h2 className="text-sm font-black text-[#fbfbf7]">{title}</h2>
        <p className="mt-1 text-sm font-medium leading-6">{body}</p>
      </div>
    </div>
  );
}
