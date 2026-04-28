-- Migration 000055: Allow duplicate project short codes
--
-- Projects are uniquely identified by their UUID id.
-- short_code is a derived, human-readable display prefix and is not guaranteed
-- to be globally unique.

ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS uk_projects_short_code;

CREATE INDEX IF NOT EXISTS idx_projects_short_code
  ON public.projects (short_code);

