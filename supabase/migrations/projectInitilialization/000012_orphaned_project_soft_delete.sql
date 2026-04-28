-- Migration: Orphaned project soft-delete with reclaim flow
--
-- When the last member leaves a project (account deletion or future "leave" feature),
-- the project is marked as orphaned with a 30-day grace period.
-- Users who recreate their account can reclaim orphaned projects via email matching
-- using the creator_email stored at project creation time.

-- ============================================================================
-- STEP 1: Add orphaned tracking and creator_email columns to projects
-- ============================================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS orphaned_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS creator_email text DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_orphaned_at
  ON projects (orphaned_at)
  WHERE orphaned_at IS NOT NULL;

-- ============================================================================
-- STEP 2: Backfill creator_email for existing projects
-- ============================================================================

UPDATE projects p
SET creator_email = u.email
FROM project_members pm
JOIN auth.users u ON u.id = pm.user_id
WHERE pm.project_id = p.id
  AND pm.role = 'admin'
  AND p.creator_email IS NULL;

-- ============================================================================
-- STEP 2b: Backfill orphaned_at for projects that already have no members
-- ============================================================================

UPDATE projects p
SET orphaned_at = NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM project_members pm WHERE pm.project_id = p.id
)
AND p.orphaned_at IS NULL;

-- ============================================================================
-- STEP 3: Update create_project() to populate creator_email
-- ============================================================================

CREATE OR REPLACE FUNCTION create_project(project_name text)
RETURNS TABLE (
  id uuid,
  name text,
  short_code text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
DECLARE
  new_project_id uuid;
  current_user_id uuid;
  current_user_email text;
  derived_short_code text;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  SELECT u.email INTO current_user_email
  FROM auth.users u
  WHERE u.id = current_user_id;

  derived_short_code := upper(
    COALESCE(
      CASE
        WHEN array_length(
          regexp_split_to_array(
            regexp_replace(replace(trim(project_name), '_', ' '), '([a-z])([A-Z])', '\1 \2', 'g'),
            '\s+'
          ),
          1
        ) >= 2 THEN
          substring(
            (
              regexp_split_to_array(
                regexp_replace(replace(trim(project_name), '_', ' '), '([a-z])([A-Z])', '\1 \2', 'g'),
                '\s+'
              )
            )[1]
            from 1 for 1
          )
          ||
          substring(
            (
              regexp_split_to_array(
                regexp_replace(replace(trim(project_name), '_', ' '), '([a-z])([A-Z])', '\1 \2', 'g'),
                '\s+'
              )
            )[2]
            from 1 for 1
          )
        ELSE NULL
      END,
      CASE
        WHEN length(trim(coalesce(project_name, ''))) >= 2 THEN
          substring(trim(project_name) from 1 for 2)
        ELSE
          'PR'
      END
    )
  );

  INSERT INTO public.projects (name, short_code, creator_email)
  VALUES (project_name, derived_short_code, current_user_email)
  RETURNING public.projects.id INTO new_project_id;

  PERFORM add_project_member_admin(new_project_id, current_user_id);

  RETURN QUERY
  SELECT
    public.projects.id,
    public.projects.name,
    public.projects.short_code,
    public.projects.created_at,
    public.projects.updated_at
  FROM public.projects
  WHERE public.projects.id = new_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

-- ============================================================================
-- STEP 4: Trigger - mark project as orphaned when last member leaves
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_project_member_removed()
RETURNS TRIGGER AS $$
DECLARE
  remaining_count integer;
BEGIN
  SELECT COUNT(*) INTO remaining_count
  FROM project_members
  WHERE project_id = OLD.project_id;

  IF remaining_count = 0 THEN
    UPDATE projects
    SET orphaned_at = NOW()
    WHERE id = OLD.project_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

DROP TRIGGER IF EXISTS trg_project_member_removed ON project_members;
CREATE TRIGGER trg_project_member_removed
  AFTER DELETE ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_project_member_removed();

-- ============================================================================
-- STEP 5: Trigger - clear orphaned status when a member joins
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_project_member_added()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET orphaned_at = NULL
  WHERE id = NEW.project_id
    AND orphaned_at IS NOT NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

DROP TRIGGER IF EXISTS trg_project_member_added ON project_members;
CREATE TRIGGER trg_project_member_added
  AFTER INSERT ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_project_member_added();

-- ============================================================================
-- STEP 6: RPC - reclaim or join a project
-- If orphaned: adds user as admin and clears orphaned status.
-- If active: adds user as viewer (existing behavior).
-- ============================================================================

CREATE OR REPLACE FUNCTION reclaim_or_join_project(project_uuid uuid)
RETURNS TABLE (
  id uuid,
  name text,
  short_code text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
DECLARE
  current_user_id uuid;
  is_orphaned boolean;
  assigned_role text;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM projects WHERE projects.id = project_uuid) THEN
    RAISE EXCEPTION 'Project not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = project_uuid AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'User is already a member of this project'
      USING ERRCODE = '23505';
  END IF;

  SELECT (orphaned_at IS NOT NULL) INTO is_orphaned
  FROM projects
  WHERE projects.id = project_uuid;

  IF is_orphaned THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'viewer';
  END IF;

  ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;

  INSERT INTO project_members (project_id, user_id, role)
  VALUES (project_uuid, current_user_id, assigned_role)
  ON CONFLICT (project_id, user_id) DO UPDATE
  SET role = assigned_role;

  ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

  -- The AFTER INSERT trigger (handle_project_member_added) automatically
  -- clears orphaned_at.

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.short_code,
    p.created_at,
    p.updated_at
  FROM projects p
  WHERE p.id = project_uuid;

EXCEPTION
  WHEN OTHERS THEN
    ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

GRANT EXECUTE ON FUNCTION reclaim_or_join_project(uuid) TO authenticated;

-- ============================================================================
-- STEP 7: RPC - get reclaimable projects for current user
-- Returns orphaned projects where creator_email matches the current
-- user's email. SECURITY DEFINER bypasses RLS to find orphaned projects.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_reclaimable_projects()
RETURNS TABLE (
  id uuid,
  name text,
  short_code text,
  orphaned_at timestamptz
) AS $$
DECLARE
  current_email text;
BEGIN
  SELECT email INTO current_email
  FROM auth.users
  WHERE auth.users.id = auth.uid();

  IF current_email IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.short_code,
    p.orphaned_at
  FROM projects p
  WHERE p.creator_email = current_email
    AND p.orphaned_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

GRANT EXECUTE ON FUNCTION get_reclaimable_projects() TO authenticated;

-- ============================================================================
-- STEP 8: Cleanup function for expired orphaned projects
-- Deletes projects orphaned for more than 30 days.
-- Can be called via pg_cron, Edge Function, or manually.
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_orphaned_projects()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM projects
  WHERE orphaned_at IS NOT NULL
    AND orphaned_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';
