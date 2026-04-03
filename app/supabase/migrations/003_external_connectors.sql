-- ============================================================================
-- 003: External Data Connectors — Adaptive Matching Enhancement
-- GDPR Art. 6(1)(a), 7, 9, 17, 25 compliant
-- Principle: "Process, Extract, Discard" — raw data never stored
-- ============================================================================

-- ── Enums ────────────────────────────────────────────────────────────

CREATE TYPE connector_category AS ENUM (
  'entertainment', 'shopping', 'ai_assistant', 'social', 'browsing'
);

CREATE TYPE connector_method AS ENUM ('oauth', 'csv_upload', 'zip_upload');

CREATE TYPE connection_status AS ENUM (
  'pending', 'connected', 'analyzing', 'active', 'error', 'revoked'
);

CREATE TYPE processing_consent_status AS ENUM (
  'granted', 'revoked'
);

-- ── External Connectors (Catalog) ────────────────────────────────────
-- Static catalog of supported external services

CREATE TABLE external_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category connector_category NOT NULL,
  method connector_method NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  oauth_scopes TEXT[],
  accepted_file_types TEXT[],
  max_file_size_mb INTEGER DEFAULT 50,
  signals_description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed all 10 connectors
INSERT INTO external_connectors
  (provider, display_name, category, method, description, icon_name, oauth_scopes, accepted_file_types, signals_description)
VALUES
  ('youtube', 'YouTube', 'entertainment', 'oauth',
   'Watch history and subscriptions reveal content preferences, intellectual curiosity, and cultural openness.',
   'youtube', ARRAY['https://www.googleapis.com/auth/youtube.readonly'], NULL,
   'Genre preferences, content depth, cultural openness, curiosity patterns'),

  ('spotify', 'Spotify', 'entertainment', 'oauth',
   'Listening habits reflect emotional patterns, energy levels, and cultural taste.',
   'spotify', ARRAY['user-top-read', 'user-read-recently-played'], NULL,
   'Music taste, mood patterns, openness to new genres, listening depth'),

  ('netflix', 'Netflix', 'entertainment', 'csv_upload',
   'Viewing history shows storytelling preferences, emotional range, and attention span.',
   'netflix', NULL, ARRAY['.csv'],
   'Genre affinity, binge patterns, content diversity, storytelling preferences'),

  ('amazon', 'Amazon', 'shopping', 'csv_upload',
   'Purchase patterns indicate lifestyle priorities, interests, and practical values.',
   'amazon', NULL, ARRAY['.csv'],
   'Lifestyle indicators, hobby investments, practical priorities'),

  ('ebay', 'eBay', 'shopping', 'csv_upload',
   'Buying and selling reveals collecting interests, resourcefulness, and niche passions.',
   'ebay', NULL, ARRAY['.csv'],
   'Niche interests, resourcefulness, collecting patterns'),

  ('chatgpt', 'ChatGPT', 'ai_assistant', 'zip_upload',
   'Conversation exports reveal communication style, intellectual depth, and problem-solving approach.',
   'chatgpt', NULL, ARRAY['.zip'],
   'Communication style, intellectual interests, values, problem-solving approach'),

  ('claude', 'Claude', 'ai_assistant', 'zip_upload',
   'Conversation exports show reasoning patterns, creativity, and analytical depth.',
   'claude', NULL, ARRAY['.zip'],
   'Reasoning style, creativity index, analytical depth, values'),

  ('instagram', 'Instagram', 'social', 'oauth',
   'Activity patterns reveal social energy, aesthetic taste, and lifestyle expression.',
   'instagram', ARRAY['user_profile', 'user_media'], NULL,
   'Social energy, aesthetic preferences, activity patterns, self-expression style'),

  ('x', 'X (Twitter)', 'social', 'oauth',
   'Posts and interactions show communication style, humor, and opinion patterns.',
   'x', ARRAY['tweet.read', 'users.read'], NULL,
   'Communication directness, humor style, opinion strength, engagement patterns'),

  ('google_takeout', 'Google Takeout', 'browsing', 'zip_upload',
   'Search and browsing history reveals knowledge areas, curiosity patterns, and daily interests.',
   'google', NULL, ARRAY['.zip'],
   'Knowledge areas, curiosity breadth, daily interest patterns, learning style');

