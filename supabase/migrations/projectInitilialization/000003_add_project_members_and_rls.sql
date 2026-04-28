-- Migration: Add project members table and Row Level Security policies
-- Creates project_members table for user-project relationships with roles
-- Enables RLS on all tables and creates policies for secure access control

-- ============================================================================
-- PROJECT MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT uk_project_members_project_user UNIQUE (project_id, user_id)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_user ON project_members(project_id, user_id);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_project_members_updated_at BEFORE UPDATE ON project_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTION: Check if user is project member
-- ============================================================================

-- Function to check if current user is a member of a project
CREATE OR REPLACE FUNCTION is_project_member(project_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM project_members
    WHERE project_id = project_uuid
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Get user role in project
-- ============================================================================

-- Function to get current user's role in a project (returns NULL if not a member)
CREATE OR REPLACE FUNCTION get_project_role(project_uuid uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role
    FROM project_members
    WHERE project_id = project_uuid
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================================================

-- Function to check if current user is admin of a project
CREATE OR REPLACE FUNCTION is_project_admin(project_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM project_members
    WHERE project_id = project_uuid
      AND user_id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if user can edit (admin or member)
-- ============================================================================

-- Function to check if current user can edit (admin or member role)
CREATE OR REPLACE FUNCTION can_edit_project(project_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM project_members
    WHERE project_id = project_uuid
      AND user_id = auth.uid()
      AND role IN ('admin', 'member')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: PROJECTS
-- ============================================================================

-- Users can view projects where they are members
CREATE POLICY "Users can view projects where they are members"
ON projects
FOR SELECT
USING (is_project_member(id));

-- Only admins can insert new projects (membership is handled separately)
-- Note: For now, we allow authenticated users to create projects
-- This can be restricted later if needed
CREATE POLICY "Authenticated users can create projects"
ON projects
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update projects where they have edit permission (admin or member)
CREATE POLICY "Users can update projects where they have edit permission"
ON projects
FOR UPDATE
USING (can_edit_project(id))
WITH CHECK (can_edit_project(id));

-- Only admins can delete projects
CREATE POLICY "Only admins can delete projects"
ON projects
FOR DELETE
USING (is_project_admin(id));

-- ============================================================================
-- RLS POLICIES: PROJECT MEMBERS
-- ============================================================================

-- Users can view project members for projects where they are members
CREATE POLICY "Users can view project members for their projects"
ON project_members
FOR SELECT
USING (is_project_member(project_id));

-- Only admins can add members to projects
CREATE POLICY "Only admins can add project members"
ON project_members
FOR INSERT
WITH CHECK (is_project_admin(project_id));

-- Only admins can update project members (change roles)
CREATE POLICY "Only admins can update project members"
ON project_members
FOR UPDATE
USING (is_project_admin(project_id))
WITH CHECK (is_project_admin(project_id));

-- Only admins can remove project members
CREATE POLICY "Only admins can remove project members"
ON project_members
FOR DELETE
USING (is_project_admin(project_id));

-- ============================================================================
-- RLS POLICIES: TICKETS
-- ============================================================================

-- Users can view tickets for projects where they are members
CREATE POLICY "Users can view tickets for their projects"
ON tickets
FOR SELECT
USING (is_project_member(project_id));

-- Users can create tickets if they have edit permission (admin or member)
CREATE POLICY "Users can create tickets if they have edit permission"
ON tickets
FOR INSERT
WITH CHECK (can_edit_project(project_id));

-- Users can update tickets if they have edit permission (admin or member)
CREATE POLICY "Users can update tickets if they have edit permission"
ON tickets
FOR UPDATE
USING (can_edit_project(project_id))
WITH CHECK (can_edit_project(project_id));

-- Users can delete tickets if they have edit permission (admin or member)
CREATE POLICY "Users can delete tickets if they have edit permission"
ON tickets
FOR DELETE
USING (can_edit_project(project_id));

-- ============================================================================
-- RLS POLICIES: EPICS
-- ============================================================================

-- Users can view epics for projects where they are members
CREATE POLICY "Users can view epics for their projects"
ON epics
FOR SELECT
USING (is_project_member(project_id));

-- Users can create epics if they have edit permission (admin or member)
CREATE POLICY "Users can create epics if they have edit permission"
ON epics
FOR INSERT
WITH CHECK (can_edit_project(project_id));

-- Users can update epics if they have edit permission (admin or member)
CREATE POLICY "Users can update epics if they have edit permission"
ON epics
FOR UPDATE
USING (can_edit_project(project_id))
WITH CHECK (can_edit_project(project_id));

-- Users can delete epics if they have edit permission (admin or member)
CREATE POLICY "Users can delete epics if they have edit permission"
ON epics
FOR DELETE
USING (can_edit_project(project_id));

-- ============================================================================
-- RLS POLICIES: BOARDS
-- ============================================================================

-- Users can view boards for projects where they are members
CREATE POLICY "Users can view boards for their projects"
ON boards
FOR SELECT
USING (is_project_member(project_id));

-- Boards are created automatically with projects, so we allow authenticated users
CREATE POLICY "Authenticated users can create boards"
ON boards
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND is_project_member(project_id));

-- Users can update boards if they have edit permission (admin or member)
CREATE POLICY "Users can update boards if they have edit permission"
ON boards
FOR UPDATE
USING (can_edit_project(project_id))
WITH CHECK (can_edit_project(project_id));

-- Boards are deleted with projects (CASCADE), so we don't need a DELETE policy
-- But we can add one for explicit board deletion if needed

-- ============================================================================
-- RLS POLICIES: COLUMNS
-- ============================================================================

-- Users can view columns for boards where they are project members
CREATE POLICY "Users can view columns for their projects"
ON columns
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM boards
    WHERE boards.id = columns.board_id
      AND is_project_member(boards.project_id)
  )
);

-- Users can create columns if they have edit permission (admin or member)
CREATE POLICY "Users can create columns if they have edit permission"
ON columns
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM boards
    WHERE boards.id = columns.board_id
      AND can_edit_project(boards.project_id)
  )
);

-- Users can update columns if they have edit permission (admin or member)
CREATE POLICY "Users can update columns if they have edit permission"
ON columns
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM boards
    WHERE boards.id = columns.board_id
      AND can_edit_project(boards.project_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM boards
    WHERE boards.id = columns.board_id
      AND can_edit_project(boards.project_id)
  )
);

-- Users can delete columns if they have edit permission (admin or member)
CREATE POLICY "Users can delete columns if they have edit permission"
ON columns
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM boards
    WHERE boards.id = columns.board_id
      AND can_edit_project(boards.project_id)
  )
);
