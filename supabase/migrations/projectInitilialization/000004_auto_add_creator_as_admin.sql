-- Migration: Auto-add project creator as admin and restrict project creation
-- Adds trigger to automatically add project creator as admin in project_members
-- Adds helper function to check if user has any project access
-- Updates project creation policy to only allow users without existing projects

-- ============================================================================
-- HELPER FUNCTION: Check if user has any project access
-- ============================================================================

-- Function to check if current user has access to any project
CREATE OR REPLACE FUNCTION has_any_project_access()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM project_members
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Auto-add project creator as admin
-- ============================================================================

-- Function to automatically add the project creator as admin
CREATE OR REPLACE FUNCTION auto_add_project_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the creator as admin in project_members
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'admin')
  ON CONFLICT (project_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Auto-add creator as admin when project is created
-- ============================================================================

-- Create trigger to automatically add project creator as admin
CREATE TRIGGER auto_add_project_creator_as_admin_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_project_creator_as_admin();

-- ============================================================================
-- UPDATE RLS POLICY: Restrict project creation to users without projects
-- ============================================================================

-- Drop the old policy
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;

-- Create new policy: users can only create projects if they have no existing project access
CREATE POLICY "Users can create projects only if they have no project access"
ON projects
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND NOT has_any_project_access()
);
