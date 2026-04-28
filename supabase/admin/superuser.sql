-- ============================================================================
-- SUPERUSER MANAGEMENT
-- ============================================================================
--
-- Superusers have full access to all features without a paid subscription.
-- This is useful for:
--   - Developers testing premium features locally
--   - Giving friends/family full access for free
--   - Internal team members who need unrestricted access
--
-- The flag is stored in auth.users.raw_app_meta_data (Supabase app_metadata).
-- App metadata can ONLY be modified server-side (service role / SQL),
-- never by the user themselves. This ensures security.
--
-- After any change, the user must refresh their session (log out / log in)
-- for the updated flag to appear in their JWT token.
--
-- HOW TO USE:
--   1. Open Supabase Dashboard > SQL Editor (or use psql for local dev)
--   2. Copy the desired command below
--   3. Replace 'user@example.com' with the target email
--   4. Run the query
-- ============================================================================


-- ============================================================================
-- GRANT SUPERUSER
-- ============================================================================
-- Gives full access to all features (Pro + Team) without any subscription.
-- The flag merges into existing app_metadata without overwriting other keys.

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_superuser": true}'::jsonb
WHERE email = 'user@example.com';


-- ============================================================================
-- REVOKE SUPERUSER
-- ============================================================================
-- Removes full access. The user falls back to their actual subscription plan
-- (or free if they have no subscription).

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_superuser": false}'::jsonb
WHERE email = 'user@example.com';


-- ============================================================================
-- CHECK SUPERUSER STATUS
-- ============================================================================
-- Verify if a specific user is a superuser.

SELECT
  id,
  email,
  raw_app_meta_data->>'is_superuser' AS is_superuser
FROM auth.users
WHERE email = 'user@example.com';


-- ============================================================================
-- LIST ALL SUPERUSERS
-- ============================================================================
-- Show every user that currently has the superuser flag enabled.

SELECT
  id,
  email,
  created_at
FROM auth.users
WHERE raw_app_meta_data->>'is_superuser' = 'true'
ORDER BY created_at;
