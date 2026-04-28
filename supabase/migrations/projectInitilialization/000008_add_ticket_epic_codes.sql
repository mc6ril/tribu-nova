-- Migration 000008: Add human-readable codes for projects, tickets, and epics
-- - projects.short_code: immutable 2-letter project code (e.g. 'WB')
-- - tickets.code_number: per-project incremental positive integer (WB-1, WB-2, ...)
-- - epics.code_number: per-project incremental positive integer (WB-E-1, WB-E-2, ...)

-- ============================================================================
-- PROJECTS: add short_code
-- ============================================================================

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS short_code text;

-- Backfill existing projects with a generated short_code before enforcing NOT NULL.
-- Derive a 2-letter code from the project name using the following rule:
-- - Normalize: replace '_' by space, split camelCase into separate words.
-- - If there are at least two words: take the first letter of the first two words.
-- - Otherwise: take the first two letters of the (single) word.
-- - Fallback to 'PR' if name is missing/too short.
UPDATE projects
SET short_code = upper(
  COALESCE(
    -- Two or more words: first letters of first two words
    CASE
      WHEN array_length(
        regexp_split_to_array(
          regexp_replace(replace(trim(name), '_', ' '), '([a-z])([A-Z])', '\1 \2', 'g'),
          '\s+'
        ),
        1
      ) >= 2 THEN
        substring(
          (
            regexp_split_to_array(
              regexp_replace(replace(trim(name), '_', ' '), '([a-z])([A-Z])', '\1 \2', 'g'),
              '\s+'
            )
          )[1]
          from 1 for 1
        )
        ||
        substring(
          (
            regexp_split_to_array(
              regexp_replace(replace(trim(name), '_', ' '), '([a-z])([A-Z])', '\1 \2', 'g'),
              '\s+'
            )
          )[2]
          from 1 for 1
        )
      ELSE NULL
    END,
    -- Single word or fallback: first two letters
    CASE
      WHEN length(trim(coalesce(name, ''))) >= 2 THEN substring(trim(name) from 1 for 2)
      ELSE 'PR'
    END
  )
)
WHERE short_code IS NULL;

-- Enforce constraints on short_code:
-- - non-null
-- - exactly 2 non-blank characters after trimming
ALTER TABLE projects
ALTER COLUMN short_code SET NOT NULL;

ALTER TABLE projects
DROP CONSTRAINT IF EXISTS uk_projects_short_code;

ALTER TABLE projects
ADD CONSTRAINT uk_projects_short_code UNIQUE (short_code);

ALTER TABLE projects
DROP CONSTRAINT IF EXISTS chk_projects_short_code_length;

ALTER TABLE projects
ADD CONSTRAINT chk_projects_short_code_length
CHECK (length(trim(short_code)) = 2);

COMMENT ON COLUMN projects.short_code IS
  'Immutable 2-letter human-readable code for the project (e.g. ''WB''). Used as prefix for ticket/epic codes.';

-- ============================================================================
-- TICKETS: add code_number
-- ============================================================================

ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS code_number integer;

ALTER TABLE tickets
ALTER COLUMN code_number SET NOT NULL;

ALTER TABLE tickets
DROP CONSTRAINT IF EXISTS chk_tickets_code_number_positive;

ALTER TABLE tickets
ADD CONSTRAINT chk_tickets_code_number_positive CHECK (code_number > 0);

ALTER TABLE tickets
DROP CONSTRAINT IF EXISTS uk_tickets_project_code_number;

ALTER TABLE tickets
ADD CONSTRAINT uk_tickets_project_code_number UNIQUE (project_id, code_number);

CREATE INDEX IF NOT EXISTS idx_tickets_project_code_number
ON tickets(project_id, code_number);

COMMENT ON COLUMN tickets.code_number IS
  'Per-project positive integer used to build human-readable ticket code (e.g. project ''WB'' + code_number 1 => ''WB-1'').';

-- ============================================================================
-- EPICS: add code_number
-- ============================================================================

ALTER TABLE epics
ADD COLUMN IF NOT EXISTS code_number integer;

ALTER TABLE epics
ALTER COLUMN code_number SET NOT NULL;

ALTER TABLE epics
DROP CONSTRAINT IF EXISTS chk_epics_code_number_positive;

ALTER TABLE epics
ADD CONSTRAINT chk_epics_code_number_positive CHECK (code_number > 0);

ALTER TABLE epics
DROP CONSTRAINT IF EXISTS uk_epics_project_code_number;

ALTER TABLE epics
ADD CONSTRAINT uk_epics_project_code_number UNIQUE (project_id, code_number);

CREATE INDEX IF NOT EXISTS idx_epics_project_code_number
ON epics(project_id, code_number);

COMMENT ON COLUMN epics.code_number IS
  'Per-project positive integer used to build human-readable epic code (e.g. project ''WB'' + code_number 1 => ''WB-E-1'').';

-- ============================================================================
-- FUNCTIONS: update create_project / get_project_by_id to handle short_code
-- ============================================================================

-- Drop existing versions so we can change signatures
DROP FUNCTION IF EXISTS create_project(text);
DROP FUNCTION IF EXISTS get_project_by_id(uuid);

-- Function to create project with auto-generated short code (bypasses RLS)
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
  derived_short_code text;
BEGIN
  -- Get current user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Derive short code from project_name using the same rule as backfill
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

  -- Insert project (bypasses RLS because function is SECURITY DEFINER)
  INSERT INTO public.projects (name, short_code)
  VALUES (project_name, derived_short_code)
  RETURNING public.projects.id INTO new_project_id;

  -- Add creator as admin using helper function (bypasses RLS)
  PERFORM add_project_member_admin(new_project_id, current_user_id);

  -- Return the created project
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get project by ID (now also returns short_code)
CREATE OR REPLACE FUNCTION get_project_by_id(p_project_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  short_code text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    public.projects.id,
    public.projects.name,
    public.projects.short_code,
    public.projects.created_at,
    public.projects.updated_at
  FROM public.projects
  WHERE public.projects.id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_project(text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_project(text) TO anon;
GRANT EXECUTE ON FUNCTION get_project_by_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_by_id(uuid) TO anon;

