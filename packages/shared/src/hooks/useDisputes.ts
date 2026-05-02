import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Dispute, DisputeStatus, DisputeType } from "../types/database";

export type MarketplaceDisputeType = DisputeType;

export type FileMarketplaceDisputeInput = {
  applicationId: string;
  disputeType: MarketplaceDisputeType;
  description: string;
  evidenceUrls?: string[];
};

export type ResolveMarketplaceDisputeInput = {
  disputeId: string;
  status: Extract<DisputeStatus, "under_review" | "resolved" | "escalated" | "closed">;
  resolution?: string | null;
  creditsRefunded?: boolean;
  accountSuspended?: boolean;
};

export function useFileMarketplaceDispute() {
  const queryClient = useQueryClient();

  return useMutation<Dispute, unknown, FileMarketplaceDisputeInput>({
    mutationFn: async (input) => {
      const { data, error } = await supabase.rpc("file_marketplace_dispute", {
        p_application_id: input.applicationId,
        p_description: input.description,
        p_dispute_type: input.disputeType,
        p_evidence_urls: input.evidenceUrls ?? [],
      });

      if (error) throw error;
      return data as Dispute;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["brand-submissions"] }),
        queryClient.invalidateQueries({ queryKey: ["submission-pipeline"] }),
        queryClient.invalidateQueries({ queryKey: ["my-applications"] }),
        queryClient.invalidateQueries({ queryKey: ["applicants"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-disputes"] }),
      ]);
    },
  });
}

export function useAdminDisputes() {
  return useQuery<Dispute[]>({
    queryKey: ["admin-disputes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .in("status", ["open", "under_review", "escalated"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Dispute[];
    },
    staleTime: 15_000,
  });
}

export function useResolveMarketplaceDispute() {
  const queryClient = useQueryClient();

  return useMutation<Dispute, unknown, ResolveMarketplaceDisputeInput>({
    mutationFn: async (input) => {
      const { data, error } = await supabase.rpc("resolve_marketplace_dispute", {
        p_account_suspended: input.accountSuspended ?? false,
        p_credits_refunded: input.creditsRefunded ?? false,
        p_dispute_id: input.disputeId,
        p_resolution: input.resolution ?? null,
        p_status: input.status,
      });

      if (error) throw error;
      return data as Dispute;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-disputes"] }),
        queryClient.invalidateQueries({ queryKey: ["brand-submissions"] }),
        queryClient.invalidateQueries({ queryKey: ["submission-pipeline"] }),
        queryClient.invalidateQueries({ queryKey: ["my-applications"] }),
      ]);
    },
  });
}
