-- Migration: Create labels and ticket_labels tables
-- Enables tagging/labeling tickets for categorization

CREATE TABLE IF NOT EXISTS labels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  color text NOT NULL DEFAULT '#6B7280'
    CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, name)
);

CREATE INDEX IF NOT EXISTS idx_labels_project ON labels(project_id);

-- Auto-update updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_labels_updated_at'
  ) THEN
    CREATE TRIGGER update_labels_updated_at
      BEFORE UPDATE ON labels
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Join table for many-to-many ticket <-> label relationship
CREATE TABLE IF NOT EXISTS ticket_labels (
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  label_id uuid NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(ticket_id, label_id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_labels_label ON ticket_labels(label_id);

-- RLS for labels
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'labels' AND policyname = 'Project members can view labels'
  ) THEN
    CREATE POLICY "Project members can view labels"
      ON labels FOR SELECT
      USING (is_project_member(project_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'labels' AND policyname = 'Project editors can create labels'
  ) THEN
    CREATE POLICY "Project editors can create labels"
      ON labels FOR INSERT
      WITH CHECK (can_edit_project(project_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'labels' AND policyname = 'Project editors can update labels'
  ) THEN
    CREATE POLICY "Project editors can update labels"
      ON labels FOR UPDATE
      USING (can_edit_project(project_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'labels' AND policyname = 'Project editors can delete labels'
  ) THEN
    CREATE POLICY "Project editors can delete labels"
      ON labels FOR DELETE
      USING (can_edit_project(project_id));
  END IF;
END $$;

-- RLS for ticket_labels
ALTER TABLE ticket_labels ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ticket_labels' AND policyname = 'Project members can view ticket labels'
  ) THEN
    CREATE POLICY "Project members can view ticket labels"
      ON ticket_labels FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM tickets t
          WHERE t.id = ticket_labels.ticket_id
          AND is_project_member(t.project_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ticket_labels' AND policyname = 'Project editors can add ticket labels'
  ) THEN
    CREATE POLICY "Project editors can add ticket labels"
      ON ticket_labels FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM tickets t
          WHERE t.id = ticket_labels.ticket_id
          AND can_edit_project(t.project_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ticket_labels' AND policyname = 'Project editors can remove ticket labels'
  ) THEN
    CREATE POLICY "Project editors can remove ticket labels"
      ON ticket_labels FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM tickets t
          WHERE t.id = ticket_labels.ticket_id
          AND can_edit_project(t.project_id)
        )
      );
  END IF;
END $$;
