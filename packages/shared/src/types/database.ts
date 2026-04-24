/**
 * Database type definitions for BudCast.
 *
 * These types mirror the Postgres schema defined in supabase/migrations/*.sql.
 * In production, regenerate with: npm run db:types
 * (requires Supabase CLI and a local or linked project).
 *
 * Manually maintained here for the scaffold since we cannot run the CLI
 * in this environment.
 */

export type UserType = 'creator' | 'brand';
export type UserTier = 'free' | 'pro' | 'premium' | 'enterprise';
export type AccountStatus = 'active' | 'suspended' | 'banned';
export type CampaignType = 'gifting' | 'paid' | 'hybrid';
export type CampaignStatus = 'draft' | 'active' | 'closed' | 'cancelled';
export type ApprovalMode = 'manual' | 'auto';
export type ApplicationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'completed'
  | 'disputed';
export type VerificationStatus =
  | 'pending'
  | 'verified'
  | 'needs_revision'
  | 'failed';
export type PostType =
  | 'instagram_post'
  | 'instagram_story'
  | 'instagram_reel'
  | 'tiktok_video'
  | 'youtube_video'
  | 'youtube_short';
export type ReviewStatus = 'published' | 'flagged' | 'removed' | 'pending';
export type DisputeType =
  | 'non_payment'
  | 'no_content'
  | 'content_quality'
  | 'other';
export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved'
  | 'escalated'
  | 'closed';
export type TransactionType =
  | 'allocation'
  | 'rollover'
  | 'spent'
  | 'refund'
  | 'completion'
  | 'purchase'
  | 'reservation';
export type NotificationType =
  | 'new_application'
  | 'application_accepted'
  | 'application_rejected'
  | 'content_verified'
  | 'content_needs_revision'
  | 'payment_confirmation_needed'
  | 'review_request'
  | 'review_received'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'credit_refresh'
  | 'badge_unlocked'
  | 'message_received';

export type Badge =
  | 'verified_payer'
  | 'trusted_creator'
  | 'highly_rated'
  | 'top_rated'
  | 'founding_brand'
  | 'founding_creator';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  user_type: UserType;
  tier: UserTier;

  name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  cover_url: string | null;

  // Creator-specific
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  follower_count_instagram: number | null;
  follower_count_tiktok: number | null;
  follower_count_youtube: number | null;
  portfolio_image_urls: string[];
  niches: string[];

  // Brand-specific
  company_name: string | null;
  website: string | null;
  founded_year: number | null;

  // Credits
  credits_balance: number;
  credits_allocated: number;
  credits_spent_this_month: number;
  credits_rollover_last_month: number;
  last_credit_refresh: string | null;

  // Reputation
  payment_rate: number | null;
  completion_rate: number | null;
  total_campaigns: number;
  successful_campaigns: number;
  review_score: number | null;
  review_count: number;
  reputation_score: number | null;
  badges: Badge[];

  // Disputes
  dispute_count: number;
  unresolved_disputes: number;
  account_status: AccountStatus;

  // Subscription
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_ends_at: string | null;

  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'venmo' | 'zelle' | 'cashapp' | 'paypal';
export type ContentFormat =
  | 'ig_post'
  | 'ig_reel'
  | 'ig_story'
  | 'tiktok_video'
  | 'tiktok_photo'
  | 'youtube_short';
export type CampaignCategory =
  | 'flower'
  | 'pre_rolls'
  | 'edibles'
  | 'vapes'
  | 'concentrates'
  | 'topicals'
  | 'accessories'
  | 'lifestyle';

