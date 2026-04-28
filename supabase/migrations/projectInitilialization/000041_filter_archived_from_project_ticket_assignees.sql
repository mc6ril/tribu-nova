-- Keep project-scoped assignee hydration aligned with the active ticket board:
-- archived tickets should not contribute assignee payloads in standard project views.

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
  WHERE t.project_id = p_project_id
    AND t.archived_at IS NULL
  ORDER BY ta.assigned_at ASC;
$$;
