import {
  formatCampaignType,
  formatDeadline,
  formatStatus,
  hasCompletedOnboarding,
  type ApplicationWithOpportunity,
  type SubmissionPipelineRow,
  useAuth,
  useMyApplications,
  useMySubmissionPipeline
} from "@budcast/shared";
import { router } from "expo-router";
import { useEffect, useMemo, type ReactNode } from "react";
import { Text, View } from "react-native";
import { StatusPill, Surface, TrustRow } from "../components/mobile-system";
import {
  FadeInSection,
  GlassCard,
  MetricTile,
  PremiumScroll,
  PrimaryPill,
  SecondaryPill,
  SoftCard
} from "../components/premium";

type WorkActionTone = "action" | "danger" | "premium" | "trust" | "warning";

function getBrandName(row: SubmissionPipelineRow) {
  return row.opportunity?.brand?.company_name ?? "BudCast brand";
}

function getCampaignTitle(row: SubmissionPipelineRow) {
  return row.opportunity?.title ?? "Untitled campaign";
}

function needsCreatorAction(row: SubmissionPipelineRow) {
  return (
    row.status === "disputed" ||
    row.disputes.length > 0 ||
    !row.submission ||
    row.submission.verification_status === "needs_revision" ||
    (row.submission.verification_status === "verified" && !row.submission.payment_confirmed_by_creator)
  );
}

function isCompletedWork(row: SubmissionPipelineRow) {
  return row.status === "completed" || Boolean(row.submission?.payment_confirmed_by_creator);
}

function isSubmittedWork(row: SubmissionPipelineRow) {
  return row.submission?.verification_status === "pending";
}

function getWorkAction(row: SubmissionPipelineRow): { label: string; tone: WorkActionTone } {
  if (row.status === "disputed" || row.disputes.length > 0) {
    return { label: "Review issue", tone: "danger" };
  }

  if (!row.submission || row.submission.verification_status === "needs_revision") {
    return { label: "Submit content", tone: "action" };
  }

  if (row.submission.verification_status === "verified" && !row.submission.payment_confirmed_by_creator) {
    return { label: "Payment checkpoint", tone: "warning" };
  }

  if (row.submission.verification_status === "pending") {
    return { label: "Open submissions", tone: "trust" };
  }

  return { label: "Coordinate details", tone: "premium" };
}

function getWorkSummary(row: SubmissionPipelineRow) {
  if (row.status === "disputed" || row.disputes.length > 0) {
    return "A campaign issue needs attention before this job can close cleanly.";
  }

  if (!row.submission) {
    return "You were accepted. Submit the creator link, proof, and payout method from the submissions flow.";
  }

  if (row.submission.verification_status === "needs_revision") {
    return "The brand needs a revision. Update the post link or proof so the campaign can keep moving.";
  }

  if (row.submission.verification_status === "verified" && !row.submission.payment_confirmed_by_creator) {
    return "Content is verified. Confirm payment once the brand payout or product value lands.";
  }

  if (row.submission.verification_status === "pending") {
    return "Your submission is in brand review. Keep an eye on this lane for feedback or approval.";
  }

  return "Campaign requirements are handled. Use this card to keep final brand coordination in one place.";
}

function WorkLane({
  children,
  count,
  empty,
  title
}: {
  children: ReactNode;
  count: number;
  empty: string;
  title: string;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] font-black uppercase tracking-[2px] text-budcast-muted">{title}</Text>
        <StatusPill tone={count > 0 ? "action" : "default"}>{count}</StatusPill>
      </View>
      {count > 0 ? children : (
        <Surface tone="overlay" className="px-4 py-4">
          <Text className="text-sm leading-6 text-budcast-muted">{empty}</Text>
        </Surface>
      )}
    </View>
  );
}

function WorkJobCard({ row }: { row: SubmissionPipelineRow }) {
  const action = getWorkAction(row);
  const completionDate = row.completion_deadline ?? row.opportunity?.application_deadline ?? null;

  return (
    <Surface tone="raised" className="gap-4 px-4 py-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-budcast-muted">
            {getBrandName(row)} · {row.opportunity ? formatCampaignType(row.opportunity.campaign_type) : "Campaign"}
          </Text>
          <Text className="mt-2 text-lg font-black leading-6 text-budcast-text">{getCampaignTitle(row)}</Text>
        </View>
        <StatusPill tone={action.tone}>{action.label}</StatusPill>
      </View>

      <Text className="text-sm leading-6 text-surface-200">{getWorkSummary(row)}</Text>

      <TrustRow
        items={[
          { label: formatStatus(row.status), tone: row.status === "completed" ? "success" : "trust" },
          { label: `Due ${formatDeadline(completionDate)}`, tone: "default" },
          { label: row.opportunity?.rights_confirmed ? "Rights set" : "Rights pending", tone: "premium" }
        ]}
      />

      <View className="flex-row flex-wrap gap-3">
        <PrimaryPill className="px-4 py-3" onPress={() => router.push("/submissions")}>
          {action.label}
        </PrimaryPill>
        <SecondaryPill className="px-4 py-3" onPress={() => router.push(`/campaigns/${row.opportunity_id}`)}>
          View brief
        </SecondaryPill>
      </View>
    </Surface>
  );
}

