-- Migration: close legacy self-join paths on project membership.
--
-- Active projects must be joined through invitation links. Orphaned project
-- recovery remains supported, but only for the creator reclaiming a project
-- from the same email address.

DROP POLICY IF EXISTS "Users can add themselves as viewer"
  ON project_members;

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
  current_user_email text;
  v_project record;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT u.email INTO current_user_email
  FROM auth.users AS u
  WHERE u.id = current_user_id;

  SELECT p.* INTO v_project
  FROM public.projects AS p
  WHERE p.id = project_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.project_members AS pm
    WHERE pm.project_id = project_uuid
      AND pm.user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'User is already a member of this project'
      USING ERRCODE = '23505';
  END IF;

  IF current_user_email IS NULL
    OR v_project.orphaned_at IS NULL
    OR v_project.creator_email IS DISTINCT FROM current_user_email THEN
    -- Reuse the not-found branch so unauthorized callers cannot distinguish
    -- between an unknown project and a non-reclaimable one.
    RAISE EXCEPTION 'Project not found'
      USING ERRCODE = 'P0002';
  END IF;

  ALTER TABLE public.project_members DISABLE ROW LEVEL SECURITY;

  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (project_uuid, current_user_id, 'admin')
  ON CONFLICT (project_id, user_id) DO UPDATE
  SET role = 'admin';

  ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.short_code,
    p.created_at,
    p.updated_at
  FROM public.projects AS p
  WHERE p.id = project_uuid;

EXCEPTION
  WHEN OTHERS THEN
    ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

GRANT EXECUTE ON FUNCTION reclaim_or_join_project(uuid) TO authenticated;
