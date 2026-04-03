-- ============================================================================
-- SOCIAL Dating Platform — Initial Database Schema
-- Based on: INF-1 (PostgreSQL), ADR-1 (Funnel Architecture)
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────────────

CREATE TYPE verification_status AS ENUM ('pending', 'in_progress', 'verified', 'rejected');
CREATE TYPE verification_type AS ENUM ('sms', 'email', 'id_document');
CREATE TYPE consent_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE funnel_side AS ENUM ('self', 'target');

-- ── Profiles ─────────────────────────────────────────────────────────
-- One profile per auth.users row

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  id_verified BOOLEAN NOT NULL DEFAULT FALSE,
  active_funnel_level INTEGER NOT NULL DEFAULT 1 CHECK (active_funnel_level BETWEEN 1 AND 5),
  quality_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (quality_score BETWEEN 0 AND 100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

-- ── Funnel Profiles ──────────────────────────────────────────────────
-- JSONB per level per side (ADR-1: independent data units)

CREATE TABLE funnel_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  side funnel_side NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  weighting JSONB,        -- target side only: {fieldName: "must_have"|"nice_to_have"|"indifferent"}
  tolerance JSONB,        -- target side only: {fieldName: "exact"|"range"|"flexible"}
  deal_breakers TEXT[],   -- target side only: array of field names marked as deal-breakers
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT funnel_profiles_unique UNIQUE (user_id, level, side)
);

-- GIN index on JSONB for matching queries (INF-1)
CREATE INDEX idx_funnel_profiles_data ON funnel_profiles USING GIN (data);
CREATE INDEX idx_funnel_profiles_user_level ON funnel_profiles (user_id, level);

-- ── Matching Scores ──────────────────────────────────────────────────

CREATE TABLE matching_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_a_to_b NUMERIC(5,2) NOT NULL CHECK (score_a_to_b BETWEEN 0 AND 100),
  score_b_to_a NUMERIC(5,2) NOT NULL CHECK (score_b_to_a BETWEEN 0 AND 100),
  composite_score NUMERIC(5,2) NOT NULL CHECK (composite_score BETWEEN 0 AND 100),
  breakdown JSONB NOT NULL DEFAULT '{}',
  algorithm_version TEXT NOT NULL DEFAULT '1.0',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT matching_scores_pair_unique UNIQUE (user_a_id, user_b_id),
  CONSTRAINT matching_scores_no_self CHECK (user_a_id <> user_b_id)
);

CREATE INDEX idx_matching_scores_user_a ON matching_scores (user_a_id, composite_score DESC);
CREATE INDEX idx_matching_scores_user_b ON matching_scores (user_b_id, composite_score DESC);

-- ── Consent Records ──────────────────────────────────────────────────
-- SOL-5: Mutual consent before contact

CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status consent_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  CONSTRAINT consent_records_pair_unique UNIQUE (from_user_id, to_user_id),
  CONSTRAINT consent_records_no_self CHECK (from_user_id <> to_user_id)
);

CREATE INDEX idx_consent_records_to_user ON consent_records (to_user_id, status);

-- ── Messages ─────────────────────────────────────────────────────────
-- Only between mutually consented users

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_id UUID NOT NULL REFERENCES consent_records(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_consent ON messages (consent_id, created_at);

-- ── Notifications ────────────────────────────────────────────────────

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, read, created_at DESC);

-- ── Verification Requests ────────────────────────────────────────────

CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type verification_type NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  document_path TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_verification_user ON verification_requests (user_id, type);

-- ── Audit Events ─────────────────────────────────────────────────────
-- Append-only table (INF-1: no UPDATE/DELETE grants)

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_events_user ON audit_events (user_id, created_at DESC);
CREATE INDEX idx_audit_events_entity ON audit_events (entity_type, entity_id);

-- ── Updated-at Trigger ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER funnel_profiles_updated_at
  BEFORE UPDATE ON funnel_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security (DSGVO / OWASP) ──────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own, read verified users' basic info
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Funnel profiles: only own data
CREATE POLICY funnel_select_own ON funnel_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY funnel_insert_own ON funnel_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY funnel_update_own ON funnel_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Matching scores: can read scores involving self
CREATE POLICY matching_select_own ON matching_scores
  FOR SELECT USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Consent records: can read/create involving self
CREATE POLICY consent_select_own ON consent_records
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY consent_insert_own ON consent_records
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY consent_update_target ON consent_records
  FOR UPDATE USING (auth.uid() = to_user_id);

-- Messages: can read messages in consented conversations
CREATE POLICY messages_select_own ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM consent_records
      WHERE consent_records.id = messages.consent_id
        AND (consent_records.from_user_id = auth.uid() OR consent_records.to_user_id = auth.uid())
        AND consent_records.status = 'accepted'
    )
  );
CREATE POLICY messages_insert_own ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM consent_records
      WHERE consent_records.id = messages.consent_id
        AND (consent_records.from_user_id = auth.uid() OR consent_records.to_user_id = auth.uid())
        AND consent_records.status = 'accepted'
    )
  );

-- Notifications: only own
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_update_own ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Verification requests: only own
CREATE POLICY verification_select_own ON verification_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY verification_insert_own ON verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Audit events: insert-only for authenticated users, no read (admin-only via service role)
CREATE POLICY audit_insert ON audit_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── Auto-create profile on user signup ───────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email_verified)
  VALUES (NEW.id, COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