function WorkApplicationCard({ application }: { application: ApplicationWithOpportunity }) {
  const opportunity = application.opportunity;
  const isRejected = application.status === "rejected";

  return (
    <Surface tone="overlay" className="gap-4 px-4 py-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-budcast-muted">
            {opportunity?.brand?.company_name ?? "BudCast brand"} ·{" "}
            {opportunity ? formatCampaignType(opportunity.campaign_type) : "Campaign"}
          </Text>
          <Text className="mt-2 text-base font-black leading-6 text-budcast-text">
            {opportunity?.title ?? "Untitled campaign"}
          </Text>
        </View>
        <StatusPill tone={isRejected ? "danger" : "warning"}>{formatStatus(application.status)}</StatusPill>
      </View>

      <Text className="text-sm leading-6 text-budcast-muted">
        {isRejected
          ? "Not selected this round. Keep the brief handy if the brand reopens similar work."
          : "Brand reviewing. This moves into Active jobs when you are accepted."}
      </Text>

      <View className="flex-row flex-wrap gap-3">
        <SecondaryPill className="px-4 py-3" onPress={() => router.push(`/campaigns/${application.opportunity_id}`)}>
          View brief
        </SecondaryPill>
      </View>
    </Surface>
  );
}

export function ApplicationsScreen() {
  const { loading, session, profile } = useAuth();
  const applications = useMyApplications();
  const pipeline = useMySubmissionPipeline();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }
    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
    }
  }, [loading, profile, session]);

  const pipelineRows = pipeline.data ?? [];
  const applicationRows = applications.data ?? [];

  const needsActionRows = useMemo(() => pipelineRows.filter(needsCreatorAction), [pipelineRows]);
  const completedRows = useMemo(() => pipelineRows.filter(isCompletedWork), [pipelineRows]);
  const submittedRows = useMemo(
    () => pipelineRows.filter((row) => isSubmittedWork(row) && !needsCreatorAction(row) && !isCompletedWork(row)),
    [pipelineRows]
  );
  const activeRows = useMemo(
    () =>
      pipelineRows.filter(
        (row) => !needsCreatorAction(row) && !isSubmittedWork(row) && !isCompletedWork(row)
      ),
    [pipelineRows]
  );
  const pendingApplications = useMemo(
    () => applicationRows.filter((application) => application.status === "pending" || application.status === "rejected"),
    [applicationRows]
  );

  const isLoadingWork = applications.isLoading || pipeline.isLoading;
  const totalWorkCount = pipelineRows.length + pendingApplications.length;

  return (
    <PremiumScroll>
      <FadeInSection>
        <GlassCard>
          <View className="flex-row items-start justify-between gap-4">
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-medium text-budcast-text">Work</Text>
              <Text className="mt-2 text-[10px] uppercase tracking-[2px] text-budcast-muted">
                Applications, content, payment
              </Text>
              <Text className="mt-4 text-3xl font-black leading-9 text-budcast-text">
                Keep every campaign moving.
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-3xl font-black text-budcast-lime">{needsActionRows.length}</Text>
              <Text className="text-xs uppercase tracking-[2px] text-budcast-muted">actions</Text>
            </View>
          </View>

          <View className="mt-5 flex-row flex-wrap gap-3">
            <PrimaryPill className="px-4 py-3" onPress={() => router.push("/submissions")}>
              Open submissions
            </PrimaryPill>
            <SecondaryPill className="px-4 py-3" onPress={() => router.push("/store")}>
              Browse campaigns
            </SecondaryPill>
          </View>
        </GlassCard>
      </FadeInSection>

      <FadeInSection className="mt-6 flex-row gap-3" delay={60}>
        <MetricTile className="flex-1" label="Needs action" value={String(needsActionRows.length)} />
        <MetricTile className="flex-1" label="Active" value={String(activeRows.length + submittedRows.length)} />
        <MetricTile className="flex-1" label="Done" value={String(completedRows.length)} />
      </FadeInSection>

      <FadeInSection className="mt-6 gap-6 pb-8" delay={120}>
        <WorkLane count={needsActionRows.length} empty="Accepted jobs that need a link, revision, dispute reply, or payout confirmation will land here." title="Needs action">
          <View className="gap-3">
            {needsActionRows.map((row) => (
              <WorkJobCard key={row.id} row={row} />
            ))}
          </View>
        </WorkLane>

        <WorkLane count={activeRows.length + pendingApplications.length} empty="Apply to campaigns or wait for accepted briefs to start the next creator job." title="Active jobs">
          <View className="gap-3">
            {activeRows.map((row) => (
              <WorkJobCard key={row.id} row={row} />
            ))}
            {pendingApplications.map((application) => (
              <WorkApplicationCard application={application} key={application.id} />
            ))}
          </View>
        </WorkLane>

        <WorkLane count={submittedRows.length} empty="Submitted work in brand review will appear here with clear status and next steps." title="Submitted">
          <View className="gap-3">
            {submittedRows.map((row) => (
              <WorkJobCard key={row.id} row={row} />
            ))}
          </View>
        </WorkLane>

        <WorkLane count={completedRows.length} empty="Completed, paid, or archived campaign work will stack here for receipts and proof." title="Completed">
          <View className="gap-3">
            {completedRows.map((row) => (
              <WorkJobCard key={row.id} row={row} />
            ))}
          </View>
        </WorkLane>

        {isLoadingWork ? (
          <SoftCard>
            <Text className="text-base text-surface-200">Loading work...</Text>
          </SoftCard>
        ) : null}

        {!isLoadingWork && totalWorkCount === 0 ? (
          <SoftCard>
            <Text className="text-base leading-7 text-surface-300">
              No active campaign work yet. Browse cannabis brand briefs and apply to jobs that fit your audience.
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-3">
              <PrimaryPill className="px-4 py-3" onPress={() => router.push("/store")}>
                Browse opportunities
              </PrimaryPill>
            </View>
          </SoftCard>
        ) : null}
      </FadeInSection>
    </PremiumScroll>
  );
}

export default ApplicationsScreen;
