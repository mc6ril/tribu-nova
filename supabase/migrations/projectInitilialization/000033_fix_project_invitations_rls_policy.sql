-- Migration: fix project_invitations SELECT RLS policy.
--
-- The previous policy referenced auth.users directly, which can fail for
-- authenticated clients with "permission denied for table users" during
-- regular SELECT queries on project_invitations.

DROP POLICY IF EXISTS "Invited users can view own invitations"
  ON project_invitations;

CREATE POLICY "Invited users can view own invitations"
  ON project_invitations
  FOR SELECT
  TO authenticated
  USING (
    email IS NOT NULL
    AND status = 'pending'
    AND expires_at > now()
    AND lower(email) = lower(auth.email())
  );
