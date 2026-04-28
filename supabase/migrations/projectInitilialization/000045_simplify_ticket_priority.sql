-- Migration: Simplify ticket priorities from five levels to three.
-- Remap legacy string values before tightening the check constraint.

-- Drop the legacy constraint first so we can update existing rows without
-- violating the old allowed-values list.
ALTER TABLE tickets
  DROP CONSTRAINT IF EXISTS tickets_priority_check;

UPDATE tickets
SET priority = CASE
  WHEN priority IN ('highest', 'high') THEN 'urgent'
  WHEN priority = 'medium' THEN 'normal'
  WHEN priority IN ('low', 'lowest') THEN 'low'
  ELSE priority
END
WHERE priority IS NOT NULL;

ALTER TABLE tickets
  ADD CONSTRAINT tickets_priority_check
  CHECK (priority IS NULL OR priority IN ('urgent', 'normal', 'low'));
