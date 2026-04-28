-- Migration: Replace loop-based update_ticket_positions with a single SET-based UPDATE
--
-- The previous implementation used a PL/pgSQL FOR loop, which still executes N individual
-- UPDATE statements on the server. This version uses a single UPDATE...FROM unnest()
-- that resolves all positions in one SQL statement.
--
-- We also change the return type from void to SETOF tickets so the application can receive
-- the updated rows without an extra SELECT round-trip.

DROP FUNCTION IF EXISTS update_ticket_positions(jsonb);

CREATE OR REPLACE FUNCTION update_ticket_positions(p_positions jsonb)
RETURNS SETOF public.tickets
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  UPDATE public.tickets
  SET
    position = (elem->>'position')::integer,
    updated_at = now()
  FROM jsonb_array_elements(p_positions) AS elem
  WHERE public.tickets.id = (elem->>'id')::uuid
  RETURNING public.tickets.*;
$$;
