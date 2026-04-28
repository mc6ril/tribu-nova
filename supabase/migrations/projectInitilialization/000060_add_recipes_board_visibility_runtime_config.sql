-- Migration: add runtime config key for recipes board visibility.
-- One row = one runtime config entry (key/value).

INSERT INTO public.app_runtime_config (key, value)
VALUES ('is_recipes_board_visible', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

