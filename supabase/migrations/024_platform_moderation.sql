-- ============================================================
-- Migration: 024_platform_moderation
-- Platform-admin moderation queue for safety reports.
-- ============================================================

CREATE TABLE IF NOT EXISTS platform_admins (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'moderator' NOT NULL
    CHECK (role IN ('owner', 'moderator')),
  status TEXT DEFAULT 'active' NOT NULL
    CHECK (status IN ('active', 'suspended', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform admins can read their own admin status" ON platform_admins;
CREATE POLICY "Platform admins can read their own admin status"
  ON platform_admins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS platform_admins_updated_at ON platform_admins;
CREATE TRIGGER platform_admins_updated_at
  BEFORE UPDATE ON platform_admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION is_platform_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM platform_admins admins
    WHERE admins.user_id = p_user_id
      AND admins.status = 'active'
  );
$$;

GRANT EXECUTE ON FUNCTION is_platform_admin(UUID) TO authenticated;

ALTER TABLE safety_reports
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolution_note TEXT CHECK (resolution_note IS NULL OR char_length(resolution_note) <= 1000);

CREATE INDEX IF NOT EXISTS idx_safety_reports_reviewed_by
  ON safety_reports(reviewed_by);

DROP POLICY IF EXISTS "Platform admins can read safety reports" ON safety_reports;
CREATE POLICY "Platform admins can read safety reports"
  ON safety_reports FOR SELECT
  TO authenticated
  USING (is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Platform admins can update safety reports" ON safety_reports;
CREATE POLICY "Platform admins can update safety reports"
  ON safety_reports FOR UPDATE
  TO authenticated
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (
    is_platform_admin(auth.uid())
    AND (
      reviewed_by IS NULL
      OR reviewed_by = auth.uid()
    )
  );
