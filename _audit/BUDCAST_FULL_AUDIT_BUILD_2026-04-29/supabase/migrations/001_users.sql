-- ============================================================
-- Migration: 001_users
-- Creates the users table with identity, reputation, credits,
-- subscription, and account status fields.
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  user_type TEXT CHECK (user_type IN ('creator', 'brand')),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'premium', 'enterprise')),

  -- Profile
  name TEXT,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  cover_url TEXT,

  -- Creator-specific
  instagram TEXT,
  tiktok TEXT,
  youtube TEXT,
  follower_count_instagram INTEGER,
  follower_count_tiktok INTEGER,
  follower_count_youtube INTEGER,
  portfolio_image_urls TEXT[] DEFAULT '{}',
  niches TEXT[] DEFAULT '{}',

  -- Brand-specific
  company_name TEXT,
  website TEXT,
  founded_year INTEGER,

  -- Credits
  credits_balance INTEGER DEFAULT 0 NOT NULL,
  credits_allocated INTEGER DEFAULT 0 NOT NULL,
  credits_spent_this_month INTEGER DEFAULT 0 NOT NULL,
  credits_rollover_last_month INTEGER DEFAULT 0 NOT NULL,
  last_credit_refresh TIMESTAMPTZ,

  -- Reputation (objective)
  payment_rate DECIMAL(5,2),
  completion_rate DECIMAL(5,2),
  total_campaigns INTEGER DEFAULT 0 NOT NULL,
  successful_campaigns INTEGER DEFAULT 0 NOT NULL,

  -- Reputation (subjective)
  review_score DECIMAL(2,1),
  review_count INTEGER DEFAULT 0 NOT NULL,

  -- Composite reputation
  reputation_score DECIMAL(5,2),

  -- Trust badges — array of string identifiers
  badges TEXT[] DEFAULT '{}',

  -- Disputes
  dispute_count INTEGER DEFAULT 0 NOT NULL,
  unresolved_disputes INTEGER DEFAULT 0 NOT NULL,
  account_status TEXT DEFAULT 'active'
    CHECK (account_status IN ('active', 'suspended', 'banned')),

  -- Subscription
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_ends_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_email ON users(email);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read any profile (profiles are public)
CREATE POLICY "Profiles are publicly readable"
  ON users FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Authenticated users can insert their own profile row (during signup)
-- The id MUST match auth.uid() — prevents inserting a profile for someone else.
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
