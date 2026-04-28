-- Migration: Multi-assignee ticket assignment
--
-- Allows assigning multiple users to a ticket via a join table.
-- RLS inherits from the ticket's project membership.

-- ============================================================================
-- STEP 1: Create ticket_assignees table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ticket_assignees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  CONSTRAINT uk_ticket_assignees_ticket_user UNIQUE (ticket_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_assignees_ticket_id
  ON ticket_assignees (ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_assignees_user_id
  ON ticket_assignees (user_id);

-- ============================================================================
-- STEP 2: Enable RLS on ticket_assignees
-- ============================================================================

ALTER TABLE ticket_assignees ENABLE ROW LEVEL SECURITY;

-- Project members can view ticket assignments
CREATE POLICY "Project members can view ticket assignees"
  ON ticket_assignees
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
        AND is_project_member(t.project_id)
    )
  );

-- Project editors (admin or member) can manage assignments
CREATE POLICY "Project editors can insert ticket assignees"
  ON ticket_assignees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
        AND can_edit_project(t.project_id)
    )
  );

CREATE POLICY "Project editors can delete ticket assignees"
  ON ticket_assignees
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
        AND can_edit_project(t.project_id)
    )
  );

-- ============================================================================
-- STEP 3: RPC to get tickets with assignee info (optimized query)
-- ============================================================================

-- Returns assignees for a list of tickets, joined with user_profiles.
-- Used to batch-load assignees for board views.
CREATE OR REPLACE FUNCTION get_ticket_assignees(ticket_ids uuid[])
RETURNS TABLE (
  ticket_id uuid,
  user_id uuid,
  display_name text,
  avatar_url text,
  assigned_at timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ta.ticket_id,
    ta.user_id,
    up.display_name,
    up.avatar_url,
    ta.assigned_at
  FROM ticket_assignees ta
  JOIN user_profiles up ON up.id = ta.user_id
  WHERE ta.ticket_id = ANY(ticket_ids)
  ORDER BY ta.assigned_at ASC;
END;
$$;
