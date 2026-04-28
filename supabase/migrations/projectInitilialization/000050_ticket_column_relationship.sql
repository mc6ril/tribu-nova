-- Realign board workflow semantics:
-- - columns.status becomes columns.key (stable technical identifier)
-- - tickets reference columns directly through column_id
-- - completed / archival logic relies on columns.state

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'columns'
      AND column_name = 'status'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'columns'
      AND column_name = 'key'
  ) THEN
    ALTER TABLE public.columns RENAME COLUMN status TO key;
  END IF;
END $$;

UPDATE public.columns
SET key = btrim(key);

WITH ranked_keys AS (
  SELECT
    c.id,
    btrim(c.key) AS trimmed_key,
    row_number() OVER (
      PARTITION BY c.board_id, lower(btrim(c.key))
      ORDER BY c.position, c.created_at, c.id
    ) AS occurrence_rank
  FROM public.columns c
)
UPDATE public.columns c
SET key = CASE
  WHEN ranked_keys.occurrence_rank = 1 THEN ranked_keys.trimmed_key
  ELSE ranked_keys.trimmed_key || '-' || substring(c.id::text, 1, 8)
END
FROM ranked_keys
WHERE ranked_keys.id = c.id;

DROP INDEX IF EXISTS public.uq_columns_board_key_normalized;
CREATE UNIQUE INDEX IF NOT EXISTS uq_columns_board_key_normalized
  ON public.columns (board_id, lower(btrim(key)));

COMMENT ON COLUMN public.columns.key IS
'Stable technical column key. User-facing label lives in columns.name.';

ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS column_id uuid;

UPDATE public.tickets t
SET column_id = (
  SELECT c.id
  FROM public.boards b
  JOIN public.columns c
    ON c.board_id = b.id
  WHERE b.project_id = t.project_id
    AND lower(btrim(c.key)) = lower(btrim(t.status))
  ORDER BY c.position, c.created_at, c.id
  LIMIT 1
)
WHERE t.column_id IS NULL;

UPDATE public.tickets t
SET column_id = (
  SELECT c.id
  FROM public.boards b
  JOIN public.columns c
    ON c.board_id = b.id
  WHERE b.project_id = t.project_id
    AND c.state = CASE
      WHEN lower(btrim(t.status)) IN (
        'done',
        'completed',
        'complete',
        'closed',
        'resolved',
        'finished',
        'finit',
        'termine',
        'terminé'
      ) THEN 'done'
      WHEN lower(btrim(t.status)) IN (
        'in-progress',
        'in progress',
        'wip',
        'doing',
        'active',
        'ongoing',
        'started'
      ) THEN 'in_progress'
      ELSE 'todo'
    END
  ORDER BY c.position, c.created_at, c.id
  LIMIT 1
)
WHERE t.column_id IS NULL;

UPDATE public.tickets t
SET column_id = (
  SELECT c.id
  FROM public.boards b
  JOIN public.columns c
    ON c.board_id = b.id
  WHERE b.project_id = t.project_id
  ORDER BY c.position, c.created_at, c.id
  LIMIT 1
)
WHERE t.column_id IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.tickets
    WHERE column_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Unable to backfill tickets.column_id for every ticket';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_tickets_column'
  ) THEN
    ALTER TABLE public.tickets
    ADD CONSTRAINT fk_tickets_column
    FOREIGN KEY (column_id) REFERENCES public.columns(id)
    ON DELETE RESTRICT;
  END IF;
END $$;

ALTER TABLE public.tickets
ALTER COLUMN column_id SET NOT NULL;

CREATE OR REPLACE FUNCTION public.validate_ticket_column_project_match()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.columns c
    JOIN public.boards b
      ON b.id = c.board_id
    WHERE c.id = NEW.column_id
      AND b.project_id = NEW.project_id
  ) THEN
    RAISE EXCEPTION
      'Ticket column must belong to the same project as the ticket'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_ticket_column_project_match
  ON public.tickets;

CREATE TRIGGER trg_validate_ticket_column_project_match
  BEFORE INSERT OR UPDATE OF project_id, column_id
  ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_ticket_column_project_match();

DROP FUNCTION IF EXISTS public.move_and_reorder_ticket(uuid, text, integer, jsonb);
DROP FUNCTION IF EXISTS public.move_and_reorder_ticket(uuid, text, integer, timestamptz, jsonb);

DROP INDEX IF EXISTS public.idx_tickets_status;
DROP INDEX IF EXISTS public.idx_tickets_project_status_position;
DROP INDEX IF EXISTS public.idx_tickets_project_active_status_position;

ALTER TABLE public.tickets
DROP COLUMN IF EXISTS status;

CREATE INDEX IF NOT EXISTS idx_tickets_column_id
  ON public.tickets(column_id);

CREATE INDEX IF NOT EXISTS idx_tickets_project_column_position
  ON public.tickets(project_id, column_id, position);

CREATE INDEX IF NOT EXISTS idx_tickets_project_active_column_position
  ON public.tickets(project_id, column_id, position)
  WHERE archived_at IS NULL;

COMMENT ON COLUMN public.tickets.column_id IS
'Explicit workflow column reference. Replaces legacy free-form tickets.status.';

CREATE OR REPLACE FUNCTION public.move_and_reorder_ticket(
  p_ticket_id uuid,
  p_column_id uuid,
  p_position integer,
  p_completed_at timestamptz,
  p_positions jsonb
)
RETURNS SETOF public.tickets
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.tickets
  SET
    column_id = p_column_id,
    position = p_position,
    completed_at = p_completed_at,
    updated_at = now()
  WHERE id = p_ticket_id;

  UPDATE public.tickets
  SET
    position = (elem->>'position')::integer,
    updated_at = now()
  FROM jsonb_array_elements(p_positions) AS elem
  WHERE public.tickets.id = (elem->>'id')::uuid
    AND public.tickets.id <> p_ticket_id;

  RETURN QUERY
  SELECT public.tickets.*
  FROM public.tickets
  WHERE public.tickets.id = p_ticket_id
    OR public.tickets.id IN (
      SELECT (elem->>'id')::uuid
      FROM jsonb_array_elements(p_positions) AS elem
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.archive_completed_tickets_batch(
  p_now timestamptz DEFAULT now(),
  p_time_zone text DEFAULT 'Europe/Paris'
)
RETURNS integer AS $$
DECLARE
  current_week_start_local timestamp;
  completed_before timestamptz;
  archived_count integer;
BEGIN
  current_week_start_local := date_trunc('week', p_now AT TIME ZONE p_time_zone);
  completed_before := current_week_start_local AT TIME ZONE p_time_zone;

  UPDATE public.tickets t
  SET
    archived_at = p_now,
    archived_week_start = date_trunc(
      'week',
      t.completed_at AT TIME ZONE p_time_zone
    )::date
  WHERE t.completed_at IS NOT NULL
    AND t.archived_at IS NULL
    AND t.completed_at < completed_before
    AND EXISTS (
      SELECT 1
      FROM public.columns c
      WHERE c.id = t.column_id
        AND c.state = 'done'
    );

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

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
      COUNT(*) FILTER (WHERE c.state = 'in_progress') AS in_progress_count,
      COUNT(*) FILTER (WHERE c.state = 'done') AS completed_count
    FROM public.tickets t
    LEFT JOIN public.columns c
      ON c.id = t.column_id
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
- in_progress_count: Tickets in an in-progress workflow column
- completed_count: Tickets in a done workflow column';
