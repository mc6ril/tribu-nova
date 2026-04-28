-- Migration: refactor app_runtime_config into key/value entries.
-- Goal: allow runtime flags and A/B configs with JSON/boolean/number/text values.
-- Shape: one row = one config entry (like Firebase Remote Config).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'app_runtime_config'
  ) THEN
    -- Legacy schema: singleton row with an is_billing_visible column.
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'app_runtime_config'
        AND column_name = 'is_billing_visible'
    ) THEN
      ALTER TABLE public.app_runtime_config RENAME TO app_runtime_config_legacy;
    ELSE
      -- Already refactored. Nothing to do.
      RETURN;
    END IF;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.app_runtime_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_runtime_config_key_non_empty CHECK (char_length(key) > 0),
  CONSTRAINT app_runtime_config_value_type CHECK (
    jsonb_typeof(value) IN ('object', 'array', 'string', 'number', 'boolean', 'null')
  )
);

-- Default entry (safe for first installs and local resets).
INSERT INTO public.app_runtime_config (key, value)
VALUES ('is_billing_visible', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Migrate legacy value if present.
INSERT INTO public.app_runtime_config (key, value, updated_at)
SELECT
  'is_billing_visible',
  to_jsonb(is_billing_visible),
  updated_at
FROM public.app_runtime_config_legacy
WHERE id = 1
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = EXCLUDED.updated_at;

ALTER TABLE public.app_runtime_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read runtime config" ON public.app_runtime_config;
CREATE POLICY "Public can read runtime config"
ON public.app_runtime_config
FOR SELECT
TO anon, authenticated
USING (true);

DROP TABLE IF EXISTS public.app_runtime_config_legacy;

