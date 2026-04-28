-- Enable Supabase Realtime for project detail batch 2 tables.
-- Keeps ticket detail and related project data synchronized across clients.

DO $$
DECLARE
  realtime_table text;
  realtime_tables text[] := ARRAY[
    'epics',
    'labels',
    'project_members',
    'comments',
    'ticket_assignees',
    'ticket_labels'
  ];
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    RAISE NOTICE 'Publication "supabase_realtime" does not exist in this environment.';
    RETURN;
  END IF;

  FOREACH realtime_table IN ARRAY realtime_tables LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = realtime_table
    ) THEN
      EXECUTE format(
        'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
        realtime_table
      );
    END IF;
  END LOOP;
END $$;
