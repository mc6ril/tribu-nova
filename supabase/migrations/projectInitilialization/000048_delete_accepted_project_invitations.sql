-- Migration: delete accepted invitations once they are consumed and
-- purge previously accepted rows to reduce project_invitations table size.

DELETE FROM project_invitations
WHERE status = 'accepted';

CREATE OR REPLACE FUNCTION accept_invitation(invitation_token text)
RETURNS TABLE (
  project_id uuid,
  project_name text,
  role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_invitation record;
  v_project record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated' USING ERRCODE = 'P0001';
  END IF;

  SELECT pi.* INTO v_invitation
  FROM project_invitations AS pi
  WHERE pi.token = invitation_token
    AND pi.status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or already used' USING ERRCODE = 'P0002';
  END IF;

  IF v_invitation.expires_at < now() THEN
    UPDATE project_invitations
    SET status = 'expired', updated_at = now()
    WHERE id = v_invitation.id;

    RAISE EXCEPTION 'Invitation has expired' USING ERRCODE = 'P0003';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM project_members AS pm
    WHERE pm.project_id = v_invitation.project_id
      AND pm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Already a member of this project' USING ERRCODE = 'P0004';
  END IF;

  INSERT INTO project_members (project_id, user_id, role)
  VALUES (v_invitation.project_id, auth.uid(), v_invitation.role);

  DELETE FROM project_invitations
  WHERE id = v_invitation.id;

  SELECT p.id, p.name INTO v_project
  FROM projects AS p
  WHERE p.id = v_invitation.project_id;

  RETURN QUERY SELECT v_project.id, v_project.name, v_invitation.role;
END;
$$;
