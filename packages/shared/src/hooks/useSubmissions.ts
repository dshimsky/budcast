import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import type {
  Application,
  ContentSubmission,
  GiftingWorkflow,
  Opportunity,
  PaymentMethod,
  PostType,
  User,
  VerificationStatus
} from "../types/database";

type SubmissionBrandSummary = Pick<User, "id" | "company_name" | "avatar_url">;
type SubmissionCreatorSummary = Pick<
  User,
  "id" | "name" | "avatar_url" | "badges" | "instagram" | "tiktok" | "youtube" | "niches" | "review_score" | "review_count"
>;
type SubmissionOpportunitySummary = Pick<
  Opportunity,
  "id" | "title" | "campaign_type" | "application_deadline" | "payment_methods" | "content_types"
> & { brand: SubmissionBrandSummary | null };

export interface SubmissionPipelineRow extends Application {
  opportunity: SubmissionOpportunitySummary | null;
  submission: ContentSubmission | null;
  gifting_workflow: GiftingWorkflow | null;
}

export interface BrandSubmissionQueueRow extends Application {
  creator: SubmissionCreatorSummary | null;
  opportunity: SubmissionOpportunitySummary | null;
  submission: ContentSubmission | null;
}

interface SubmissionMutationResult {
  id: string;
}

export interface UpsertContentSubmissionInput {
  applicationId: string;
  submissionId?: string | null;
  postUrl: string;
  postType: PostType;
  screenshotUrl?: string | null;
  paymentMethod?: PaymentMethod | null;
}

export interface UpdateSubmissionVerificationInput {
  applicationId: string;
  submissionId: string;
  verificationStatus: Exclude<VerificationStatus, "pending">;
  verificationFeedback?: string | null;
}

export interface ConfirmSubmissionPaymentInput {
  applicationId: string;
  submissionId: string;
  paymentMethod?: PaymentMethod | null;
}

function collapseSubmission<T extends { submissions?: ContentSubmission[] | null; gifting_workflows?: GiftingWorkflow[] | null }>(
  row: T
): Omit<T, "submissions" | "gifting_workflows"> & { submission: ContentSubmission | null; gifting_workflow: GiftingWorkflow | null } {
  const { submissions, gifting_workflows, ...rest } = row;
  return {
    ...rest,
    submission: Array.isArray(submissions) ? (submissions[0] ?? null) : null,
    gifting_workflow: Array.isArray(gifting_workflows) ? (gifting_workflows[0] ?? null) : null,
  };
}

async function invalidateSubmissionQueries(queryClient: ReturnType<typeof useQueryClient>, applicationId: string) {
  await queryClient.invalidateQueries({ queryKey: ["submission-pipeline"] });
  await queryClient.invalidateQueries({ queryKey: ["brand-submissions"] });
  await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
  await queryClient.invalidateQueries({ queryKey: ["applicants"] });
  await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  await queryClient.invalidateQueries({ queryKey: ["campaign"] });
  await queryClient.invalidateQueries({ queryKey: ["application-submission", applicationId] });
}

export function useMySubmissionPipeline() {
  const { profile } = useAuth();
  const creatorId = profile?.id ?? null;

  return useQuery<SubmissionPipelineRow[]>({
    queryKey: ["submission-pipeline", creatorId],
    enabled: !!creatorId && profile?.user_type === "creator",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          *,
          opportunity:opportunities!applications_opportunity_id_fkey (
            id, title, campaign_type, application_deadline, payment_methods, content_types,
            brand:users!opportunities_brand_id_fkey (
              id, company_name, avatar_url
            )
          ),
          submissions:content_submissions (*),
          gifting_workflows:gifting_workflow (*)
        `
        )
        .eq("creator_id", creatorId!)
        .in("status", ["accepted", "completed"])
        .order("accepted_at", { ascending: false });

      if (error) throw error;
      return ((data ?? []) as Array<SubmissionPipelineRow & { submissions?: ContentSubmission[] | null; gifting_workflows?: GiftingWorkflow[] | null }>).map(
        collapseSubmission
      );
    }
  });
}

export function useBrandSubmissionQueue() {
  const { brandContext, profile } = useAuth();
  const brandId = brandContext?.brandId ?? (profile?.user_type === "brand" ? profile.id : null);

  return useQuery<BrandSubmissionQueueRow[]>({
    queryKey: ["brand-submissions", brandId],
    enabled: !!brandId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          *,
          creator:users!applications_creator_id_fkey (
            id, name, avatar_url, badges, instagram, tiktok, youtube, niches, review_score, review_count
          ),
          opportunity:opportunities!inner (
            id, title, campaign_type, application_deadline, payment_methods, content_types, brand_id,
            brand:users!opportunities_brand_id_fkey (
              id, company_name, avatar_url
            )
          ),
          submissions:content_submissions (*)
        `
        )
        .eq("opportunity.brand_id", brandId!)
        .in("status", ["accepted", "completed"])
        .order("accepted_at", { ascending: false });

      if (error) throw error;
      return ((data ?? []) as Array<BrandSubmissionQueueRow & { submissions?: ContentSubmission[] | null }>).map(
        collapseSubmission
      );
    }
  });
}

