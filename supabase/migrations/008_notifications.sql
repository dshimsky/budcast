-- ============================================================
-- Migration: 008_notifications
-- In-app notifications for realtime updates (new application,
-- content verified, review requested, dispute opened, etc.)
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  type TEXT NOT NULL CHECK (type IN (
    'new_application',
    'application_accepted',
    'application_rejected',
    'content_verified',
    'content_needs_revision',
    'payment_confirmation_needed',
    'review_request',
    'review_received',
    'dispute_opened',
    'dispute_resolved',
    'credit_refresh',
    'badge_unlocked',
    'message_received'
  )),

  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,

  -- Related entities for deep linking
  related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  related_application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  related_opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,

  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, created_at DESC)
  WHERE read = false;
CREATE INDEX idx_notifications_type ON notifications(type);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their own notifications read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
