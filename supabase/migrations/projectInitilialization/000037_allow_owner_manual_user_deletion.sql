-- Migration: allow database owner to manually delete users even when they
-- are the last admin in a project.
--
-- Context:
-- Deleting an auth.users row cascades to project_members.
-- The last-admin trigger can block this cascade with LAST_ADMIN_REQUIRED.
-- We keep the protection for application flows, but allow a bypass for the
-- database owner role used for manual maintenance operations.

CREATE OR REPLACE FUNCTION prevent_last_admin_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  remaining_admins integer;
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

  IF remaining_admins = 0 THEN
    -- Allow manual maintenance from SQL editor / DB owner only.
    IF TG_OP = 'DELETE' AND current_user = 'postgres' THEN
      RETURN OLD;
    END IF;

    RAISE EXCEPTION 'LAST_ADMIN_REQUIRED' USING ERRCODE = 'P0001';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;
