-- Migration: Transactional position updates and code number allocation
-- Fixes race conditions and non-atomic batch updates

-- Atomic bulk position update for tickets (replaces client-side loop)
CREATE OR REPLACE FUNCTION update_ticket_positions(
  p_positions jsonb
)
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

-- Atomic bulk position update for board columns
CREATE OR REPLACE FUNCTION update_column_positions(
  p_positions jsonb
)
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

-- Atomic next code number for tickets (prevents race condition)
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

-- Atomic next code number for epics (prevents race condition)
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
