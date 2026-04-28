-- Migration: Allow users to add themselves as viewer to projects
-- Modifies RLS policy on project_members to allow authenticated users to self-add as viewer
-- Admins can still add any user with any role
-- Adds function to check project existence without requiring membership

-- ============================================================================
-- HELPER FUNCTION: Check if project exists (bypasses RLS for existence check)
-- ============================================================================

-- Function to check if a project exists by ID (bypasses RLS)
-- This allows users to verify project existence before trying to join
CREATE OR REPLACE FUNCTION project_exists(project_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM projects
    WHERE id = project_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATE RLS POLICY: Allow users to self-add as viewer
-- ============================================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Only admins can add project members" ON project_members;
DROP POLICY IF EXISTS "Admins can add project members" ON project_members;
DROP POLICY IF EXISTS "Users can add themselves as viewer" ON project_members;

-- Create new policy: Admins can add any user with any role
CREATE POLICY "Admins can add project members"
ON project_members
FOR INSERT
WITH CHECK (
  is_project_admin(project_id)
);

-- Create new policy: Users can add themselves as viewer
-- This allows any authenticated user who knows a project UUID to join as viewer
CREATE POLICY "Users can add themselves as viewer"
ON project_members
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
  AND role = 'viewer'
);