export function useUpsertContentSubmission() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation<SubmissionMutationResult, unknown, UpsertContentSubmissionInput>({
    mutationFn: async (input) => {
      if (!profile?.id) {
        throw new Error("NOT_SIGNED_IN");
      }

      if (input.submissionId) {
        const { data, error } = await supabase
          .from("content_submissions")
          .update({
            post_url: input.postUrl,
            post_type: input.postType,
            screenshot_url: input.screenshotUrl ?? null,
            payment_method: input.paymentMethod ?? null,
            verification_status: "pending",
            verification_results: null,
            verification_feedback: null,
            verified_at: null,
            reviewed_by_user_id: null,
            payment_confirmed_by_brand: false,
            payment_confirmed_by_creator: false,
            payment_confirmed_by_user_id: null,
            brand_confirmed_at: null,
            creator_confirmed_at: null
          })
          .eq("id", input.submissionId)
          .select("id")
          .single();

        if (error) throw error;
        return data as SubmissionMutationResult;
      }

      const { data, error } = await supabase
        .from("content_submissions")
        .insert({
          application_id: input.applicationId,
          creator_id: profile.id,
          post_url: input.postUrl,
          post_type: input.postType,
          screenshot_url: input.screenshotUrl ?? null,
          payment_method: input.paymentMethod ?? null
        })
        .select("id")
        .single();

      if (error) throw error;
      return data as SubmissionMutationResult;
    },
    onSuccess: async (_data, variables) => {
      await invalidateSubmissionQueries(queryClient, variables.applicationId);
    }
  });
}

export function useUpdateContentSubmissionVerification() {
  const queryClient = useQueryClient();
  const { brandContext, profile } = useAuth();

  return useMutation<SubmissionMutationResult, unknown, UpdateSubmissionVerificationInput>({
    mutationFn: async (input) => {
      if (!profile?.id) {
        throw new Error("NOT_SIGNED_IN");
      }
      const actorId = brandContext?.actorId ?? profile.id;
      const { data, error } = await supabase
        .from("content_submissions")
        .update({
          verification_status: input.verificationStatus,
          verification_feedback: input.verificationFeedback ?? null,
          verified_at: input.verificationStatus === "verified" ? new Date().toISOString() : null,
          reviewed_by_user_id: actorId
        })
        .eq("id", input.submissionId)
        .select("id")
        .single();

      if (error) throw error;
      return data as SubmissionMutationResult;
    },
    onSuccess: async (_data, variables) => {
      await invalidateSubmissionQueries(queryClient, variables.applicationId);
    }
  });
}

export function useConfirmSubmissionPayment() {
  const queryClient = useQueryClient();
  const { brandContext, profile } = useAuth();

  return useMutation<SubmissionMutationResult, unknown, ConfirmSubmissionPaymentInput>({
    mutationFn: async (input) => {
      if (!profile?.id || !profile.user_type) {
        throw new Error("NOT_SIGNED_IN");
      }
      const actorId = brandContext?.actorId ?? profile.id;
      const isBrandSideActor = Boolean(brandContext?.brandId) || profile.user_type === "brand";

      const patch =
        isBrandSideActor
          ? {
              payment_confirmed_by_brand: true,
              brand_confirmed_at: new Date().toISOString(),
              payment_confirmed_by_user_id: actorId,
              payment_method: input.paymentMethod ?? undefined
            }
          : {
              payment_confirmed_by_creator: true,
              creator_confirmed_at: new Date().toISOString()
            };

      const { data, error } = await supabase
        .from("content_submissions")
        .update(patch)
        .eq("id", input.submissionId)
        .select("id")
        .single();

      if (error) throw error;
      return data as SubmissionMutationResult;
    },
    onSuccess: async (_data, variables) => {
      await invalidateSubmissionQueries(queryClient, variables.applicationId);
    }
  });
}
