-- Migration: Fix project creation RLS issue
-- This migration fixes the RLS policies for project creation
-- It ensures proper permissions and creates working policies

-- ============================================================================
-- STEP 1: Remove ALL existing policies for projects
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'projects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON projects', r.policyname);
  END LOOP;
END
$$;

-- ============================================================================
-- STEP 2: Ensure schema and table permissions
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON projects TO authenticated;
GRANT INSERT ON projects TO anon;

-- ============================================================================
-- STEP 3: Create ONE simple policy
-- ============================================================================

CREATE POLICY "Users can create projects"
ON projects
FOR INSERT
TO public
WITH CHECK (true);

-- ============================================================================
-- STEP 4: Create helper function for trigger policy
-- ============================================================================

-- Function to check if project was created recently (bypasses RLS)
CREATE OR REPLACE FUNCTION project_created_recently(project_uuid uuid, seconds_ago integer DEFAULT 10)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM projects
    WHERE id = project_uuid
      AND created_at > now() - (seconds_ago || ' seconds')::interval
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: Fix project_members policies for trigger
-- ============================================================================

-- Remove duplicate policies
DROP POLICY IF EXISTS "Trigger can add project creator as admin" ON project_members;
DROP POLICY IF EXISTS "Project creator can add themselves as admin" ON project_members;

-- Ensure permissions
GRANT INSERT ON project_members TO authenticated;
GRANT INSERT ON project_members TO anon;

-- Create trigger policy using helper function
CREATE POLICY "Trigger can add project creator as admin"
ON project_members
FOR INSERT
TO authenticated
WITH CHECK (
  role = 'admin'
  AND project_created_recently(project_id, 10)
);

