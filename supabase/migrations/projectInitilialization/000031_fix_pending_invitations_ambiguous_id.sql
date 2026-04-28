-- Migration: Fix ambiguous "id" reference in get_pending_invitations()
--
-- Context:
-- The function returns a TABLE containing a column named "id".
-- In PL/pgSQL, OUT parameters are visible as variables, so unqualified "id"
-- references can become ambiguous.

CREATE OR REPLACE FUNCTION get_pending_invitations()
RETURNS TABLE (
  id uuid,
  project_id uuid,
  project_name text,
  role text,
  invited_by_name text,
  expires_at timestamptz,
  created_at timestamptz,
  token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_email text;
BEGIN
  SELECT au.email INTO v_user_email
  FROM auth.users AS au
  WHERE au.id = auth.uid();

  IF v_user_email IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    pi.id AS id,
    pi.project_id AS project_id,
    p.name AS project_name,
    pi.role AS role,
    COALESCE(up.display_name, up.email) AS invited_by_name,
    pi.expires_at AS expires_at,
    pi.created_at AS created_at,
    pi.token AS token
  FROM project_invitations AS pi
  JOIN projects AS p ON p.id = pi.project_id
  LEFT JOIN user_profiles AS up ON up.id = pi.invited_by
  WHERE pi.email = v_user_email
    AND pi.status = 'pending'
    AND pi.expires_at > now()
  ORDER BY pi.created_at DESC;
END;
$$;
