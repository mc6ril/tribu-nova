-- Migration: allow authenticated account deletion to orphan a project safely.
--
-- Context:
-- - The database already supports orphaned project recovery via creator_email
--   and reclaim_or_join_project() (see 000012 and 000051).
-- - When auth.users is deleted, project_members rows are cascade-deleted.
-- - Supabase Auth performs that delete as `supabase_auth_admin`, so any
--   triggered function that touches public tables must run as SECURITY DEFINER.
-- - The last-admin trigger currently blocks that cascade even when the user is
--   also the last remaining project member, which prevents account deletion.
--
-- Goal:
-- - Keep the "last admin cannot be removed" invariant for normal membership
--   flows.
-- - Allow the special case where auth.users deletion would leave the project
--   with zero remaining members, so the existing orphaned-project recovery flow
--   can take over.

CREATE OR REPLACE FUNCTION public.set_app_deleting_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM set_config('app.deleting_auth_user', OLD.id::text, true);
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_mark_deleting_auth_user ON auth.users;

CREATE TRIGGER trg_mark_deleting_auth_user
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_app_deleting_auth_user();

CREATE OR REPLACE FUNCTION prevent_last_admin_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  remaining_admins integer;
  remaining_members integer;
  deleting_user text;
BEGIN
  IF TG_OP = 'DELETE' AND NOT EXISTS (
    SELECT 1
    FROM projects
    WHERE id = OLD.project_id
  ) THEN
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.role <> 'admin' OR NEW.role = 'admin' THEN
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.role <> 'admin' THEN
      RETURN OLD;
    END IF;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(OLD.project_id::text));

  SELECT COUNT(*) INTO remaining_admins
  FROM project_members
  WHERE project_id = OLD.project_id
    AND role = 'admin'
    AND id <> OLD.id;

  SELECT COUNT(*) INTO remaining_members
  FROM project_members
  WHERE project_id = OLD.project_id
    AND id <> OLD.id;

  IF remaining_admins = 0 THEN
    deleting_user := current_setting('app.deleting_auth_user', true);

    -- Allow account deletion only when it would orphan the whole project.
    -- This preserves the normal "must keep an admin" rule for active projects
    -- that still have other members.
    IF TG_OP = 'DELETE'
       AND deleting_user IS NOT NULL
       AND deleting_user <> ''
       AND deleting_user = OLD.user_id::text
       AND remaining_members = 0 THEN
      RETURN OLD;
    END IF;

    -- Keep the existing maintenance bypass for manual SQL operations.
    IF TG_OP = 'DELETE' AND current_user = 'postgres' THEN
      RETURN OLD;
    END IF;

    RAISE EXCEPTION 'LAST_ADMIN_REQUIRED' USING ERRCODE = 'P0001';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_ticket_assignees_for_removed_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM ticket_assignees AS ta
  USING tickets AS t
  WHERE ta.ticket_id = t.id
    AND t.project_id = OLD.project_id
    AND ta.user_id = OLD.user_id;

  RETURN OLD;
END;
$$;
