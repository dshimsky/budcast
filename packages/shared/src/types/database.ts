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

export type UserType = 'creator' | 'brand' | 'brand_team';
export type UserTier = 'free' | 'pro' | 'premium' | 'enterprise';
export type AccountStatus = 'active' | 'suspended' | 'banned';
export type BrandTeamRole =
  | 'owner'
  | 'admin'
  | 'campaign_manager'
  | 'content_reviewer'
  | 'viewer';
export type BrandTeamInviteRole = Exclude<BrandTeamRole, 'owner'>;
export type BrandTeamCapability =
  | 'manage_team'
  | 'manage_campaigns'
  | 'review_applicants'
  | 'review_submissions'
  | 'message_creators'
  | 'view_brand_activity'
  | 'confirm_payment_product'
  | 'manage_brand_profile';
export type BrandTeamMemberStatus = 'invited' | 'active' | 'suspended' | 'removed';
export type BrandTeamInviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired';
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
  | 'product_not_received'
  | 'no_content'
  | 'content_quality'
  | 'compliance_violation'
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
export type ConversationType = 'direct' | 'campaign';
export type FeedPostType = 'text' | 'media' | 'link' | 'repost';
export type FeedPostVisibility = 'public' | 'followers' | 'private';
export type SafetyReportTargetType = 'profile' | 'feed_post' | 'message' | 'review' | 'campaign' | 'conversation';
export type SafetyReportReasonType =
  | 'spam'
  | 'harassment'
  | 'unsafe_content'
  | 'misrepresentation'
  | 'payment_issue'
  | 'product_not_received'
  | 'other';
export type SafetyReportStatus = 'open' | 'reviewing' | 'actioned' | 'dismissed';
export type PlatformAdminRole = 'owner' | 'moderator';
export type PlatformAdminStatus = 'active' | 'suspended' | 'removed';
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
  | 'verified_brand'
  | 'verified_creator'
  | 'verified_budtender'
  | 'payment_ready'
  | 'campaign_ready'
  | 'social_verified'
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
  facebook: string | null;
  linkedin: string | null;
  x_profile: string | null;
  follower_count_instagram: number | null;
  follower_count_tiktok: number | null;
  follower_count_youtube: number | null;
  portfolio_image_urls: string[];
  niches: string[];
  creator_social_verification_status: 'unverified' | 'submitted' | 'verified' | 'rejected';
  creator_platform_links: Record<string, string>;
  audience_age_attested: boolean;
  cannabis_willingness: 'unspecified' | 'yes' | 'limited' | 'no';
  creator_content_categories: string[];
  creator_markets: string[];
  creator_availability: 'open' | 'limited' | 'unavailable';
  budtender_experience: boolean;
  budtender_market: string | null;
  store_affiliation: string | null;
  store_affiliation_verified: boolean;
  budtender_education_experience: boolean;
  budtender_event_experience: boolean;
  sampling_recap_available: boolean;
  creator_verified_at: string | null;
  creator_verified_by: string | null;
  budtender_verified_at: string | null;
  budtender_verified_by: string | null;
  talent_verification_notes: string | null;

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

  // Trust and cannabis compliance
  date_of_birth: string | null;
  age_verified: boolean;
  age_verified_at: string | null;
  state_code: string | null;
  market_eligible: boolean;
  terms_accepted_at: string | null;
  terms_policy_version: string | null;
  terms_ip_address: string | null;
  compliance_step: string | null;

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

export interface ProfileBlock {
  blocker_id: string;
  blocked_id: string;
  reason: string | null;
  created_at: string;
}

