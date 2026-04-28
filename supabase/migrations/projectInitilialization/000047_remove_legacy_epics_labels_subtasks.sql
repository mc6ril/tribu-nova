-- Remove legacy epics, labels, and subtasks after the board simplification.
-- Keeps history immutable while aligning the effective schema with the current product.

DO $$
DECLARE
  realtime_table text;
  realtime_tables text[] := ARRAY[
    'ticket_labels',
    'labels',
    'epics'
  ];
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    RETURN;
  END IF;

  FOREACH realtime_table IN ARRAY realtime_tables LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = realtime_table
    ) THEN
      EXECUTE format(
        'ALTER PUBLICATION supabase_realtime DROP TABLE public.%I',
        realtime_table
      );
    END IF;
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.allocate_epic_code_number(uuid);

DROP INDEX IF EXISTS public.idx_tickets_project_epic;
DROP INDEX IF EXISTS public.idx_tickets_epic_id;
DROP INDEX IF EXISTS public.idx_tickets_parent_id;

ALTER TABLE IF EXISTS public.tickets
  DROP CONSTRAINT IF EXISTS fk_tickets_epic,
  DROP CONSTRAINT IF EXISTS fk_tickets_parent;

ALTER TABLE IF EXISTS public.tickets
  DROP COLUMN IF EXISTS epic_id,
  DROP COLUMN IF EXISTS parent_id;

DROP TABLE IF EXISTS public.ticket_labels;
DROP TABLE IF EXISTS public.labels;
DROP TABLE IF EXISTS public.epics;

CREATE OR REPLACE FUNCTION public.get_projects_with_stats()
RETURNS TABLE (
  id uuid,
  name text,
  short_code text,
  created_at timestamptz,
  updated_at timestamptz,
  role text,
  member_count bigint,
  ticket_count bigint,
  in_progress_count bigint,
  completed_count bigint
)
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = ''
AS $$
  SELECT
    p.id,
    p.name,
    p.short_code,
    p.created_at,
    p.updated_at,
    pm_user.role,
    COALESCE(member_stats.member_count, 0) AS member_count,
    COALESCE(ticket_stats.ticket_count, 0) AS ticket_count,
    COALESCE(ticket_stats.in_progress_count, 0) AS in_progress_count,
    COALESCE(ticket_stats.completed_count, 0) AS completed_count
  FROM public.projects p
  INNER JOIN public.project_members pm_user
    ON pm_user.project_id = p.id
    AND pm_user.user_id = auth.uid()
  LEFT JOIN (
    SELECT
      pm.project_id,
      COUNT(*) AS member_count
    FROM public.project_members pm
    GROUP BY pm.project_id
  ) member_stats
    ON member_stats.project_id = p.id
  LEFT JOIN (
    SELECT
      t.project_id,
      COUNT(*) AS ticket_count,
      COUNT(*) FILTER (WHERE t.status = 'in-progress') AS in_progress_count,
      COUNT(*) FILTER (WHERE t.status = 'completed') AS completed_count
    FROM public.tickets t
    GROUP BY t.project_id
  ) ticket_stats
    ON ticket_stats.project_id = p.id
  ORDER BY p.created_at DESC;
$$;

COMMENT ON FUNCTION public.get_projects_with_stats() IS
'Returns all projects accessible to the current user with their role and aggregated statistics.
Uses SECURITY INVOKER to respect RLS policies. Statistics include:
- member_count: Total number of members in the project
- ticket_count: Total number of tickets in the project
- in_progress_count: Tickets with status "in-progress"
- completed_count: Tickets with status "completed"';
