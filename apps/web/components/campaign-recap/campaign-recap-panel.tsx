"use client";

import { AlertCircle, BarChart3, CopyPlus, ExternalLink, HeartHandshake, Loader2, LockKeyhole, Sparkles, UsersRound } from "lucide-react";
import { Button } from "../ui/button";

export type CampaignRecapPanelCreator = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  location: string | null;
  review_score: number | null;
  completion_rate: number | null;
  creator_availability: string | null;
};

export type CampaignRecapPanelData = {
  title?: string | null;
  usableAssets: Array<{
    id?: string | null;
    creatorName?: string | null;
    postType?: string | null;
    postUrl?: string | null;
    title?: string | null;
    status?: string | null;
  }>;
  applicationConversion: number | null;
  applicationsCount: number | null;
  acceptedCount: number | null;
  completionRate: number | null;
  completedCount: number | null;
  disputeRate: number | null;
  disputeCount: number | null;
  reviewScore: number | null;
  reviewCount: number | null;
  marketFeedback: {
    summary?: string | null;
    highlights: string[];
    concerns: string[];
  };
  postUrls: Array<{ url: string }>;
  engagement: {
    views?: number | null;
    reach?: number | null;
    likes?: number | null;
    engagementRate?: number | null;
  } | null;
  repeatCreators: CampaignRecapPanelCreator[];
};

export type CampaignRecapPanelProps = {
  recap: CampaignRecapPanelData | null | undefined;
  loading?: boolean;
  error?: Error | string | null;
  duplicateCampaignDisabled?: boolean;
  rehireCreatorDisabled?: boolean;
  preferredCreatorPoolsEnabled?: boolean;
  privateInvitesEnabled?: boolean;
  availabilityLabel?: string | null;
  invitePendingCreatorIds?: string[];
  onDuplicateCampaign?: () => void;
  onRehireCreator?: (creator: CampaignRecapPanelCreator) => void;
  onOpenPreferredCreatorPools?: () => void;
  onCreatePrivateInvite?: () => void;
};

