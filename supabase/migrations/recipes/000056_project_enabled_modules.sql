-- Persist enabled project modules so add-on views survive reloads and stay per project.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS enabled_modules text[] NOT NULL DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN public.projects.enabled_modules IS
  'Project-scoped modules enabled in the shell (for example: recipes).';

DROP FUNCTION IF EXISTS public.get_project_by_id(uuid);
DROP FUNCTION IF EXISTS public.create_project(text);

CREATE OR REPLACE FUNCTION public.get_project_by_id(p_project_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  short_code text,
  board_emoji text,
  enabled_modules text[],
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    public.projects.id,
    public.projects.name,
    public.projects.short_code,
    public.projects.board_emoji,
    public.projects.enabled_modules,
    public.projects.created_at,
    public.projects.updated_at
  FROM public.projects
  WHERE public.projects.id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

GRANT EXECUTE ON FUNCTION public.get_project_by_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_by_id(uuid) TO anon;

CREATE OR REPLACE FUNCTION public.create_project(project_name text)
RETURNS TABLE (
  id uuid,
  name text,
  short_code text,
  board_emoji text,
  enabled_modules text[],
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

  derived_short_code := public.derive_project_short_code(project_name);

  INSERT INTO public.projects (name, short_code, creator_email)
  VALUES (project_name, derived_short_code, current_user_email)
  RETURNING public.projects.id INTO new_project_id;

  PERFORM add_project_member_admin(new_project_id, current_user_id);

  RETURN QUERY
  SELECT
    public.projects.id,
    public.projects.name,
    public.projects.short_code,
    public.projects.board_emoji,
    public.projects.enabled_modules,
    public.projects.created_at,
    public.projects.updated_at
  FROM public.projects
  WHERE public.projects.id = new_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

GRANT EXECUTE ON FUNCTION public.create_project(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_project(text) TO anon;
