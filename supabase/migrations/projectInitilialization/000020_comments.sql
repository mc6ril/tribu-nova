-- Migration: Create comments table for ticket discussions
-- Core collaboration feature for project management

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (length(trim(content)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_ticket ON comments(ticket_id, created_at);

-- Auto-update updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_comments_updated_at
      BEFORE UPDATE ON comments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: access controlled via ticket's project membership
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Project members can view comments'
  ) THEN
    CREATE POLICY "Project members can view comments"
      ON comments FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM tickets t
          WHERE t.id = comments.ticket_id
          AND is_project_member(t.project_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Project editors can create comments'
  ) THEN
    CREATE POLICY "Project editors can create comments"
      ON comments FOR INSERT
      TO authenticated
      WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM tickets t
          WHERE t.id = comments.ticket_id
          AND can_edit_project(t.project_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Authors can update their own comments'
  ) THEN
    CREATE POLICY "Authors can update their own comments"
      ON comments FOR UPDATE
      TO authenticated
      USING (author_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Authors and admins can delete comments'
  ) THEN
    CREATE POLICY "Authors and admins can delete comments"
      ON comments FOR DELETE
      TO authenticated
      USING (
        author_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM tickets t
          WHERE t.id = comments.ticket_id
          AND is_project_admin(t.project_id)
        )
      );
  END IF;
END $$;

-- RPC to list comments with author profile data
CREATE OR REPLACE FUNCTION get_ticket_comments(p_ticket_id uuid)
RETURNS TABLE(
  id uuid,
  ticket_id uuid,
  author_id uuid,
  content text,
  author_display_name text,
  author_avatar_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    c.id,
    c.ticket_id,
    c.author_id,
    c.content,
    up.display_name AS author_display_name,
    up.avatar_url AS author_avatar_url,
    c.created_at,
    c.updated_at
  FROM public.comments c
  JOIN public.user_profiles up ON up.id = c.author_id
  WHERE c.ticket_id = p_ticket_id
  ORDER BY c.created_at ASC;
$$;
