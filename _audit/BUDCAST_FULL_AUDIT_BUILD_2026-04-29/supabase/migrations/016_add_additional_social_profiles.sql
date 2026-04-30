-- Add additional public social profile fields for creator and brand storefronts.
-- These are nullable so existing profiles and seed data remain valid.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS facebook TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF NOT EXISTS x_profile TEXT;
