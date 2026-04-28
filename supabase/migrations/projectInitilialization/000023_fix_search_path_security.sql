-- Migration: Fix search_path security warnings on all new functions
-- Sets search_path = '' to prevent search_path injection attacks

-- Fix get_ticket_comments
CREATE OR REPLACE FUNCTION get_ticket_comments(p_ticket_id uuid)
RETURNS TABLE(
  id uuid,
  ticket_id uuid,
  author_id uuid,
  content text,
  author_display_name text,
  author_avatar_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    c.id,
    c.ticket_id,
    c.author_id,
    c.content,
    up.display_name AS author_display_name,
    up.avatar_url AS author_avatar_url,
    c.created_at,
    c.updated_at
  FROM public.comments c
  JOIN public.user_profiles up ON up.id = c.author_id
  WHERE c.ticket_id = p_ticket_id
  ORDER BY c.created_at ASC;
$$;

-- Fix update_ticket_positions
CREATE OR REPLACE FUNCTION update_ticket_positions(p_positions jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  item jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_positions)
  LOOP
    UPDATE public.tickets
    SET position = (item->>'position')::integer
    WHERE id = (item->>'id')::uuid;
  END LOOP;
END;
$$;

-- Fix update_column_positions
CREATE OR REPLACE FUNCTION update_column_positions(p_positions jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  item jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_positions)
  LOOP
    UPDATE public.columns
    SET position = (item->>'position')::integer
    WHERE id = (item->>'id')::uuid;
  END LOOP;
END;
$$;

-- Fix allocate_ticket_code_number
CREATE OR REPLACE FUNCTION allocate_ticket_code_number(p_project_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  next_code integer;
BEGIN
  SELECT COALESCE(MAX(code_number), 0) + 1
  INTO next_code
  FROM public.tickets
  WHERE project_id = p_project_id
  FOR UPDATE;

  RETURN next_code;
END;
$$;

-- Fix allocate_epic_code_number
CREATE OR REPLACE FUNCTION allocate_epic_code_number(p_project_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  next_code integer;
BEGIN
  SELECT COALESCE(MAX(code_number), 0) + 1
  INTO next_code
  FROM public.epics
  WHERE project_id = p_project_id
  FOR UPDATE;

  RETURN next_code;
END;
$$;
