import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import type { PlatformAdmin, SafetyReport, SafetyReportStatus, User } from "../types/database";

export type ModerationReport = SafetyReport;

export type ModerationAction = "status_only" | "remove_content" | "suspend_profile";

export type UpdateModerationReportInput = {
  action?: ModerationAction;
  reportId: string;
  resolutionNote?: string | null;
  status: Extract<SafetyReportStatus, "reviewing" | "actioned" | "dismissed">;
};

export type VerifyCannabisTalentInput = {
  notes?: string | null;
  userId: string;
  verifiedBudtender?: boolean;
  verifiedCreator?: boolean;
};

export function usePlatformAdminStatus() {
  const { profile } = useAuth();

  return useQuery<PlatformAdmin | null>({
    queryKey: ["platform-admin-status", profile?.id ?? null],
    enabled: Boolean(profile?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_admins")
        .select("*")
        .eq("user_id", profile!.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return (data ?? null) as PlatformAdmin | null;
    },
    staleTime: 30_000
  });
}

export function useVerifyCannabisTalent() {
  const queryClient = useQueryClient();

  return useMutation<User, unknown, VerifyCannabisTalentInput>({
    mutationFn: async (input) => {
      const { data, error } = await supabase.rpc("verify_cannabis_talent", {
        p_notes: input.notes ?? null,
        p_user_id: input.userId,
        p_verified_budtender: input.verifiedBudtender ?? false,
        p_verified_creator: input.verifiedCreator ?? false
      });

      if (error) throw error;
      return data as User;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["talent-directory"] }),
        queryClient.invalidateQueries({ queryKey: ["profile-reviews"] }),
      ]);
    }
  });
}

export function useModerationReports() {
  const admin = usePlatformAdminStatus();

  return useQuery<ModerationReport[]>({
    queryKey: ["moderation-reports", admin.data?.user_id ?? null],
    enabled: Boolean(admin.data?.user_id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data ?? []) as ModerationReport[];
    },
    staleTime: 8_000
  });
}

export function useUpdateModerationReport() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation<SafetyReport, unknown, UpdateModerationReportInput>({
    mutationFn: async (input) => {
      if (!profile?.id) throw new Error("NOT_SIGNED_IN");

      const { data, error } = await supabase.rpc("moderate_safety_report", {
        p_action: input.action ?? "status_only",
        p_report_id: input.reportId,
        p_resolution_note: input.resolutionNote?.trim() || null,
        p_status: input.status
      });

      if (error) throw error;
      return data as SafetyReport;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["moderation-reports"] });
    }
  });
}
