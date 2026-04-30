import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import type { SafetyReport, SafetyReportReasonType, SafetyReportTargetType } from "../types/database";

export type BlockProfileInput = {
  blockedId: string;
  reason?: string | null;
};

export type SafetyReportInput = {
  description?: string | null;
  metadata?: Record<string, unknown>;
  reasonType: SafetyReportReasonType;
  reportedUserId?: string | null;
  targetId?: string | null;
  targetType: SafetyReportTargetType;
};

export function useProfileBlockState(profileId: string | null | undefined) {
  const { profile } = useAuth();
  const currentUserId = profile?.id ?? null;

  return useQuery<boolean>({
    queryKey: ["profile-block-state", currentUserId, profileId],
    enabled: Boolean(currentUserId && profileId && currentUserId !== profileId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_blocks")
        .select("blocked_id")
        .eq("blocker_id", currentUserId!)
        .eq("blocked_id", profileId!)
        .maybeSingle();

      if (error) throw error;
      return Boolean(data);
    },
    staleTime: 10_000
  });
}

export function useBlockProfile() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation<void, unknown, BlockProfileInput>({
    mutationFn: async (input) => {
      if (!profile?.id) throw new Error("NOT_SIGNED_IN");
      if (profile.id === input.blockedId) throw new Error("CANNOT_BLOCK_SELF");

      const { error } = await supabase.from("profile_blocks").insert({
        blocked_id: input.blockedId,
        blocker_id: profile.id,
        reason: input.reason?.trim() || null
      });

      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile-block-state"] }),
        queryClient.invalidateQueries({ queryKey: ["feed-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["profile-follows"] }),
        queryClient.invalidateQueries({ queryKey: ["conversations"] })
      ]);
    }
  });
}

export function useUnblockProfile() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation<void, unknown, string>({
    mutationFn: async (blockedId) => {
      if (!profile?.id) throw new Error("NOT_SIGNED_IN");

      const { error } = await supabase
        .from("profile_blocks")
        .delete()
        .eq("blocker_id", profile.id)
        .eq("blocked_id", blockedId);

      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile-block-state"] }),
        queryClient.invalidateQueries({ queryKey: ["feed-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["profile-follows"] }),
        queryClient.invalidateQueries({ queryKey: ["conversations"] })
      ]);
    }
  });
}

export function useCreateSafetyReport() {
  const { profile } = useAuth();

  return useMutation<SafetyReport, unknown, SafetyReportInput>({
    mutationFn: async (input) => {
      if (!profile?.id) throw new Error("NOT_SIGNED_IN");

      const { data, error } = await supabase
        .from("safety_reports")
        .insert({
          description: input.description?.trim() || null,
          metadata: input.metadata ?? {},
          reason_type: input.reasonType,
          reported_user_id: input.reportedUserId ?? null,
          reporter_id: profile.id,
          target_id: input.targetId ?? null,
          target_type: input.targetType
        })
        .select("*")
        .single();

      if (error) throw error;
      return data as SafetyReport;
    }
  });
}
