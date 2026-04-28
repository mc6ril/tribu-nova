-- Migration: Fix Supabase database linter security warnings
-- Addresses: function_search_path_mutable, rls_policy_always_true
--
-- 1. Drops 4 orphaned debug functions not tracked in migrations
-- 2. Sets search_path on all 13 tracked functions to prevent search path injection
-- 3. Tightens the overly permissive projects INSERT RLS policy

-- ============================================================================
-- STEP 1: Drop orphaned debug functions
-- These exist in the database but not in any migration file.
-- They were likely created manually during development/debugging.
-- Uses dynamic SQL to handle unknown parameter signatures.
-- ============================================================================

DO $$
DECLARE
  func_names text[] := ARRAY[
    'debug_can_create_project',
    'debug_user_project_memberships',
    'debug_test_project_creation_policy',
    'project_has_no_members'
  ];
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = ANY(func_names)
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s', r.signature);
  END LOOP;
END
$$;

-- ============================================================================
-- STEP 2: Set search_path on all tracked functions
-- Without an explicit search_path, SECURITY DEFINER functions are vulnerable
-- to search path injection attacks. Setting search_path = 'public' locks
-- resolution to the public schema where all application tables reside.
-- ============================================================================

-- From 000001_initial_schema.sql
ALTER FUNCTION update_updated_at_column() SET search_path = 'public';

-- From 000003_add_project_members_and_rls.sql
ALTER FUNCTION is_project_member(uuid) SET search_path = 'public';
ALTER FUNCTION get_project_role(uuid) SET search_path = 'public';
ALTER FUNCTION is_project_admin(uuid) SET search_path = 'public';
ALTER FUNCTION can_edit_project(uuid) SET search_path = 'public';

-- From 000004_auto_add_creator_as_admin.sql
ALTER FUNCTION has_any_project_access() SET search_path = 'public';
ALTER FUNCTION auto_add_project_creator_as_admin() SET search_path = 'public';

-- From 000005_allow_users_to_add_themselves_as_viewer.sql
ALTER FUNCTION project_exists(uuid) SET search_path = 'public';

-- From 000006_fix_project_creation_rls.sql
ALTER FUNCTION project_created_recently(uuid, integer) SET search_path = 'public';

-- From 000007_bypass_rls_with_function.sql
ALTER FUNCTION add_project_member_admin(uuid, uuid) SET search_path = 'public';

-- From 000008_add_ticket_epic_codes.sql (latest versions)
-- Uses dynamic SQL to cover all overloads of create_project
ALTER FUNCTION get_project_by_id(uuid) SET search_path = 'public';

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'create_project'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = ''public''', r.signature);
  END LOOP;
END
$$;

-- From 000009_project_stats_function.sql
ALTER FUNCTION get_projects_with_stats() SET search_path = 'public';

-- ============================================================================
-- STEP 3: Fix overly permissive projects INSERT RLS policy
-- The current policy uses WITH CHECK (true) which allows unrestricted inserts,
-- including from unauthenticated users. Since project creation is handled
-- through the create_project() SECURITY DEFINER function (which bypasses RLS),
-- we tighten this to require authentication at minimum.
-- ============================================================================

DROP POLICY IF EXISTS "Users can create projects" ON projects;

CREATE POLICY "Users can create projects"
ON projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
