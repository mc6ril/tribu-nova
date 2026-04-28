-- Add canonical workflow state to columns and backfill from legacy status values.
-- Goal: business logic must rely on columns.state, not user-facing labels or free-form status strings.

ALTER TABLE columns
ADD COLUMN IF NOT EXISTS state text;

-- Backfill with explicit legacy mapping strategy.
UPDATE columns
SET state = CASE
  WHEN lower(trim(status)) IN (
    'done',
    'completed',
    'complete',
    'closed',
    'resolved',
    'finished',
    'finit',
    'termine',
    'terminé'
  ) THEN 'done'
  WHEN lower(trim(status)) IN (
    'in-progress',
    'in progress',
    'wip',
    'doing',
    'active',
    'ongoing',
    'started'
  ) THEN 'in_progress'
  ELSE 'todo'
END
WHERE state IS NULL
   OR state NOT IN ('todo', 'in_progress', 'done');

ALTER TABLE columns
ALTER COLUMN state SET DEFAULT 'todo';

ALTER TABLE columns
ALTER COLUMN state SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'columns_state_check'
  ) THEN
    ALTER TABLE columns
    ADD CONSTRAINT columns_state_check
    CHECK (state IN ('todo', 'in_progress', 'done'));
  END IF;
END $$;

-- Allow multiple columns sharing the same workflow state.
ALTER TABLE columns
DROP CONSTRAINT IF EXISTS uk_columns_board_status;
