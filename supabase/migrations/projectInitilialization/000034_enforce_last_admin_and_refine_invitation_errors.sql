-- Migration: enforce project admin invariants in the database and
-- refine invitation acceptance errors for link-based flows.

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

  UPDATE project_invitations
  SET status = 'accepted', updated_at = now()
  WHERE id = v_invitation.id;

  SELECT p.id, p.name INTO v_project
  FROM projects AS p
  WHERE p.id = v_invitation.project_id;

  RETURN QUERY SELECT v_project.id, v_project.name, v_invitation.role;
END;
$$;

CREATE OR REPLACE FUNCTION prevent_last_admin_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  remaining_admins integer;
BEGIN
  IF TG_OP = 'DELETE' AND NOT EXISTS (
    SELECT 1
    FROM projects
    WHERE id = OLD.project_id
  ) THEN
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.role <> 'admin' OR NEW.role = 'admin' THEN
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.role <> 'admin' THEN
      RETURN OLD;
    END IF;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(OLD.project_id::text));

  SELECT COUNT(*) INTO remaining_admins
  FROM project_members
  WHERE project_id = OLD.project_id
    AND role = 'admin'
    AND id <> OLD.id;

  IF remaining_admins = 0 THEN
    RAISE EXCEPTION 'LAST_ADMIN_REQUIRED' USING ERRCODE = 'P0001';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_last_admin_change ON project_members;

CREATE TRIGGER trg_prevent_last_admin_change
  BEFORE UPDATE OF role OR DELETE ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION prevent_last_admin_change();
