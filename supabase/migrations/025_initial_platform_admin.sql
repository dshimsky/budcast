-- ============================================================
-- Migration: 025_initial_platform_admin
-- Grants the project management account access to platform safety.
-- ============================================================

INSERT INTO platform_admins (user_id, role, status)
SELECT id, 'owner', 'active'
FROM users
WHERE LOWER(email) = 'shiminskymanage@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'owner',
  status = 'active',
  updated_at = NOW();
