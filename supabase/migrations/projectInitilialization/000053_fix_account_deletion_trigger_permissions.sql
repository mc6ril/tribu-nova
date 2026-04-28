-- Migration: ensure account-deletion trigger helpers can run from Supabase Auth.
--
-- Context:
-- - auth.admin.deleteUser() deletes auth.users as `supabase_auth_admin`.
-- - During the cascade to project_members, our trigger helpers touch public
--   tables and must therefore run as SECURITY DEFINER.
-- - 000052 introduces the orphaning-by-account-deletion logic; this follow-up
--   makes the trigger permissions robust on databases where 000052 was already
--   applied in its earlier form.

ALTER FUNCTION prevent_last_admin_change() SECURITY DEFINER;

ALTER FUNCTION cleanup_ticket_assignees_for_removed_member() SECURITY DEFINER;
