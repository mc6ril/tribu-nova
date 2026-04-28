-- Remove the sprint model now that tickets are archived by completion/week rules.

ALTER TABLE IF EXISTS public.tickets
  DROP COLUMN IF EXISTS sprint_id;

DROP INDEX IF EXISTS public.idx_tickets_sprint;
DROP INDEX IF EXISTS public.idx_sprints_one_active_per_project;
DROP INDEX IF EXISTS public.idx_sprints_project_position;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) AND EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'sprints'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.sprints';
  END IF;
END $$;

DROP TABLE IF EXISTS public.sprints;
