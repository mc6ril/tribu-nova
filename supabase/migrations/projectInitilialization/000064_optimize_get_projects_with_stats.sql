-- Migration: Optimize get_projects_with_stats by scoping aggregations to the
-- current user's projects before counting members and tickets.

CREATE OR REPLACE FUNCTION public.get_projects_with_stats()
RETURNS TABLE (
  id uuid,
  name text,
  short_code text,
  board_emoji text,
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
  WITH my_projects AS (
    SELECT
      p.id,
      p.name,
      p.short_code,
      p.board_emoji,
      p.created_at,
      p.updated_at,
      pm_user.role
    FROM public.projects p
    INNER JOIN public.project_members pm_user
      ON pm_user.project_id = p.id
      AND pm_user.user_id = auth.uid()
  ),
  member_stats AS (
    SELECT
      pm.project_id,
      COUNT(*) AS member_count
    FROM public.project_members pm
    INNER JOIN my_projects mp
      ON mp.id = pm.project_id
    GROUP BY pm.project_id
  ),
  ticket_stats AS (
    SELECT
      t.project_id,
      COUNT(*) AS ticket_count,
      COUNT(*) FILTER (WHERE c.state = 'in_progress') AS in_progress_count,
      COUNT(*) FILTER (WHERE c.state = 'done') AS completed_count
    FROM public.tickets t
    INNER JOIN my_projects mp
      ON mp.id = t.project_id
    LEFT JOIN public.columns c
      ON c.id = t.column_id
    GROUP BY t.project_id
  )
  SELECT
    mp.id,
    mp.name,
    mp.short_code,
    mp.board_emoji,
    mp.created_at,
    mp.updated_at,
    mp.role,
    COALESCE(member_stats.member_count, 0) AS member_count,
    COALESCE(ticket_stats.ticket_count, 0) AS ticket_count,
    COALESCE(ticket_stats.in_progress_count, 0) AS in_progress_count,
    COALESCE(ticket_stats.completed_count, 0) AS completed_count
  FROM my_projects mp
  LEFT JOIN member_stats
    ON member_stats.project_id = mp.id
  LEFT JOIN ticket_stats
    ON ticket_stats.project_id = mp.id
  ORDER BY mp.created_at DESC;
$$;

COMMENT ON FUNCTION public.get_projects_with_stats() IS
'Returns all projects accessible to the current user with their role and aggregated statistics.
Uses SECURITY INVOKER to respect RLS policies. Statistics include:
- member_count: Total number of members in the project
- ticket_count: Total number of tickets in the project
- in_progress_count: Tickets in an in-progress workflow column
- completed_count: Tickets in a done workflow column';