-- ── User External Connections ────────────────────────────────────────
-- Tracks which connectors a user has linked

CREATE TABLE user_external_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES external_connectors(id),
  status connection_status NOT NULL DEFAULT 'pending',
  oauth_token_encrypted TEXT,
  oauth_refresh_token_encrypted TEXT,
  oauth_expires_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_connector_unique UNIQUE (user_id, connector_id)
);

CREATE INDEX idx_user_connections_user ON user_external_connections (user_id);
CREATE INDEX idx_user_connections_sync ON user_external_connections (next_sync_at)
  WHERE status = 'active';

-- ── External Insights ────────────────────────────────────────────────
-- ONLY derived personality/preference signals — never raw data

CREATE TABLE external_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES user_external_connections(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  signals JSONB NOT NULL DEFAULT '{}',
  confidence NUMERIC(3,2) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  algorithm_version TEXT NOT NULL DEFAULT '1.0',
  CONSTRAINT one_insight_per_connection UNIQUE (connection_id)
);

CREATE INDEX idx_external_insights_user ON external_insights (user_id);
CREATE INDEX idx_external_insights_expiry ON external_insights (expires_at);

-- ── Data Processing Consent (GDPR Art. 6/7/9) ───────────────────────
-- Separate from match consent — granular per connector

CREATE TABLE data_processing_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES external_connectors(id),
  purpose TEXT NOT NULL DEFAULT 'matching_enhancement',
  status processing_consent_status NOT NULL DEFAULT 'granted',
  consent_text TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  CONSTRAINT consent_per_connector UNIQUE (user_id, connector_id, purpose)
);

CREATE INDEX idx_processing_consent_user ON data_processing_consent (user_id);

-- ── Row Level Security ───────────────────────────────────────────────

ALTER TABLE external_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_external_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_consent ENABLE ROW LEVEL SECURITY;

-- Connector catalog: publicly readable
CREATE POLICY connectors_select_public ON external_connectors
  FOR SELECT USING (true);

-- User connections: only own
CREATE POLICY connections_select_own ON user_external_connections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY connections_insert_own ON user_external_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY connections_update_own ON user_external_connections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY connections_delete_own ON user_external_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Insights: only own
CREATE POLICY insights_select_own ON external_insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY insights_insert_own ON external_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY insights_delete_own ON external_insights
  FOR DELETE USING (auth.uid() = user_id);

-- Consent: only own
CREATE POLICY consent_select_own ON data_processing_consent
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY consent_insert_own ON data_processing_consent
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY consent_update_own ON data_processing_consent
  FOR UPDATE USING (auth.uid() = user_id);

-- ── Triggers ─────────────────────────────────────────────────────────

CREATE TRIGGER user_connections_updated_at
  BEFORE UPDATE ON user_external_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit trigger: log consent changes
CREATE OR REPLACE FUNCTION audit_consent_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_events (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    NEW.user_id,
    CASE WHEN NEW.status = 'granted' THEN 'consent_granted' ELSE 'consent_revoked' END,
    'data_processing_consent',
    NEW.id::TEXT,
    jsonb_build_object('connector_id', NEW.connector_id, 'purpose', NEW.purpose)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER consent_audit_trigger
  AFTER INSERT OR UPDATE ON data_processing_consent
  FOR EACH ROW EXECUTE FUNCTION audit_consent_change();

-- Cascade: when connection is revoked, delete insights
CREATE OR REPLACE FUNCTION cascade_revoke_connection()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'revoked' AND OLD.status <> 'revoked' THEN
    DELETE FROM external_insights WHERE connection_id = NEW.id;
    UPDATE data_processing_consent
      SET status = 'revoked', revoked_at = now()
      WHERE user_id = NEW.user_id
        AND connector_id = NEW.connector_id
        AND status = 'granted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER connection_revoke_cascade
  AFTER UPDATE ON user_external_connections
  FOR EACH ROW EXECUTE FUNCTION cascade_revoke_connection();
