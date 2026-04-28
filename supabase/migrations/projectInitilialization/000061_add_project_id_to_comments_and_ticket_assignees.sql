-- Migration: Add project_id to comments and ticket_assignees
--
-- Goal: allow Supabase Realtime subscriptions scoped by project_id without
-- changing the app write contracts (ticket_id remains the source of truth).
--
-- project_id is DB-owned and derived from tickets.project_id via triggers.

-- ============================================================================
-- STEP 1: Add columns (nullable for backfill)
-- ============================================================================

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS project_id uuid;

ALTER TABLE public.ticket_assignees
  ADD COLUMN IF NOT EXISTS project_id uuid;

-- ============================================================================
-- STEP 2: Backfill existing rows
-- ============================================================================

UPDATE public.comments c
SET project_id = t.project_id
FROM public.tickets t
WHERE t.id = c.ticket_id
  AND c.project_id IS NULL;

UPDATE public.ticket_assignees ta
SET project_id = t.project_id
FROM public.tickets t
WHERE t.id = ta.ticket_id
  AND ta.project_id IS NULL;

-- ============================================================================
-- STEP 3: Indexes for common access patterns
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_comments_project_id_created_at
  ON public.comments (project_id, created_at);

CREATE INDEX IF NOT EXISTS idx_ticket_assignees_project_id_ticket_id
  ON public.ticket_assignees (project_id, ticket_id);

-- ============================================================================
-- STEP 4: Triggers to keep project_id consistent with ticket_id
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_comment_project_id_from_ticket()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.project_id := (
    SELECT t.project_id
    FROM public.tickets t
    WHERE t.id = NEW.ticket_id
  );

  IF NEW.project_id IS NULL THEN
    RAISE EXCEPTION 'Ticket % not found for comment sync', NEW.ticket_id
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_ticket_assignee_project_id_from_ticket()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.project_id := (
    SELECT t.project_id
    FROM public.tickets t
    WHERE t.id = NEW.ticket_id
  );

  IF NEW.project_id IS NULL THEN
    RAISE EXCEPTION 'Ticket % not found for ticket_assignees sync', NEW.ticket_id
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_comments_project_id ON public.comments;
CREATE TRIGGER trg_sync_comments_project_id
  BEFORE INSERT OR UPDATE OF ticket_id ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_comment_project_id_from_ticket();

DROP TRIGGER IF EXISTS trg_sync_ticket_assignees_project_id ON public.ticket_assignees;
CREATE TRIGGER trg_sync_ticket_assignees_project_id
  BEFORE INSERT OR UPDATE OF ticket_id ON public.ticket_assignees
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_ticket_assignee_project_id_from_ticket();

-- ============================================================================
-- STEP 5: Enforce NOT NULL after backfill + trigger installation
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.comments WHERE project_id IS NULL) THEN
    RAISE EXCEPTION 'comments.project_id backfill is incomplete';
  END IF;
  IF EXISTS (SELECT 1 FROM public.ticket_assignees WHERE project_id IS NULL) THEN
    RAISE EXCEPTION 'ticket_assignees.project_id backfill is incomplete';
  END IF;
END;
$$;

ALTER TABLE public.comments
  ALTER COLUMN project_id SET NOT NULL;

ALTER TABLE public.ticket_assignees
  ALTER COLUMN project_id SET NOT NULL;