export interface Opportunity {
  id: string;
  brand_id: string;
  // Human-readable campaign identifier (BC-YYMM-NNNN) generated on publish.
  // Null for drafts or legacy rows.
  campaign_number: string | null;
  title: string;
  // Full creative brief — markdown-supported, up to 2000 chars.
  description: string;
  // 200-char elevator pitch shown on Free Store cards (Phase 2 Session 2).
  short_description: string | null;
  campaign_type: CampaignType;
  // Legacy aggregate credit cost — nullable. New campaigns use credit_cost_per_slot.
  credit_cost: number | null;
  // Per-slot credit cost (50 gifting, 75 hybrid, 100 paid). The source of
  // truth for what a creator spends to apply.
  credit_cost_per_slot: number | null;
  // Total credits the brand committed at publish time (slots × cost_per_slot).
  // Drops as slots close; returned as unfilled slots expire.
  credits_reserved: number | null;
  cash_amount: number | null;
  product_description: string | null;
  content_types: string[]; // ContentFormat[] semantically
  required_hashtags: string[];
  brief_requirements: string | null;
  // Brand handle creators must @-mention. AI verification checks for exact match.
  brand_mention: string | null;
  // Optional checkable items the creator must include in their content.
  must_includes: string[];
  // Optional things the creator cannot say or show. AI flags violations.
  off_limits: string[];
  // Up to 4 inspiration image URLs the brand uploaded.
  reference_image_urls: string[];
  // Subset of PaymentMethod[] the brand can pay through (Paid + Hybrid only).
  payment_methods: string[];
  // Categories — used for Free Store filtering.
  categories: string[];
  location: string | null;
  // Legacy column — preserved for backwards compatibility with Phase 1 data.
  // New flow uses application_deadline.
  deadline: string | null;
  application_deadline: string | null;
  slots_available: number;
  slots_filled: number;
  image_url: string | null;
  status: CampaignStatus;
  approval_mode: ApprovalMode;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// Form state for the in-progress campaign creation flow. Stored
// as JSONB in opportunity_drafts.form_state. Mirrors Opportunity
// but every field is optional because drafts get persisted at
// every step regardless of completeness.
export interface OpportunityDraftFormState {
  campaign_type?: CampaignType;
  title?: string;
  short_description?: string;
  description?: string; // The brief
  image_url?: string;
  categories?: string[];
  cash_amount?: number;
  product_description?: string;
  payment_methods?: PaymentMethod[];
  content_types?: ContentFormat[];
  brand_mention?: string;
  required_hashtags?: string[];
  must_includes?: string[];
  off_limits?: string[];
  reference_image_urls?: string[];
  slots_available?: number;
  application_deadline?: string;
  approval_mode?: ApprovalMode;
}

export interface OpportunityDraft {
  id: string;
  brand_id: string;
  form_state: OpportunityDraftFormState;
  current_step: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  opportunity_id: string;
  creator_id: string;
  message: string | null;
  credits_spent: number;
  status: ApplicationStatus;
  applied_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
  completed_at: string | null;
  completion_deadline: string | null;
}

export interface ContentSubmission {
  id: string;
  application_id: string;
  creator_id: string;
  post_url: string;
  post_type: PostType | null;
  screenshot_url: string | null;
  verification_status: VerificationStatus;
  verification_results: Record<string, unknown> | null;
  verification_feedback: string | null;
  verified_at: string | null;
  payment_confirmed_by_brand: boolean;
  payment_confirmed_by_creator: boolean;
  payment_method: string | null;
  brand_confirmed_at: string | null;
  creator_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  application_id: string;
  reviewer_id: string;
  reviewee_id: string;
  content_quality_score: number | null;
  professionalism_score: number | null;
  timeliness_score: number | null;
  payment_speed_score: number | null;
  communication_score: number | null;
  product_quality_score: number | null;
  overall_score: number | null;
  review_text: string | null;
  response_text: string | null;
  response_posted_at: string | null;
  reported: boolean;
  report_reason: string | null;
  moderator_reviewed: boolean;
  review_status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface Dispute {
  id: string;
  application_id: string;
  filed_by: string;
  filed_against: string;
  dispute_type: DisputeType;
  description: string;
  evidence_urls: string[];
  status: DisputeStatus;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  credits_refunded: boolean;
  account_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: TransactionType;
  amount: number;
  // Legacy column — nullable now. New RPCs don't populate it because
  // we read balance from users.credits_balance directly.
  balance_after: number | null;
  related_application_id: string | null;
  related_opportunity_id: string | null;
  // Flat opportunity FK used by new RPCs (publish, apply, review).
  opportunity_id: string | null;
  description: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url: string | null;
  related_user_id: string | null;
  related_application_id: string | null;
  related_opportunity_id: string | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

/**
 * Database shape for @supabase/supabase-js generic typing.
 *
 * The __InternalSupabase marker is required by @supabase/supabase-js >= 2.45
 * for correct type inference on inserts and updates. Without it, Insert/Update
 * parameters resolve to `never` and every write operation type-errors.
 */
export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Partial<User> & Pick<User, 'id' | 'email'>;
        Update: Partial<User>;
        Relationships: [];
      };
      opportunities: {
        Row: Opportunity;
        // credit_cost is nullable now; new campaigns use credit_cost_per_slot
        // which isn't a schema-required field either (publish RPC sets it).
        // Required minimum for an insert: brand_id + title + description + type.
        Insert: Partial<Opportunity> & Pick<Opportunity, 'brand_id' | 'title' | 'description' | 'campaign_type'>;
        Update: Partial<Opportunity>;
        Relationships: [];
      };
      opportunity_drafts: {
        Row: OpportunityDraft;
        Insert: Partial<OpportunityDraft> & Pick<OpportunityDraft, 'brand_id'>;
        Update: Partial<OpportunityDraft>;
        Relationships: [];
      };
      applications: {
        Row: Application;
        Insert: Partial<Application> &
          Pick<Application, 'opportunity_id' | 'creator_id' | 'credits_spent'>;
        Update: Partial<Application>;
        Relationships: [];
      };
      content_submissions: {
        Row: ContentSubmission;
        Insert: Partial<ContentSubmission> &
          Pick<ContentSubmission, 'application_id' | 'creator_id' | 'post_url' | 'post_type'>;
        Update: Partial<ContentSubmission>;
        Relationships: [];
      };
      reviews: {
        Row: Review;
        Insert: Partial<Review> &
          Pick<Review, 'application_id' | 'reviewer_id' | 'reviewee_id'>;
        Update: Partial<Review>;
        Relationships: [];
      };
      disputes: {
        Row: Dispute;
        Insert: Partial<Dispute> &
          Pick<Dispute, 'application_id' | 'filed_by' | 'filed_against' | 'dispute_type' | 'description'>;
        Update: Partial<Dispute>;
        Relationships: [];
      };
      credit_transactions: {
        Row: CreditTransaction;
        // balance_after nullable now — RPCs skip it since users.credits_balance
        // is the source of truth for the current balance.
        Insert: Partial<CreditTransaction> &
          Pick<CreditTransaction, 'user_id' | 'transaction_type' | 'amount'>;
        Update: Partial<CreditTransaction>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> &
          Pick<Notification, 'user_id' | 'type' | 'title'>;
        Update: Partial<Notification>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      apply_to_campaign_rpc: {
        Args: {
          p_creator_id: string;
          p_opportunity_id: string;
          p_message: string | null;
        };
        Returns: {
          application_id: string;
          credits_spent: number;
          new_balance: number;
        };
      };
      review_application_rpc: {
        Args: {
          p_application_id: string;
          p_brand_id: string;
          p_decision: 'accept' | 'reject';
        };
        Returns:
          | {
              decision: 'accept';
              application_id: string;
              new_status: 'accepted';
              slots_filled: number;
              campaign_closed: boolean;
              auto_rejected_count: number;
            }
          | {
              decision: 'reject';
              application_id: string;
              new_status: 'rejected';
              credits_returned: number;
            };
      };
      publish_campaign_rpc: {
        Args: {
          p_brand_id: string;
          p_opportunity: Record<string, unknown>;
          p_credits_to_deduct: number;
          p_draft_id: string | null;
        };
        Returns: {
          id: string;
          campaign_number: string;
          credits_reserved: number;
          new_balance: number;
        };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
