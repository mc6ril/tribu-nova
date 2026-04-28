-- Migration: Project invitation system
--
-- Allows project admins to invite users by email.
-- Invited users receive a token-based link to accept or decline.
-- Accepted invitations automatically add the user to project_members.

-- ============================================================================
-- STEP 1: Create project_invitations table
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uk_project_invitations_project_email UNIQUE (project_id, email)
);

CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id
  ON project_invitations (project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_email
  ON project_invitations (email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token
  ON project_invitations (token);
CREATE INDEX IF NOT EXISTS idx_project_invitations_status
  ON project_invitations (status)
  WHERE status = 'pending';

CREATE TRIGGER update_project_invitations_updated_at
  BEFORE UPDATE ON project_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 2: Enable RLS on project_invitations
-- ============================================================================

ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Project members can see invitations for their project
CREATE POLICY "Project members can view invitations"
  ON project_invitations
  FOR SELECT
  TO authenticated
  USING (is_project_member(project_id));

-- Invited users can see their own pending invitations (by email)
CREATE POLICY "Invited users can view own invitations"
  ON project_invitations
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending'
  );

-- Only project admins can create invitations
CREATE POLICY "Project admins can create invitations"
  ON project_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (is_project_admin(project_id));

-- Only project admins can update invitations (revoke)
CREATE POLICY "Project admins can update invitations"
  ON project_invitations
  FOR UPDATE
  TO authenticated
  USING (is_project_admin(project_id))
  WITH CHECK (is_project_admin(project_id));

-- Only project admins can delete invitations
CREATE POLICY "Project admins can delete invitations"
  ON project_invitations
  FOR DELETE
  TO authenticated
  USING (is_project_admin(project_id));

-- ============================================================================
-- STEP 3: RPC to accept an invitation
-- ============================================================================

-- Accepts a pending invitation by token.
-- Validates: token exists, not expired, status is pending, user email matches.
-- Adds user to project_members and updates invitation status.
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
  v_user_email text;
  v_project record;
BEGIN
  -- Get current user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'User not authenticated' USING ERRCODE = 'P0001';
  END IF;

  -- Find and validate the invitation
  SELECT pi.* INTO v_invitation
  FROM project_invitations pi
  WHERE pi.token = invitation_token
    AND pi.status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or already used' USING ERRCODE = 'P0002';
  END IF;

  IF v_invitation.expires_at < now() THEN
    -- Mark as expired
    UPDATE project_invitations
    SET status = 'expired', updated_at = now()
    WHERE id = v_invitation.id;
    RAISE EXCEPTION 'Invitation has expired' USING ERRCODE = 'P0003';
  END IF;

  IF v_invitation.email != v_user_email THEN
    RAISE EXCEPTION 'Invitation is for a different email address' USING ERRCODE = 'P0004';
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = v_invitation.project_id
      AND pm.user_id = auth.uid()
  ) THEN
    -- Mark invitation as accepted anyway
    UPDATE project_invitations
    SET status = 'accepted', updated_at = now()
    WHERE id = v_invitation.id;
    RAISE EXCEPTION 'Already a member of this project' USING ERRCODE = '23505';
  END IF;

  -- Add user to project_members
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (v_invitation.project_id, auth.uid(), v_invitation.role);

  -- Mark invitation as accepted
  UPDATE project_invitations
  SET status = 'accepted', updated_at = now()
  WHERE id = v_invitation.id;

  -- Get project info for the response
  SELECT p.id, p.name INTO v_project
  FROM projects p
  WHERE p.id = v_invitation.project_id;

  RETURN QUERY SELECT v_project.id, v_project.name, v_invitation.role;
END;
$$;

-- ============================================================================
-- STEP 4: RPC to decline an invitation
-- ============================================================================

CREATE OR REPLACE FUNCTION decline_invitation(invitation_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_invitation record;
  v_user_email text;
BEGIN
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  SELECT pi.* INTO v_invitation
  FROM project_invitations pi
  WHERE pi.token = invitation_token
    AND pi.status = 'pending'
    AND pi.email = v_user_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE project_invitations
  SET status = 'declined', updated_at = now()
  WHERE id = v_invitation.id;
END;
$$;

-- ============================================================================
-- STEP 5: RPC to list pending invitations for current user
-- ============================================================================

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
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  IF v_user_email IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    pi.id,
    pi.project_id,
    p.name AS project_name,
    pi.role,
    COALESCE(up.display_name, up.email) AS invited_by_name,
    pi.expires_at,
    pi.created_at,
    pi.token
  FROM project_invitations pi
  JOIN projects p ON p.id = pi.project_id
  LEFT JOIN user_profiles up ON up.id = pi.invited_by
  WHERE pi.email = v_user_email
    AND pi.status = 'pending'
    AND pi.expires_at > now()
  ORDER BY pi.created_at DESC;
END;
$$;
