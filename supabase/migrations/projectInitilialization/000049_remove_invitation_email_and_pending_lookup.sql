-- Migration: remove the legacy invitation email field and the now-unused
-- email-based pending invitation lookup.
--
-- Invitation flows are link-based only. The application no longer binds
-- invitations to an email address nor queries pending invitations by email.

DROP POLICY IF EXISTS "Invited users can view own invitations"
  ON project_invitations;

DROP FUNCTION IF EXISTS get_pending_invitations();

DROP INDEX IF EXISTS idx_project_invitations_email;

ALTER TABLE project_invitations
  DROP CONSTRAINT IF EXISTS uk_project_invitations_project_email;

CREATE OR REPLACE FUNCTION decline_invitation(invitation_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_invitation record;
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
    RAISE EXCEPTION 'Invitation not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_invitation.expires_at < now() THEN
    UPDATE project_invitations
    SET status = 'expired', updated_at = now()
    WHERE id = v_invitation.id;

    RAISE EXCEPTION 'Invitation has expired' USING ERRCODE = 'P0003';
  END IF;

  DELETE FROM project_invitations
  WHERE id = v_invitation.id;
END;
$$;

ALTER TABLE project_invitations
  DROP COLUMN IF EXISTS email;
