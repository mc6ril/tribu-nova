-- Migration: Refine RLS policies using denormalized project_id
--
-- project_id is now present on comments and ticket_assignees and is DB-owned.
-- We can simplify SELECT/DELETE policies to avoid joining through tickets for
-- these operations, while keeping INSERT policies ticket_id-based for safety.

-- ============================================================================
-- comments
-- ============================================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project members can view comments" ON public.comments;
CREATE POLICY "Project members can view comments"
  ON public.comments
  FOR SELECT
  TO authenticated
  USING (is_project_member(project_id));

DROP POLICY IF EXISTS "Authors and admins can delete comments" ON public.comments;
CREATE POLICY "Authors and admins can delete comments"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR is_project_admin(project_id)
  );

-- Keep INSERT policy as ticket_id-based (see 000020_comments.sql).
-- Keep UPDATE policy as author-only (see 000020_comments.sql).

-- ============================================================================
-- ticket_assignees
-- ============================================================================

ALTER TABLE public.ticket_assignees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project members can view ticket assignees" ON public.ticket_assignees;
CREATE POLICY "Project members can view ticket assignees"
  ON public.ticket_assignees
  FOR SELECT
  TO authenticated
  USING (is_project_member(project_id));

DROP POLICY IF EXISTS "Project editors can delete ticket assignees" ON public.ticket_assignees;
CREATE POLICY "Project editors can delete ticket assignees"
  ON public.ticket_assignees
  FOR DELETE
  TO authenticated
  USING (can_edit_project(project_id));

-- Keep INSERT policy as ticket_id-based (see 000015_ticket_assignees.sql).

