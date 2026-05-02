"use client";

import { useState } from "react";
import {
  type SafetyReportReasonType,
  type SafetyReportTargetType,
  useAuth,
  useBlockProfile,
  useCreateSafetyReport,
  useProfileBlockState,
  useUnblockProfile
} from "@budcast/shared";

type ProfileSafetyActionsProps = {
  blockProfileId?: string | null;
  className?: string;
  compact?: boolean;
  reportLabel?: string;
  reportedUserId?: string | null;
  targetId?: string | null;
  targetType: SafetyReportTargetType;
};

function getReportReason(targetType: SafetyReportTargetType): SafetyReportReasonType {
  if (targetType === "message" || targetType === "conversation") return "harassment";
  if (targetType === "campaign") return "misrepresentation";
  if (targetType === "review") return "unsafe_content";
  return "other";
}

export function ProfileSafetyActions({
  blockProfileId,
  className,
  compact = false,
  reportLabel = "Report",
  reportedUserId,
  targetId,
  targetType
}: ProfileSafetyActionsProps) {
  const { profile } = useAuth();
  const blockState = useProfileBlockState(blockProfileId);
  const blockProfile = useBlockProfile();
  const unblockProfile = useUnblockProfile();
  const createReport = useCreateSafetyReport();
  const [feedback, setFeedback] = useState<string | null>(null);

  const canBlock = Boolean(profile?.id && blockProfileId && profile.id !== blockProfileId);
  const canReport = Boolean(profile?.id && (targetId || reportedUserId));
  const isBlocked = Boolean(blockState.data);
  const isBusy = blockProfile.isPending || unblockProfile.isPending || createReport.isPending;

  async function handleReport() {
    if (!canReport) return;

    setFeedback(null);
    try {
      await createReport.mutateAsync({
        reasonType: getReportReason(targetType),
        reportedUserId: reportedUserId ?? blockProfileId ?? null,
        targetId: targetId ?? reportedUserId ?? null,
        targetType
      });
      setFeedback("Report sent");
    } catch {
      setFeedback("Report failed");
    }
  }

  async function handleBlockToggle() {
    if (!canBlock || !blockProfileId) return;

    setFeedback(null);
    try {
      if (isBlocked) {
        await unblockProfile.mutateAsync(blockProfileId);
        setFeedback("Unblocked");
      } else {
        const confirmed = window.confirm("Block this profile? They will not be able to follow or message you.");
        if (!confirmed) return;
        await blockProfile.mutateAsync({ blockedId: blockProfileId });
        setFeedback("Blocked");
      }
    } catch {
      setFeedback(isBlocked ? "Unblock failed" : "Block failed");
    }
  }

  if (!canReport && !canBlock) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {canReport ? (
        <button
          className={`rounded-full border border-white/[0.08] bg-white/[0.035] font-black text-[#aeb5aa] transition hover:border-[#b8ff3d]/20 hover:text-[#e7ff9a] disabled:opacity-50 ${
            compact ? "px-2.5 py-1.5 text-[10px]" : "px-3.5 py-2 text-xs"
          }`}
          disabled={isBusy}
          onClick={handleReport}
          type="button"
        >
          {createReport.isPending ? "Sending" : reportLabel}
        </button>
      ) : null}
      {canBlock ? (
        <button
          className={`rounded-full border font-black transition disabled:opacity-50 ${
            isBlocked
              ? "border-[#b8ff3d]/24 bg-[#b8ff3d]/10 text-[#e7ff9a] hover:bg-[#b8ff3d]/14"
              : "border-white/[0.08] bg-white/[0.035] text-[#aeb5aa] hover:border-[#b8ff3d]/20 hover:text-[#e7ff9a]"
          } ${compact ? "px-2.5 py-1.5 text-[10px]" : "px-3.5 py-2 text-xs"}`}
          disabled={isBusy || blockState.isLoading}
          onClick={handleBlockToggle}
          type="button"
        >
          {blockProfile.isPending || unblockProfile.isPending ? "Updating" : isBlocked ? "Unblock" : "Block"}
        </button>
      ) : null}
      {feedback ? <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#e7ff9a]">{feedback}</span> : null}
    </div>
  );
}
