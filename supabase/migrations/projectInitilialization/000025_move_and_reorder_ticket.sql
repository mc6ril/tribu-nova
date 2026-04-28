-- Migration: Add atomic ticket move + reorder RPC for cross-column DnD
--
-- This function executes status change + batch position updates in one
-- transaction-scoped RPC call to prevent partial board updates.

CREATE OR REPLACE FUNCTION move_and_reorder_ticket(
  p_ticket_id uuid,
  p_status text,
  p_position integer,
  p_positions jsonb
)
RETURNS SETOF public.tickets
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.tickets
  SET
    status = p_status,
    position = p_position,
    updated_at = now()
  WHERE id = p_ticket_id;

  UPDATE public.tickets
  SET
    position = (elem->>'position')::integer,
    updated_at = now()
  FROM jsonb_array_elements(p_positions) AS elem
  WHERE public.tickets.id = (elem->>'id')::uuid
    AND public.tickets.id <> p_ticket_id;

  RETURN QUERY
  SELECT public.tickets.*
  FROM public.tickets
  WHERE public.tickets.id = p_ticket_id
    OR public.tickets.id IN (
      SELECT (elem->>'id')::uuid
      FROM jsonb_array_elements(p_positions) AS elem
    );
END;
$$;
