-- Improve server-side ticket search performance for ILIKE '%term%' queries.
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

CREATE INDEX IF NOT EXISTS idx_tickets_title_trgm
ON public.tickets
USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_tickets_description_trgm
ON public.tickets
USING GIN (description gin_trgm_ops)
WHERE description IS NOT NULL;