export function CampaignRecapPanel({
  recap,
  loading = false,
  error = null,
  duplicateCampaignDisabled = false,
  rehireCreatorDisabled = false,
  preferredCreatorPoolsEnabled = false,
  privateInvitesEnabled = false,
  availabilityLabel,
  invitePendingCreatorIds = [],
  onDuplicateCampaign,
  onRehireCreator,
  onOpenPreferredCreatorPools,
  onCreatePrivateInvite
}: CampaignRecapPanelProps) {
  const errorMessage = typeof error === "string" ? error : error?.message;
  const repeatCreators = recap?.repeatCreators ?? [];
  const marketFeedback = recap?.marketFeedback;
  const engagement = recap?.engagement;

  return (
    <section className="overflow-hidden rounded-[30px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.024))] text-[#fbfbf7] shadow-[0_24px_70px_rgba(0,0,0,0.38),0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-xl">
      <div className="border-b border-white/[0.07] bg-[linear-gradient(145deg,rgba(22,33,15,0.82),rgba(6,5,4,0.94)_70%)] p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#e7ff9a]">Campaign recap</p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#fbfbf7] md:text-4xl">
              {recap?.title ?? "Performance recap"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c7ccc2]">
              Review creator output, conversion, completion, disputes, reviews, market signal, and repeat collaboration paths in one view.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button disabled={duplicateCampaignDisabled || loading || !onDuplicateCampaign} onClick={onDuplicateCampaign} type="button" variant="secondary">
              <CopyPlus />
              Duplicate
            </Button>
            <Button disabled={!privateInvitesEnabled || loading || !onCreatePrivateInvite} onClick={onCreatePrivateInvite} type="button">
              <LockKeyhole />
              Private invite
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <StateMessage icon={<Loader2 className="h-5 w-5 animate-spin" />} title="Loading recap" body="BudCast is calculating campaign outcomes and repeat collaboration signals." />
      ) : errorMessage ? (
        <StateMessage icon={<AlertCircle className="h-5 w-5" />} title="Recap unavailable" body={errorMessage} tone="error" />
      ) : !recap ? (
        <StateMessage icon={<BarChart3 className="h-5 w-5" />} title="No recap yet" body="Recap analytics will appear once campaign activity, submissions, and reviews are available." />
      ) : (
        <div className="p-5 md:p-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="Application conversion" value={formatPercent(recap.applicationConversion)} detail={formatRatio(recap.acceptedCount, recap.applicationsCount, "accepted")} />
            <Metric label="Completion rate" value={formatPercent(recap.completionRate)} detail={formatCount(recap.completedCount, "completed creator")} />
            <Metric label="Dispute rate" value={formatPercent(recap.disputeRate)} detail={formatCount(recap.disputeCount, "dispute")} />
            <Metric label="Review score" value={formatScore(recap.reviewScore)} detail={formatCount(recap.reviewCount, "published review")} />
            <Metric label="Usable assets" value={recap.usableAssets.length} detail={formatCount(recap.postUrls.length, "live post")} />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <div className="space-y-5">
              <SectionShell icon={<Sparkles className="h-4 w-4" />} title="Usable content">
                {recap.usableAssets.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {recap.usableAssets.slice(0, 6).map((asset, index) => (
                      <div key={asset.id ?? asset.postUrl ?? index} className="rounded-[18px] border border-white/[0.07] bg-black/25 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-black text-[#fbfbf7]">{asset.title ?? asset.postType ?? "Creator asset"}</h3>
                            <p className="mt-1 truncate text-xs font-semibold text-[#aeb5aa]">{asset.creatorName ?? "Creator"} {asset.status ? `· ${asset.status}` : ""}</p>
                          </div>
                          {asset.postUrl ? (
                            <a className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#e7ff9a] transition hover:border-[#b8ff3d]/35 hover:bg-[#b8ff3d]/10" href={asset.postUrl} rel="noreferrer" target="_blank" aria-label="Open post">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyLine>No usable assets have been marked for this campaign yet.</EmptyLine>
                )}
              </SectionShell>

              <SectionShell icon={<BarChart3 className="h-4 w-4" />} title="Engagement">
                {engagement ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <SmallMetric label="Views" value={formatNumber(engagement.views)} />
                    <SmallMetric label="Reach" value={formatNumber(engagement.reach)} />
                    <SmallMetric label="Likes" value={formatNumber(engagement.likes)} />
                    <SmallMetric label="Eng. rate" value={formatPercent(engagement.engagementRate)} />
                  </div>
                ) : (
                  <EmptyLine>Engagement metrics will display when connected post performance is available.</EmptyLine>
                )}
              </SectionShell>

              <SectionShell icon={<UsersRound className="h-4 w-4" />} title="Market feedback">
                {marketFeedback?.summary || marketFeedback?.highlights.length || marketFeedback?.concerns.length ? (
                  <div className="space-y-4">
                    {marketFeedback.summary ? <p className="text-sm leading-6 text-[#d8ded1]">{marketFeedback.summary}</p> : null}
                    <FeedbackList title="Highlights" items={marketFeedback.highlights} />
                    <FeedbackList title="Concerns" items={marketFeedback.concerns} />
                  </div>
                ) : (
                  <EmptyLine>Market feedback will summarize creator notes, audience response, and store-level signal when available.</EmptyLine>
                )}
              </SectionShell>
            </div>

            <aside className="rounded-[24px] border border-white/[0.075] bg-black/25 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#e7ff9a]">Repeat workflow</p>
                  <h3 className="mt-2 text-xl font-black tracking-[-0.04em]">Bring back proven creators</h3>
                </div>
                <HeartHandshake className="h-5 w-5 text-[#e7ff9a]" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[#c7ccc2]">
                <Pill active={preferredCreatorPoolsEnabled}>Preferred pools</Pill>
                <Pill active={privateInvitesEnabled}>Private invites</Pill>
                {availabilityLabel ? <Pill active>{availabilityLabel}</Pill> : null}
              </div>

              <div className="mt-5 space-y-3">
                {repeatCreators.length ? repeatCreators.map((creator) => {
                  const pending = invitePendingCreatorIds.includes(creator.id);
                  return (
                    <div key={creator.id} className="rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={creator.name ?? "Creator"} src={creator.avatar_url} />
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-black text-[#fbfbf7]">{creator.name ?? "Creator"}</h4>
                          <p className="truncate text-xs font-semibold text-[#aeb5aa]">{creator.location ?? creator.creator_availability ?? "Availability pending"}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <SmallMetric label="Review" value={formatScore(creator.review_score)} />
                        <SmallMetric label="Complete" value={formatPercent(creator.completion_rate)} />
                      </div>
                      <Button className="mt-3 w-full" disabled={rehireCreatorDisabled || pending || !onRehireCreator} onClick={() => onRehireCreator?.(creator)} type="button" variant="secondary">
                        <HeartHandshake />
                        {pending ? "Invite pending" : "Rehire creator"}
                      </Button>
                    </div>
                  );
                }) : (
                  <EmptyLine>Repeat recommendations will appear after accepted creators complete work and availability can be checked.</EmptyLine>
                )}
              </div>

              <div className="mt-5 grid gap-2">
                <Button disabled={!preferredCreatorPoolsEnabled || !onOpenPreferredCreatorPools} onClick={onOpenPreferredCreatorPools} type="button" variant="secondary">
                  <UsersRound />
                  Preferred pools
                </Button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </section>
  );
}

function SectionShell({ children, icon, title }: { children: React.ReactNode; icon: React.ReactNode; title: string }) {
  return (
    <section className="rounded-[24px] border border-white/[0.075] bg-black/25 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="mb-4 flex items-center gap-2 text-sm font-black text-[#fbfbf7]">
        <span className="text-[#e7ff9a]">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  );
}

function Metric({ detail, label, value }: { detail: string; label: string; value: string | number }) {
  return (
    <div className="rounded-[20px] border border-white/[0.075] bg-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#aeb5aa]">{label}</p>
      <div className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">{value}</div>
      <p className="mt-1 text-xs font-semibold text-[#aeb5aa]">{detail}</p>
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.035] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#aeb5aa]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#fbfbf7]">{value}</p>
    </div>
  );
}

function StateMessage({ body, icon, title, tone = "default" }: { body: string; icon: React.ReactNode; title: string; tone?: "default" | "error" }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border ${tone === "error" ? "border-red-400/25 bg-red-500/10 text-red-200" : "border-[#b8ff3d]/25 bg-[#b8ff3d]/10 text-[#e7ff9a]"}`}>
          {icon}
        </div>
        <h3 className="mt-4 text-lg font-black tracking-[-0.03em] text-[#fbfbf7]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#aeb5aa]">{body}</p>
      </div>
    </div>
  );
}

function FeedbackList({ items, title }: { items: string[]; title: string }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#aeb5aa]">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="rounded-[14px] border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-sm leading-5 text-[#d8ded1]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pill({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span className={`rounded-full border px-3 py-1 ${active ? "border-[#b8ff3d]/25 bg-[#b8ff3d]/10 text-[#e7ff9a]" : "border-white/10 bg-white/[0.035] text-[#aeb5aa]"}`}>
      {children}
    </span>
  );
}

function Avatar({ name, src }: { name: string; src?: string | null }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "BC";

  return src ? (
    <img alt="" className="h-11 w-11 rounded-full border border-white/10 object-cover" src={src} />
  ) : (
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#b8ff3d]/10 text-sm font-black text-[#e7ff9a]">{initials}</div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[18px] border border-dashed border-white/[0.09] bg-white/[0.025] p-4 text-sm leading-6 text-[#aeb5aa]">{children}</p>;
}

function formatNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? new Intl.NumberFormat("en", { notation: value >= 10000 ? "compact" : "standard" }).format(value) : "Not set";
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Not set";
  const percent = value > 1 ? value : value * 100;
  return `${Math.round(percent)}%`;
}

function formatScore(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "Not set";
}

function formatCount(value: number | null | undefined, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) return `No ${label}s yet`;
  return `${value} ${label}${value === 1 ? "" : "s"}`;
}

function formatRatio(numerator: number | null | undefined, denominator: number | null | undefined, label: string) {
  if (typeof numerator !== "number" || typeof denominator !== "number") return "Awaiting application data";
  return `${numerator}/${denominator} ${label}`;
}
