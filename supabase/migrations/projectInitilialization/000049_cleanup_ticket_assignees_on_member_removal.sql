-- Migration: remove ticket assignments when a user is removed from a project.
--
-- Deleting a project member should also remove any ticket_assignees rows tied
-- to tickets in that same project so assignee data stays consistent.

CREATE OR REPLACE FUNCTION cleanup_ticket_assignees_for_removed_member()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM ticket_assignees AS ta
  USING tickets AS t
  WHERE ta.ticket_id = t.id
    AND t.project_id = OLD.project_id
    AND ta.user_id = OLD.user_id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_cleanup_ticket_assignees_on_member_removal
  ON project_members;

CREATE TRIGGER trg_cleanup_ticket_assignees_on_member_removal
  AFTER DELETE ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_ticket_assignees_for_removed_member();
