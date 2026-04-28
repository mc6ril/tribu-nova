-- Migration: Make ticket due_date timezone-safe calendar date
-- The due date is a "calendar date" (no time-of-day). Storing it as timestamptz
-- can shift the displayed day across timezones (e.g., Paris vs California).

DROP INDEX IF EXISTS idx_tickets_due_date;

ALTER TABLE tickets
  ALTER COLUMN due_date TYPE date
  USING (due_date::date);

CREATE INDEX IF NOT EXISTS idx_tickets_due_date ON tickets(project_id, due_date)
  WHERE due_date IS NOT NULL;

