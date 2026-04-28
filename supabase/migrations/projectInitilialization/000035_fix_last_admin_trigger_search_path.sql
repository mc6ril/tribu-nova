-- Migration: fix Supabase linter warning for mutable search_path.
-- Ensures trigger function resolves objects only from public schema.

ALTER FUNCTION prevent_last_admin_change() SET search_path = 'public';
