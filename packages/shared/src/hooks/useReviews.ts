import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Application, Opportunity, Review, User } from '../types/database';

export type ReviewDimensionKey =
  | 'content_quality_score'
  | 'professionalism_score'
  | 'timeliness_score'
  | 'payment_speed_score'
  | 'communication_score'
  | 'product_quality_score';

export type ReviewReviewerSummary = Pick<
  User,
  'id' | 'user_type' | 'name' | 'company_name' | 'avatar_url' | 'location' | 'instagram' | 'tiktok'
>;

export type ReviewCampaignContext = Pick<Application, 'id' | 'opportunity_id'> & {
  opportunity: Pick<Opportunity, 'id' | 'title' | 'campaign_type'> | null;
};

export type ProfileReview = Review & {
  application: ReviewCampaignContext | null;
  reviewer: ReviewReviewerSummary | null;
};

export type ProfileReviewsResult = {
  averageScore: number | null;
  dimensionAverages: Record<ReviewDimensionKey, number | null>;
  reviewCount: number;
  reviews: ProfileReview[];
};

export type CreateMarketplaceReviewInput = {
  applicationId: string;
  reviewText?: string | null;
  contentQualityScore?: number | null;
  professionalismScore?: number | null;
  timelinessScore?: number | null;
  paymentSpeedScore?: number | null;
  communicationScore?: number | null;
  productQualityScore?: number | null;
};

const DIMENSION_KEYS: ReviewDimensionKey[] = [
  'content_quality_score',
  'professionalism_score',
  'timeliness_score',
  'payment_speed_score',
  'communication_score',
  'product_quality_score',
];

export function useProfileReviews(profileId: string | null | undefined, limit = 12) {
  return useQuery<ProfileReviewsResult>({
    queryKey: ['profile-reviews', profileId, limit],
    enabled: Boolean(profileId),
    queryFn: async () => {
      const fullResult = await supabase
        .from('reviews')
        .select(
          `
          *,
          reviewer:users!reviews_reviewer_id_fkey (
            id,
            user_type,
            name,
            company_name,
            avatar_url,
            location,
            instagram,
            tiktok
          ),
          application:applications!reviews_application_id_fkey (
            id,
            opportunity_id,
            opportunity:opportunities!applications_opportunity_id_fkey (
              id,
              title,
              campaign_type
            )
          )
        `,
          { count: 'exact' },
        )
        .eq('reviewee_id', profileId!)
        .eq('review_status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      let data = fullResult.data;
      let count = fullResult.count;

      if (fullResult.error) {
        const fallbackResult = await supabase
          .from('reviews')
          .select(
            `
            *,
            reviewer:users!reviews_reviewer_id_fkey (
              id,
              user_type,
              name,
              company_name,
              avatar_url,
              location,
              instagram,
              tiktok
            )
          `,
            { count: 'exact' },
          )
          .eq('reviewee_id', profileId!)
          .eq('review_status', 'published')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fallbackResult.error) throw fallbackResult.error;
        data = fallbackResult.data;
        count = fallbackResult.count;
      }

      const reviews = ((data ?? []) as unknown as ProfileReview[]).map((review) => ({
        ...review,
        application: review.application ?? null,
      }));

      return {
        averageScore: average(
          reviews.map((review) => review.overall_score ?? average(DIMENSION_KEYS.map((key) => review[key]))),
        ),
        dimensionAverages: DIMENSION_KEYS.reduce(
          (acc, key) => ({
            ...acc,
            [key]: average(reviews.map((review) => review[key])),
          }),
          {} as Record<ReviewDimensionKey, number | null>,
        ),
        reviewCount: count ?? reviews.length,
        reviews,
      };
    },
    staleTime: 30_000,
  });
}

export function useCreateMarketplaceReview() {
  const queryClient = useQueryClient();

  return useMutation<Review, unknown, CreateMarketplaceReviewInput>({
    mutationFn: async (input) => {
      const { data, error } = await supabase.rpc("create_marketplace_review", {
        p_application_id: input.applicationId,
        p_communication_score: input.communicationScore ?? null,
        p_content_quality_score: input.contentQualityScore ?? null,
        p_payment_speed_score: input.paymentSpeedScore ?? null,
        p_product_quality_score: input.productQualityScore ?? null,
        p_professionalism_score: input.professionalismScore ?? null,
        p_review_text: input.reviewText ?? null,
        p_timeliness_score: input.timelinessScore ?? null,
      });

      if (error) throw error;
      return data as Review;
    },
    onSuccess: async (review) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile-reviews", review.reviewee_id] }),
        queryClient.invalidateQueries({ queryKey: ["brand-submissions"] }),
        queryClient.invalidateQueries({ queryKey: ["submission-pipeline"] }),
        queryClient.invalidateQueries({ queryKey: ["my-applications"] }),
        queryClient.invalidateQueries({ queryKey: ["applicants"] }),
        queryClient.invalidateQueries({ queryKey: ["brands"] }),
        queryClient.invalidateQueries({ queryKey: ["brand-profile"] }),
      ]);
    },
  });
}

function average(values: Array<number | string | null | undefined>) {
  const validValues = values
    .map((value) => (typeof value === 'string' ? Number(value) : value))
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  if (!validValues.length) return null;

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}
