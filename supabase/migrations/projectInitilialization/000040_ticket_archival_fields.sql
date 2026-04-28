-- Add archival metadata to tickets while preserving the current ticket model.
-- This prepares the future active-vs-archived split without changing current UI flows yet.

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS completed_at timestamptz DEFAULT NULL;

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT NULL;

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS archived_week_start date DEFAULT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tickets_archived_requires_completed_check'
  ) THEN
    ALTER TABLE tickets
    ADD CONSTRAINT tickets_archived_requires_completed_check
    CHECK (archived_at IS NULL OR completed_at IS NOT NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tickets_archived_after_completed_check'
  ) THEN
    ALTER TABLE tickets
    ADD CONSTRAINT tickets_archived_after_completed_check
    CHECK (archived_at IS NULL OR archived_at >= completed_at);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tickets_archived_week_requires_archived_at_check'
  ) THEN
    ALTER TABLE tickets
    ADD CONSTRAINT tickets_archived_week_requires_archived_at_check
    CHECK (archived_week_start IS NULL OR archived_at IS NOT NULL);
  END IF;
END $$;

-- Future board queries will load only active tickets.
CREATE INDEX IF NOT EXISTS idx_tickets_project_active_status_position
  ON tickets(project_id, status, position)
  WHERE archived_at IS NULL;

-- Future archive jobs will scan completed-but-not-yet-archived tickets efficiently.
CREATE INDEX IF NOT EXISTS idx_tickets_pending_archive_completed_at
  ON tickets(completed_at)
  WHERE completed_at IS NOT NULL AND archived_at IS NULL;

-- Future history views can bucket archived tickets by archived week.
CREATE INDEX IF NOT EXISTS idx_tickets_project_archived_week_start
  ON tickets(project_id, archived_week_start)
  WHERE archived_week_start IS NOT NULL;
