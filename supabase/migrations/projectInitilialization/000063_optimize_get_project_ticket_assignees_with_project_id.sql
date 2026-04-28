-- Migration: Optimize get_project_ticket_assignees using ticket_assignees.project_id
--
-- ticket_assignees.project_id is denormalized from tickets.project_id.
-- Filter on ticket_assignees first to reduce work, while still joining tickets
-- to enforce archived ticket exclusion.

CREATE OR REPLACE FUNCTION get_project_ticket_assignees(p_project_id uuid)
RETURNS TABLE (
  ticket_id uuid,
  user_id uuid,
  display_name text,
  avatar_url text,
  assigned_at timestamptz
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = 'public'
STABLE
AS $$
  SELECT
    ta.ticket_id,
    ta.user_id,
    up.display_name,
    up.avatar_url,
    ta.assigned_at
  FROM ticket_assignees ta
  JOIN tickets t ON t.id = ta.ticket_id
  JOIN user_profiles up ON up.id = ta.user_id
  WHERE ta.project_id = p_project_id
    AND t.archived_at IS NULL
  ORDER BY ta.assigned_at ASC;
$$;

