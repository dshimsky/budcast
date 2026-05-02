"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Ban, CheckCircle2, ShieldAlert, ShieldCheck, Trash2, XCircle } from "lucide-react";
import {
  type Dispute,
  type ModerationAction,
  type ModerationReport,
  type SafetyReportStatus,
  type TalentDirectoryRow,
  hasCompletedOnboarding,
  useAdminDisputes,
  useAuth,
  useModerationReports,
  usePlatformAdminStatus,
  useResolveMarketplaceDispute,
  useTalentDirectory,
  useUpdateModerationReport,
  useVerifyCannabisTalent
} from "@budcast/shared";
import { useRouter } from "next/navigation";
import { PublicMarketplaceHeader } from "../../../components/public-marketplace-entry";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";

const statusTabs: SafetyReportStatus[] = ["open", "reviewing", "actioned", "dismissed"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function statusClass(status: SafetyReportStatus) {
  switch (status) {
    case "open":
      return "border-[#e7ff9a]/24 bg-[#b8ff3d]/10 text-[#e7ff9a]";
    case "reviewing":
      return "border-[#d7b46a]/30 bg-[#d7b46a]/12 text-[#f0d28d]";
    case "actioned":
      return "border-emerald-300/24 bg-emerald-300/10 text-emerald-100";
    case "dismissed":
      return "border-white/[0.08] bg-white/[0.035] text-[#aeb5aa]";
  }
}

function statusLabel(status: SafetyReportStatus) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatStatusText(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function getReportTitle(report: ModerationReport) {
  return `${report.target_type.replace("_", " ")} · ${report.reason_type.replace("_", " ")}`;
}

function getPaymentProductFlags(report: ModerationReport) {
  const metadata = report.metadata ?? {};
  return {
    paymentIssue:
      report.payment_issue_flag ||
      report.reason_type === "payment_issue" ||
      metadata.payment_issue_flag === true,
    productNotReceived:
      report.product_not_received_flag ||
      report.reason_type === "product_not_received" ||
      metadata.product_not_received_flag === true
  };
}

function ModerationReportCard({ report }: { report: ModerationReport }) {
  const updateReport = useUpdateModerationReport();
  const [note, setNote] = useState(report.resolution_note ?? "");
  const flags = getPaymentProductFlags(report);
  const canRemoveContent = report.target_type === "review" || report.target_type === "feed_post" || report.target_type === "campaign";
  const canSuspendProfile = Boolean(report.reported_user_id || (report.target_type === "profile" && report.target_id));

  function update(
    status: Extract<SafetyReportStatus, "reviewing" | "actioned" | "dismissed">,
    action: ModerationAction = "status_only"
  ) {
    updateReport.mutate({
      action,
      reportId: report.id,
      resolutionNote: note,
      status
    });
  }

  return (
    <article className="rounded-[30px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_42%),#0c0907] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.36),0_1px_0_rgba(255,255,255,0.04)_inset]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8f8177]">{formatDate(report.created_at)}</div>
          <h2 className="mt-2 text-2xl font-black capitalize tracking-[-0.045em] text-[#fbfbf7]">{getReportTitle(report)}</h2>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] ${statusClass(report.status)}`}>
          {statusLabel(report.status)}
        </span>
      </div>

      {flags.paymentIssue || flags.productNotReceived ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {flags.paymentIssue ? (
            <span className="rounded-full border border-[#d7b46a]/30 bg-[#d7b46a]/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#f0d28d]">
              Payment dispute
            </span>
          ) : null}
          {flags.productNotReceived ? (
            <span className="rounded-full border border-[#ff8a65]/30 bg-[#ff8a65]/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#ffb199]">
              Product not received
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-[#c7ccc2] md:grid-cols-2">
        <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#83766e]">Target</div>
          <div className="mt-1 break-all text-[#fbfbf7]">{report.target_id ?? "No target id"}</div>
        </div>
        <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#83766e]">Reported user</div>
          <div className="mt-1 break-all text-[#fbfbf7]">{report.reported_user_id ?? "Not attached"}</div>
        </div>
      </div>

      {report.description ? (
        <p className="mt-4 rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-3 text-sm font-semibold leading-6 text-[#d8ded1]">
          {report.description}
        </p>
      ) : null}

      <label className="mt-4 block">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8f8177]">Resolution note</span>
        <textarea
          className="mt-2 min-h-20 w-full resize-none rounded-[22px] border border-white/[0.08] bg-black/25 px-4 py-3 text-sm font-semibold leading-6 text-[#fbfbf7] outline-none placeholder:text-[#7f7168] focus:border-[#b8ff3d]/24"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add moderator notes before actioning or dismissing."
          value={note}
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d7b46a]/22 bg-[#d7b46a]/10 px-4 text-xs font-black text-[#f0d28d] transition hover:bg-[#d7b46a]/14 disabled:opacity-50"
          disabled={updateReport.isPending}
          onClick={() => update("reviewing")}
          type="button"
        >
          <ShieldAlert className="h-4 w-4" />
          Mark reviewing
        </button>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] px-4 text-xs font-black text-[#071007] shadow-[0_12px_28px_rgba(184,255,61,0.2)] transition hover:brightness-110 disabled:opacity-50"
          disabled={updateReport.isPending}
          onClick={() => update("actioned")}
          type="button"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark actioned
        </button>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 text-xs font-black text-[#c7ccc2] transition hover:bg-white/[0.055] disabled:opacity-50"
          disabled={updateReport.isPending}
          onClick={() => update("dismissed")}
          type="button"
        >
          <XCircle className="h-4 w-4" />
          Dismiss
        </button>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ff8a65]/24 bg-[#ff8a65]/10 px-4 text-xs font-black text-[#ffb199] transition hover:bg-[#ff8a65]/14 disabled:opacity-50"
          disabled={updateReport.isPending || !canRemoveContent}
          onClick={() => update("actioned", "remove_content")}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          Remove content
        </button>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ff4d6d]/24 bg-[#ff4d6d]/10 px-4 text-xs font-black text-[#ffb3c1] transition hover:bg-[#ff4d6d]/14 disabled:opacity-50"
          disabled={updateReport.isPending || !canSuspendProfile}
          onClick={() => update("actioned", "suspend_profile")}
          type="button"
        >
          <Ban className="h-4 w-4" />
          Suspend profile
        </button>
      </div>
    </article>
  );
}

function DisputeEscalationCard({ dispute }: { dispute: Dispute }) {
  const resolveDispute = useResolveMarketplaceDispute();
  const [resolution, setResolution] = useState(dispute.resolution ?? "");

  function update(status: "under_review" | "resolved" | "escalated" | "closed") {
    resolveDispute.mutate({
      disputeId: dispute.id,
      resolution,
      status
    });
  }

  return (
    <article className="rounded-[30px] border border-[#d7b46a]/22 bg-[linear-gradient(135deg,rgba(215,180,106,0.08),transparent_42%),#0c0907] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.36),0_1px_0_rgba(255,255,255,0.04)_inset]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f0d28d]">Dispute escalation</div>
          <h2 className="mt-2 text-2xl font-black capitalize tracking-[-0.045em] text-[#fbfbf7]">
            {dispute.dispute_type.replace(/_/g, " ")}
          </h2>
        </div>
        <span className="rounded-full border border-[#d7b46a]/30 bg-[#d7b46a]/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#f0d28d]">
          {formatStatusText(dispute.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-[#c7ccc2] md:grid-cols-2">
        <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#83766e]">Filed by</div>
          <div className="mt-1 break-all text-[#fbfbf7]">{dispute.filed_by}</div>
        </div>
        <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#83766e]">Filed against</div>
          <div className="mt-1 break-all text-[#fbfbf7]">{dispute.filed_against}</div>
        </div>
      </div>

      <p className="mt-4 rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-3 text-sm font-semibold leading-6 text-[#d8ded1]">
        {dispute.description}
      </p>

      <label className="mt-4 block">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8f8177]">Resolution note</span>
        <textarea
          className="mt-2 min-h-20 w-full resize-none rounded-[22px] border border-white/[0.08] bg-black/25 px-4 py-3 text-sm font-semibold leading-6 text-[#fbfbf7] outline-none placeholder:text-[#7f7168] focus:border-[#b8ff3d]/24"
          onChange={(event) => setResolution(event.target.value)}
          placeholder="Add admin dispute resolution notes."
          value={resolution}
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d7b46a]/22 bg-[#d7b46a]/10 px-4 text-xs font-black text-[#f0d28d] transition hover:bg-[#d7b46a]/14 disabled:opacity-50"
          disabled={resolveDispute.isPending}
          onClick={() => update("under_review")}
          type="button"
        >
          <ShieldAlert className="h-4 w-4" />
          Mark reviewing
        </button>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ff8a65]/24 bg-[#ff8a65]/10 px-4 text-xs font-black text-[#ffb199] transition hover:bg-[#ff8a65]/14 disabled:opacity-50"
          disabled={resolveDispute.isPending}
          onClick={() => update("escalated")}
          type="button"
        >
          Escalate dispute
        </button>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] px-4 text-xs font-black text-[#071007] shadow-[0_12px_28px_rgba(184,255,61,0.2)] transition hover:brightness-110 disabled:opacity-50"
          disabled={resolveDispute.isPending}
          onClick={() => update("resolved")}
          type="button"
        >
          <CheckCircle2 className="h-4 w-4" />
          Resolve dispute
        </button>
      </div>
    </article>
  );
}

function TalentVerificationCard({
  talent
}: {
  talent: TalentDirectoryRow;
}) {
  const verifyTalent = useVerifyCannabisTalent();
  const isCreatorVerified = talent.badges.includes("verified_creator");
  const isBudtenderVerified = talent.badges.includes("verified_budtender");

  return (
    <article className="rounded-[26px] border border-white/[0.075] bg-white/[0.035] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">Talent verification</div>
          <h3 className="mt-2 text-xl font-black text-[#fbfbf7]">{talent.name || "Creator"}</h3>
          <p className="mt-1 text-sm font-semibold text-[#c7ccc2]">
            {(talent.creator_markets ?? []).slice(0, 3).join(", ") || talent.location || "Market pending"}
          </p>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#c7ccc2]">
          {talent.creator_social_verification_status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-[#d8ded1]">
        <span className="rounded-full border border-white/[0.075] bg-black/20 px-3 py-1.5">
          Cannabis: {talent.cannabis_willingness}
        </span>
        {talent.budtender_experience ? (
          <span className="rounded-full border border-[#b8ff3d]/22 bg-[#b8ff3d]/10 px-3 py-1.5 text-[#e7ff9a]">
            Budtender
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-10 items-center rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] px-4 text-xs font-black text-[#071007] disabled:opacity-50"
          disabled={verifyTalent.isPending || isCreatorVerified}
          onClick={() => verifyTalent.mutate({ userId: talent.id, verifiedCreator: true })}
          type="button"
        >
          Verify creator
        </button>
        <button
          className="inline-flex min-h-10 items-center rounded-full border border-[#b8ff3d]/22 bg-[#b8ff3d]/10 px-4 text-xs font-black text-[#e7ff9a] disabled:opacity-50"
          disabled={verifyTalent.isPending || isBudtenderVerified || !talent.budtender_experience}
          onClick={() => verifyTalent.mutate({ userId: talent.id, verifiedBudtender: true })}
          type="button"
        >
          Verify budtender
        </button>
      </div>
    </article>
  );
}

export default function AdminModerationPage() {
  const router = useRouter();
  const { loading, session, profile } = useAuth();
  const admin = usePlatformAdminStatus();
  const disputes = useAdminDisputes();
  const reports = useModerationReports();
  const talent = useTalentDirectory();
  const [statusFilter, setStatusFilter] = useState<SafetyReportStatus>("open");

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }

    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
    }
  }, [loading, profile, router, session]);

  const filteredReports = useMemo(
    () => (reports.data ?? []).filter((report) => report.status === statusFilter),
    [reports.data, statusFilter]
  );
  const reportCounts = useMemo(
    () =>
      statusTabs.map((status) => ({
        count: (reports.data ?? []).filter((report) => report.status === status).length,
        label: status === "open" ? "Open reports" : `${statusLabel(status)} reports`,
        status
      })),
    [reports.data]
  );

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing moderation."
        description="BudCast is validating your account before loading report review."
      />
    );
  }

  if (admin.isLoading) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking access"
        title="Verifying platform admin status."
        description="Moderation tools are only available to BudCast platform admins."
      />
    );
  }

  if (!admin.data) {
    return (
      <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-10 pt-3 text-[#fbfbf7] md:px-8 md:pt-5">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
          <PublicMarketplaceHeader accountHref="/" accountLabel="BudCast" signedIn />
          <section className="rounded-[38px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-8 shadow-[0_28px_90px_rgba(0,0,0,0.48)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ff9a]/18 bg-[#b8ff3d]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e7ff9a]">
              <ShieldCheck className="h-4 w-4" />
              Restricted
            </div>
            <h1 className="mt-5 text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-6xl">
              Platform admin access required.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
              This page is for BudCast safety review. Your account is signed in, but it is not listed as an active platform admin.
            </p>
            <Link className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-[#fbfbf7]" href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to BudCast
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-10 pt-3 text-[#fbfbf7] md:px-8 md:pt-5">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <PublicMarketplaceHeader accountHref="/admin/moderation" accountLabel="Safety" signedIn />
        <section className="rounded-[38px] border border-[#b8ff3d]/18 bg-[radial-gradient(circle_at_84%_0%,rgba(184,255,61,0.16),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.48),0_1px_0_rgba(255,255,255,0.08)_inset] md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ff9a]/18 bg-[#b8ff3d]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e7ff9a]">
            <ShieldCheck className="h-4 w-4" />
            Platform safety
          </div>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-7xl">
            Moderation queue.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
            Review reports from profiles, feed posts, messages, campaigns, reviews, and conversations.
          </p>
        </section>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusTabs.map((status) => (
            <button
              className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-black capitalize transition active:scale-95 ${
                statusFilter === status
                  ? "bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_10px_24px_rgba(184,255,61,0.2)]"
                  : "border border-white/[0.075] bg-white/[0.04] text-[#c7ccc2] hover:border-[#b8ff3d]/22 hover:text-[#e7ff9a]"
              }`}
              key={status}
              onClick={() => setStatusFilter(status)}
              type="button"
            >
              {statusLabel(status)}
            </button>
          ))}
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {reportCounts.map((item) => (
            <button
              className={`rounded-[26px] border p-4 text-left transition ${
                statusFilter === item.status
                  ? "border-[#b8ff3d]/24 bg-[#b8ff3d]/10"
                  : "border-white/[0.075] bg-white/[0.035] hover:border-[#b8ff3d]/18"
              }`}
              key={item.status}
              onClick={() => setStatusFilter(item.status)}
              type="button"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8f8177]">{item.label}</div>
              <div className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7]">{item.count}</div>
            </button>
          ))}
        </section>

        {reports.isLoading ? (
          <div className="rounded-[28px] border border-white/[0.075] bg-white/[0.035] p-5 text-sm font-black text-[#c7ccc2]">
            Loading safety reports...
          </div>
        ) : null}

        {reports.isError ? (
          <div className="rounded-[28px] border border-[#d7b46a]/24 bg-[#d7b46a]/10 p-5 text-sm font-black text-[#f0d28d]">
            Could not load safety reports. Confirm your platform admin row is active.
          </div>
        ) : null}

        {!reports.isLoading && !filteredReports.length ? (
          <div className="rounded-[34px] border border-white/[0.08] bg-white/[0.035] p-8 text-center shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
            <ShieldCheck className="mx-auto h-8 w-8 text-[#e7ff9a]" />
            <h2 className="mt-4 text-3xl font-black tracking-[-0.045em] text-[#fbfbf7]">No {statusLabel(statusFilter)} reports.</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-6 text-[#aeb5aa]">
              Reports submitted through profiles, feed posts, and messages will appear here for review.
            </p>
          </div>
        ) : null}

        {filteredReports.length ? (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <ModerationReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : null}

        <section className="grid gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f0d28d]">Dispute escalation</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#fbfbf7]">Open marketplace disputes.</h2>
          </div>

          {disputes.isLoading ? (
            <div className="rounded-[28px] border border-white/[0.075] bg-white/[0.035] p-5 text-sm font-black text-[#c7ccc2]">
              Loading dispute escalation queue...
            </div>
          ) : null}

          {!disputes.isLoading && !(disputes.data ?? []).length ? (
            <div className="rounded-[28px] border border-white/[0.075] bg-white/[0.035] p-5 text-sm font-black text-[#c7ccc2]">
              No open dispute escalations.
            </div>
          ) : null}

          {(disputes.data ?? []).map((dispute) => (
            <DisputeEscalationCard dispute={dispute} key={dispute.id} />
          ))}
        </section>

        <section className="grid gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Talent verification</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#fbfbf7]">Creator and budtender review.</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {(talent.data ?? []).slice(0, 8).map((row) => (
              <TalentVerificationCard key={row.id} talent={row} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
