-- Migration: Add priority, due_date, story_points, created_by to tickets
-- These fields bring ticket feature parity with Jira/Trello

-- Priority levels matching standard project management tools
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS priority text DEFAULT NULL
    CHECK (priority IN ('highest', 'high', 'medium', 'low', 'lowest'));

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS due_date timestamptz DEFAULT NULL;

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS story_points integer DEFAULT NULL
    CHECK (story_points IS NULL OR story_points > 0);

-- Track who created the ticket (reporter in Jira terminology)
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT NULL
    REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for priority filtering
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(project_id, priority)
  WHERE priority IS NOT NULL;

-- Add index for due date ordering/filtering
CREATE INDEX IF NOT EXISTS idx_tickets_due_date ON tickets(project_id, due_date)
  WHERE due_date IS NOT NULL;
