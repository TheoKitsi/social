-- Migration: Add role column to profiles for RBAC
-- Supports: 'user' (default), 'admin'

CREATE TYPE user_role AS ENUM ('user', 'admin');

ALTER TABLE profiles
  ADD COLUMN role user_role NOT NULL DEFAULT 'user';

-- Admin policy: admins can read all profiles
CREATE POLICY profiles_admin_select_all ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );
