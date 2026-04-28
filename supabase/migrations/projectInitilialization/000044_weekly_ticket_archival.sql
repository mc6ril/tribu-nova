-- Weekly archival batch for completed tickets.
-- Rule:
-- - timezone: Europe/Paris
-- - week boundary: Monday 00:00 local time (ISO week)
-- - eligibility:
--   * completed_at IS NOT NULL
--   * archived_at IS NULL
--   * completed_at is before the current local week boundary
--   * ticket is still mapped to a column whose workflow state is 'done'
--
-- The application schedules this function daily. Because the cutoff is the
-- current local week boundary, the function is idempotent and remains correct
-- across DST changes and transient scheduler failures.

CREATE OR REPLACE FUNCTION archive_completed_tickets_batch(
  p_now timestamptz DEFAULT now(),
  p_time_zone text DEFAULT 'Europe/Paris'
)
RETURNS integer AS $$
DECLARE
  current_week_start_local timestamp;
  completed_before timestamptz;
  archived_count integer;
BEGIN
  current_week_start_local := date_trunc('week', p_now AT TIME ZONE p_time_zone);
  completed_before := current_week_start_local AT TIME ZONE p_time_zone;

  UPDATE tickets t
  SET
    archived_at = p_now,
    archived_week_start = date_trunc(
      'week',
      t.completed_at AT TIME ZONE p_time_zone
    )::date
  WHERE t.completed_at IS NOT NULL
    AND t.archived_at IS NULL
    AND t.completed_at < completed_before
    AND EXISTS (
      SELECT 1
      FROM boards b
      JOIN columns c
        ON c.board_id = b.id
      WHERE b.project_id = t.project_id
        AND c.status = t.status
        AND c.state = 'done'
    );

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
