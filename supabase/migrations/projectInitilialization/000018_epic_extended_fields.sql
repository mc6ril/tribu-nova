-- Migration: Add start_date, target_date, color to epics
-- Enables timeline planning for epics

ALTER TABLE epics
  ADD COLUMN IF NOT EXISTS start_date timestamptz DEFAULT NULL;

ALTER TABLE epics
  ADD COLUMN IF NOT EXISTS target_date timestamptz DEFAULT NULL;

-- Color for visual identification on boards
ALTER TABLE epics
  ADD COLUMN IF NOT EXISTS color text NOT NULL DEFAULT '#6B7280'
    CHECK (color ~ '^#[0-9a-fA-F]{6}$');
