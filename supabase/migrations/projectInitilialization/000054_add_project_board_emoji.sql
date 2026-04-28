-- Board emoji for project (separate from name and short_code; short_code stays 2-letter text).

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS board_emoji text NOT NULL DEFAULT '📋';

COMMENT ON COLUMN public.projects.board_emoji IS
  'Emoji shown for the project board; must not be mixed into name or short_code.';

CREATE OR REPLACE FUNCTION public.derive_project_short_code(project_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  WITH normalized_name AS (
    SELECT trim(
      regexp_replace(
        regexp_replace(
          replace(coalesce(project_name, ''), '_', ' '),
          '([[:lower:]])([[:upper:]])',
          '\1 \2',
          'g'
        ),
        '[^[:alpha:]\s]+',
        '',
        'g'
      )
    ) AS value
  ),
  split_words AS (
    SELECT
      value,
      regexp_split_to_array(value, '\s+') AS words
    FROM normalized_name
  )
  SELECT upper(
    COALESCE(
      CASE
        WHEN array_length(words, 1) >= 2
          AND length(coalesce(words[1], '')) > 0
          AND length(coalesce(words[2], '')) > 0
        THEN
          substring(words[1] from 1 for 1)
          ||
          substring(words[2] from 1 for 1)
        ELSE NULL
      END,
      CASE
        WHEN length(value) >= 2 THEN substring(value from 1 for 2)
        ELSE 'PR'
      END
    )
  )
  FROM split_words;
$$;

CREATE OR REPLACE FUNCTION public.normalize_project_short_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  normalized_short_code text;
BEGIN
  normalized_short_code := upper(btrim(coalesce(NEW.short_code, '')));

  IF normalized_short_code ~ '^[[:alpha:]]{2}$' THEN
    NEW.short_code := normalized_short_code;
  ELSE
    NEW.short_code := public.derive_project_short_code(NEW.name);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_projects_short_code ON public.projects;
CREATE TRIGGER ensure_projects_short_code
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_project_short_code();

UPDATE public.projects
SET short_code = public.derive_project_short_code(name)
WHERE short_code IS NULL
   OR upper(btrim(short_code)) !~ '^[[:alpha:]]{2}$';

ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS chk_projects_short_code_length;

ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS chk_projects_short_code_letters;

ALTER TABLE public.projects
ADD CONSTRAINT chk_projects_short_code_letters
CHECK (upper(btrim(short_code)) ~ '^[[:alpha:]]{2}$');

DROP FUNCTION IF EXISTS public.get_project_by_id(uuid);
DROP FUNCTION IF EXISTS public.create_project(text);
DROP FUNCTION IF EXISTS public.get_projects_with_stats();

-- get_project_by_id: include board_emoji
CREATE OR REPLACE FUNCTION public.get_project_by_id(p_project_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  short_code text,
  board_emoji text,
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
    public.projects.created_at,
    public.projects.updated_at
  FROM public.projects
  WHERE public.projects.id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

GRANT EXECUTE ON FUNCTION public.get_project_by_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_by_id(uuid) TO anon;

-- create_project: return board_emoji (column has default on insert)
CREATE OR REPLACE FUNCTION public.create_project(project_name text)
RETURNS TABLE (
  id uuid,
  name text,
  short_code text,
  board_emoji text,
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
    public.projects.created_at,
    public.projects.updated_at
  FROM public.projects
  WHERE public.projects.id = new_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

GRANT EXECUTE ON FUNCTION public.create_project(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_project(text) TO anon;

-- Workspace list: include board_emoji
CREATE OR REPLACE FUNCTION public.get_projects_with_stats()
RETURNS TABLE (
  id uuid,
  name text,
  short_code text,
  board_emoji text,
  created_at timestamptz,
  updated_at timestamptz,
  role text,
  member_count bigint,
  ticket_count bigint,
  in_progress_count bigint,
  completed_count bigint
)
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = ''
AS $$
  SELECT
    p.id,
    p.name,
    p.short_code,
    p.board_emoji,
    p.created_at,
    p.updated_at,
    pm_user.role,
    COALESCE(member_stats.member_count, 0) AS member_count,
    COALESCE(ticket_stats.ticket_count, 0) AS ticket_count,
    COALESCE(ticket_stats.in_progress_count, 0) AS in_progress_count,
    COALESCE(ticket_stats.completed_count, 0) AS completed_count
  FROM public.projects p
  INNER JOIN public.project_members pm_user
    ON pm_user.project_id = p.id
    AND pm_user.user_id = auth.uid()
  LEFT JOIN (
    SELECT
      pm.project_id,
      COUNT(*) AS member_count
    FROM public.project_members pm
    GROUP BY pm.project_id
  ) member_stats
    ON member_stats.project_id = p.id
  LEFT JOIN (
    SELECT
      t.project_id,
      COUNT(*) AS ticket_count,
      COUNT(*) FILTER (WHERE c.state = 'in_progress') AS in_progress_count,
      COUNT(*) FILTER (WHERE c.state = 'done') AS completed_count
    FROM public.tickets t
    LEFT JOIN public.columns c
      ON c.id = t.column_id
    GROUP BY t.project_id
  ) ticket_stats
    ON ticket_stats.project_id = p.id
  ORDER BY p.created_at DESC;
$$;

COMMENT ON FUNCTION public.get_projects_with_stats() IS
'Returns all projects accessible to the current user with their role and aggregated statistics.
Uses SECURITY INVOKER to respect RLS policies. Statistics include:
- member_count: Total number of members in the project
- ticket_count: Total number of tickets in the project
- in_progress_count: Tickets in an in-progress workflow column
- completed_count: Tickets in a done workflow column';
