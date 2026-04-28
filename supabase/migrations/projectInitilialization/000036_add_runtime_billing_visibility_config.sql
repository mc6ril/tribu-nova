-- Migration: add a remote runtime config for billing visibility.
-- This allows enabling/disabling billing UI and API flows without redeploy.

CREATE TABLE IF NOT EXISTS app_runtime_config (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_billing_visible boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO app_runtime_config (id, is_billing_visible)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE app_runtime_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read runtime config" ON app_runtime_config;
CREATE POLICY "Public can read runtime config"
ON app_runtime_config
FOR SELECT
TO anon, authenticated
USING (true);
