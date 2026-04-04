-- Migration: Add user reports and blocks table

CREATE TYPE report_reason AS ENUM (
  'fake_profile',
  'harassment',
  'inappropriate_content',
  'spam',
  'underage',
  'scam',
  'other'
);

CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  description TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_report CHECK (reporter_id != reported_user_id)
);

CREATE TABLE user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_user_id),
  CONSTRAINT unique_block UNIQUE (blocker_id, blocked_user_id)
);

-- RLS
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- Reports: users can insert their own reports and read their own
CREATE POLICY reports_insert_own ON user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY reports_select_own ON user_reports FOR SELECT USING (auth.uid() = reporter_id);

-- Blocks: users can manage their own blocks
CREATE POLICY blocks_insert_own ON user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY blocks_select_own ON user_blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY blocks_delete_own ON user_blocks FOR DELETE USING (auth.uid() = blocker_id);

-- Admin can read all reports
CREATE POLICY reports_admin_select ON user_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY reports_admin_update ON user_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
);

-- Triggers
CREATE TRIGGER user_reports_updated_at
  BEFORE UPDATE ON user_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_user_reports_reported ON user_reports (reported_user_id);
CREATE INDEX idx_user_reports_status ON user_reports (status);
CREATE INDEX idx_user_blocks_blocker ON user_blocks (blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks (blocked_user_id);
