-- 002: Subscription plans & user subscriptions
-- Supports: Essentials / Premium / Elite, monthly/annual billing, 3-day trial

-- Plan tier enum
CREATE TYPE plan_tier AS ENUM ('essentials', 'premium', 'elite');

-- Billing interval enum
CREATE TYPE billing_interval AS ENUM ('monthly', 'annually');

-- Subscription status enum
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'canceled', 'expired');

-- Plans table (pricing catalog)
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier plan_tier NOT NULL UNIQUE,
  price_monthly NUMERIC(8,2) NOT NULL,
  price_annual NUMERIC(8,2) NOT NULL,
  matches_per_day INT,          -- NULL = unlimited
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed pricing data
INSERT INTO plans (tier, price_monthly, price_annual, matches_per_day, features) VALUES
  ('essentials', 49.99, 39.99, 3, '{"messaging":true,"aiAssistant":false,"advancedFilters":false,"detailedReports":false,"profileBoost":false,"readReceipts":false,"priorityMatching":false,"prioritySupport":false,"profileCoaching":false}'),
  ('premium', 89.99, 69.99, 5, '{"messaging":true,"aiAssistant":true,"advancedFilters":true,"detailedReports":true,"profileBoost":false,"readReceipts":true,"priorityMatching":false,"prioritySupport":false,"profileCoaching":false}'),
  ('elite', 149.99, 119.99, 10, '{"messaging":true,"aiAssistant":true,"advancedFilters":true,"detailedReports":true,"profileBoost":true,"readReceipts":true,"priorityMatching":true,"prioritySupport":true,"profileCoaching":true}');

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status subscription_status NOT NULL DEFAULT 'trial',
  billing_interval billing_interval NOT NULL DEFAULT 'monthly',
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_active_subscription UNIQUE (user_id)
);

-- Index for fast user lookups
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);

-- RLS policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans are readable by everyone (public pricing)
CREATE POLICY "Plans are publicly readable"
  ON plans FOR SELECT
  USING (true);

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription (sign-up flow)
CREATE POLICY "Users can create own subscription"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscription (upgrade/downgrade/cancel)
CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();
