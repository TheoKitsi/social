-- Migration 007: Add test user tracking columns to profiles
-- Used for beta test accounts with automatic expiration.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_test_user BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS test_expires_at TIMESTAMPTZ;

-- Index for efficient cron cleanup queries
CREATE INDEX IF NOT EXISTS idx_profiles_test_users
  ON profiles (is_test_user, test_expires_at)
  WHERE is_test_user = TRUE;

COMMENT ON COLUMN profiles.is_test_user IS 'True for temporary beta test accounts';
COMMENT ON COLUMN profiles.test_expires_at IS 'Timestamp when test account expires and is auto-blocked';