export interface SafetyReport {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  target_type: SafetyReportTargetType;
  target_id: string | null;
  reason_type: SafetyReportReasonType;
  description: string | null;
  status: SafetyReportStatus;
  metadata: Record<string, unknown>;
  payment_issue_flag: boolean;
  product_not_received_flag: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformAdmin {
  user_id: string;
  role: PlatformAdminRole;
  status: PlatformAdminStatus;
  created_at: string;
  updated_at: string;
}

export type PublicProfile = Pick<
  User,
  | 'id'
  | 'user_type'
  | 'name'
  | 'bio'
  | 'location'
  | 'avatar_url'
  | 'cover_url'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'facebook'
  | 'linkedin'
  | 'x_profile'
  | 'portfolio_image_urls'
  | 'niches'
  | 'company_name'
  | 'website'
  | 'payment_rate'
  | 'completion_rate'
  | 'total_campaigns'
  | 'successful_campaigns'
  | 'review_score'
  | 'review_count'
  | 'reputation_score'
  | 'badges'
  | 'creator_social_verification_status'
  | 'creator_platform_links'
  | 'audience_age_attested'
  | 'cannabis_willingness'
  | 'creator_content_categories'
  | 'creator_markets'
  | 'creator_availability'
  | 'budtender_experience'
  | 'budtender_market'
  | 'store_affiliation'
  | 'store_affiliation_verified'
  | 'budtender_education_experience'
  | 'budtender_event_experience'
  | 'sampling_recap_available'
  | 'creator_verified_at'
  | 'budtender_verified_at'
  | 'account_status'
  | 'created_at'
  | 'updated_at'
>;

export interface BrandTeamMember {
  id: string;
  brand_id: string;
  user_id: string;
  role: BrandTeamRole;
  title: string | null;
  public_display: boolean;
  status: BrandTeamMemberStatus;
  invited_by: string | null;
  joined_at: string | null;
  accepted_at: string | null;
  suspended_at: string | null;
  removed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandTeamInvite {
  id: string;
  brand_id: string;
  email: string;
  role: BrandTeamInviteRole;
  title: string | null;
  status: BrandTeamInviteStatus;
  invited_by: string | null;
  accepted_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandActivityLog {
  id: string;
  brand_id: string;
  actor_id: string | null;
  actor_role: BrandTeamRole | null;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ProfileFollow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface ProfileFollowCounts {
  profile_id: string;
  brand_followers: number;
  creator_followers: number;
  total_followers: number;
  following_count: number;
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
  campaign_contact_id: string | null;
  created_by_user_id: string | null;
  updated_by_user_id: string | null;
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
  // Subset of PaymentMethod[] the brand can pay through for cash-backed campaigns.
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
  rights_organic_repost: boolean;
  rights_paid_ads: boolean;
  rights_whitelisting: boolean;
  rights_handle_licensing: boolean;
  rights_duration_days: number | null;
  rights_expires_at: string | null;
  rights_territory: string;
  rights_exclusive: boolean;
  rights_exclusivity_days: number | null;
  rights_no_ai_training: boolean;
  rights_revocable: boolean;
  rights_revocation_notice_days: number | null;
  rights_confirmed: boolean;
  rights_confirmed_at: string | null;
  eligible_states: string[];
  target_platforms: string[];
  disclosure_tags: string[];
  prohibited_content: string[];
  compliance_checklist_done: boolean;
  min_applicant_age: number;
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

  // Rights fields (from migration 028)
  rights_organic_repost?: boolean;
  rights_paid_ads?: boolean;
  rights_whitelisting?: boolean;
  rights_handle_licensing?: boolean;
  rights_duration_days?: number | null;
  rights_territory?: string;
  rights_exclusive?: boolean;
  rights_exclusivity_days?: number | null;
  rights_no_ai_training?: boolean;
  rights_revocable?: boolean;
  rights_revocation_notice_days?: number | null;
  rights_confirmed?: boolean;

  // Compliance fields (from migration 028)
  eligible_states?: string[];
  target_platforms?: string[];
  disclosure_tags?: string[];
  prohibited_content?: string[];
  compliance_checklist_done?: boolean;
  min_applicant_age?: number;
}

export interface OpportunityDraft {
  id: string;
  brand_id: string;
  form_state: OpportunityDraftFormState;
  current_step: number;
  created_at: string;
  updated_at: string;
}

export type GiftingWorkflowStatus =
  | 'pending_brand_action'
  | 'brand_shipped'
  | 'creator_received'
  | 'creator_declined'
  | 'substitution_requested'
  | 'cancelled';

export type GiftingProductCategory =
  | 'flower'
  | 'pre_rolls'
  | 'edibles'
  | 'vapes'
  | 'concentrates'
  | 'topicals'
  | 'accessories'
  | 'merch'
  | 'other';

export interface GiftingWorkflow {
  id: string;
  opportunity_id: string;
  application_id: string;
  brand_id: string;
  creator_id: string;
  product_name: string;
  product_category: GiftingProductCategory;
  product_notes: string | null;
  creator_state_confirmed: boolean;
  creator_age_confirmed: boolean;
  status: GiftingWorkflowStatus;
  brand_contact_method: string | null;
  brand_contact_at: string | null;
  creator_received_at: string | null;
  creator_feedback: string | null;
  substitution_notes: string | null;
  compliance_note: string;
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
  reviewed_by_user_id: string | null;
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
  reviewed_by_user_id: string | null;
  payment_confirmed_by_user_id: string | null;
  brand_confirmed_by_user_id: string | null;
  creator_confirmed_by_user_id: string | null;
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
  payment_issue_flag: boolean;
  product_not_received_flag: boolean;
  admin_flagged_at: string | null;
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

export interface FeedPost {
  id: string;
  author_id: string;
  post_type: FeedPostType;
  body: string | null;
  media_urls: string[];
  url: string | null;
  url_title: string | null;
  url_description: string | null;
  url_image: string | null;
  repost_of_id: string | null;
  visibility: FeedPostVisibility;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  conversation_type: ConversationType;
  brand_id: string;
  creator_id: string;
  opportunity_id: string | null;
  application_id: string | null;
  created_by: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_brand_id: string | null;
  body: string;
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
      brand_team_members: {
        Row: BrandTeamMember;
        Insert: Partial<BrandTeamMember> & Pick<BrandTeamMember, 'brand_id' | 'user_id' | 'role'>;
        Update: Partial<BrandTeamMember>;
        Relationships: [];
      };
      brand_team_invites: {
        Row: BrandTeamInvite;
        Insert: Partial<BrandTeamInvite> & Pick<BrandTeamInvite, 'brand_id' | 'email' | 'role' | 'invited_by'>;
        Update: Partial<BrandTeamInvite>;
        Relationships: [];
      };
      brand_activity_log: {
        Row: BrandActivityLog;
        Insert: Partial<BrandActivityLog> &
          Pick<BrandActivityLog, 'brand_id' | 'actor_id' | 'action_type' | 'entity_type'>;
        Update: Partial<BrandActivityLog>;
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
      conversations: {
        Row: Conversation;
        Insert: Partial<Conversation> & Pick<Conversation, 'brand_id' | 'creator_id' | 'created_by'>;
        Update: Partial<Conversation>;
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: Partial<Message> & Pick<Message, 'conversation_id' | 'sender_id' | 'body'>;
        Update: Partial<Message>;
        Relationships: [];
      };
      feed_posts: {
        Row: FeedPost;
        Insert: Partial<FeedPost> & Pick<FeedPost, 'author_id' | 'post_type'>;
        Update: Partial<FeedPost>;
        Relationships: [];
      };
      profile_follows: {
        Row: ProfileFollow;
        Insert: Partial<ProfileFollow> & Pick<ProfileFollow, 'follower_id' | 'following_id'>;
        Update: Partial<ProfileFollow>;
        Relationships: [];
      };
      profile_blocks: {
        Row: ProfileBlock;
        Insert: Partial<ProfileBlock> & Pick<ProfileBlock, 'blocker_id' | 'blocked_id'>;
        Update: Partial<ProfileBlock>;
        Relationships: [];
      };
      safety_reports: {
        Row: SafetyReport;
        Insert: Partial<SafetyReport> & Pick<SafetyReport, 'reporter_id' | 'target_type' | 'reason_type'>;
        Update: Partial<SafetyReport>;
        Relationships: [];
      };
      platform_admins: {
        Row: PlatformAdmin;
        Insert: Partial<PlatformAdmin> & Pick<PlatformAdmin, 'user_id'>;
        Update: Partial<PlatformAdmin>;
        Relationships: [];
      };
    };
    Views: {
      profile_follow_counts: {
        Row: ProfileFollowCounts;
      };
      public_profiles: {
        Row: PublicProfile;
      };
    };
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
      update_profile_rpc: {
        Args: {
          p_user_type: UserType;
          p_name?: string | null;
          p_bio?: string | null;
          p_location?: string | null;
          p_avatar_url?: string | null;
          p_cover_url?: string | null;
          p_instagram?: string | null;
          p_tiktok?: string | null;
          p_youtube?: string | null;
          p_facebook?: string | null;
          p_linkedin?: string | null;
          p_x_profile?: string | null;
          p_company_name?: string | null;
          p_website?: string | null;
          p_portfolio_image_urls?: string[];
          p_niches?: string[];
          p_creator_platform_links?: Record<string, string>;
          p_audience_age_attested?: boolean;
          p_cannabis_willingness?: User['cannabis_willingness'];
          p_creator_content_categories?: string[];
          p_creator_markets?: string[];
          p_creator_availability?: User['creator_availability'];
          p_budtender_experience?: boolean;
          p_budtender_market?: string | null;
          p_store_affiliation?: string | null;
          p_budtender_education_experience?: boolean;
          p_budtender_event_experience?: boolean;
          p_sampling_recap_available?: boolean;
        };
        Returns: User;
      };
      verify_cannabis_talent: {
        Args: {
          p_user_id: string;
          p_verified_creator?: boolean;
          p_verified_budtender?: boolean;
          p_notes?: string | null;
        };
        Returns: User;
      };
      is_platform_admin: {
        Args: {
          p_user_id: string;
        };
        Returns: boolean;
      };
      moderate_safety_report: {
        Args: {
          p_report_id: string;
          p_status: Extract<SafetyReportStatus, 'reviewing' | 'actioned' | 'dismissed'>;
          p_resolution_note?: string | null;
          p_action?: 'status_only' | 'remove_content' | 'suspend_profile';
        };
        Returns: SafetyReport;
      };
      create_marketplace_review: {
        Args: {
          p_application_id: string;
          p_review_text?: string | null;
          p_content_quality_score?: number | null;
          p_professionalism_score?: number | null;
          p_timeliness_score?: number | null;
          p_payment_speed_score?: number | null;
          p_communication_score?: number | null;
          p_product_quality_score?: number | null;
        };
        Returns: Review;
      };
      file_marketplace_dispute: {
        Args: {
          p_application_id: string;
          p_dispute_type: DisputeType;
          p_description: string;
          p_evidence_urls?: string[];
        };
        Returns: Dispute;
      };
      resolve_marketplace_dispute: {
        Args: {
          p_dispute_id: string;
          p_status: Extract<DisputeStatus, 'under_review' | 'resolved' | 'escalated' | 'closed'>;
          p_resolution?: string | null;
          p_credits_refunded?: boolean;
          p_account_suspended?: boolean;
        };
        Returns: Dispute;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
