-- Migration: Add get_projects_with_stats RPC function
-- Description: Optimized function to fetch projects with member and ticket statistics
-- for workspace overview display. Uses lateral joins for efficient aggregation.

-- Create the RPC function
CREATE OR REPLACE FUNCTION get_projects_with_stats()
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
  FROM projects p
  INNER JOIN project_members pm_user 
    ON pm_user.project_id = p.id 
    AND pm_user.user_id = auth.uid()
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS member_count
    FROM project_members pm
    WHERE pm.project_id = p.id
  ) member_stats ON true
  LEFT JOIN LATERAL (
    SELECT 
      COUNT(*) AS ticket_count,
      COUNT(*) FILTER (WHERE t.status = 'in-progress') AS in_progress_count,
      COUNT(*) FILTER (WHERE t.status = 'completed') AS completed_count
    FROM tickets t
    WHERE t.project_id = p.id
      AND t.parent_id IS NULL  -- Exclude subtasks from counts
  ) ticket_stats ON true
  ORDER BY p.created_at DESC;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION get_projects_with_stats() IS 
'Returns all projects accessible to the current user with their role and aggregated statistics.
Uses SECURITY INVOKER to respect RLS policies. Statistics include:
- member_count: Total number of members in the project
- ticket_count: Total number of top-level tickets (excludes subtasks)
- in_progress_count: Tickets with status "in-progress"
- completed_count: Tickets with status "completed"';
