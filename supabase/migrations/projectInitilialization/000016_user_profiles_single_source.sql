-- Migration: Make user_profiles the single source of truth
--
-- Moves display_name, preferences, and terms_accepted_at from auth.users.user_metadata
-- to the user_profiles table. After this migration:
--   - auth.users only manages email, password, session, app_metadata
--   - user_profiles owns all applicative user data
--   - The sync trigger is simplified to INSERT-only (signup)
--   - Users can update their own profile directly via RLS

-- ============================================================================
-- STEP 1: Add new columns to user_profiles
-- ============================================================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{"theme":"system","emailNotifications":true,"language":"fr"}',
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

-- ============================================================================
-- STEP 2: Backfill existing users from auth.users.raw_user_meta_data
-- ============================================================================

UPDATE public.user_profiles up
SET
  preferences = COALESCE(
    (SELECT u.raw_user_meta_data->'preferences'
     FROM auth.users u
     WHERE u.id = up.id),
    up.preferences
  ),
  terms_accepted_at = (
    SELECT (u.raw_user_meta_data->>'terms_accepted_at')::timestamptz
    FROM auth.users u
    WHERE u.id = up.id
    AND u.raw_user_meta_data->>'terms_accepted_at' IS NOT NULL
  );

-- ============================================================================
-- STEP 3: Replace sync trigger - INSERT only (signup)
-- ============================================================================

-- Drop the old trigger that fires on INSERT OR UPDATE
DROP TRIGGER IF EXISTS trg_sync_user_profile ON auth.users;

-- Replace the sync function: only populates on signup, no more sync on update
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, preferences)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(
      NEW.raw_user_meta_data->'preferences',
      '{"theme":"system","emailNotifications":true,"language":"fr"}'::jsonb
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- New trigger: fires only on INSERT (signup), not on UPDATE
CREATE TRIGGER trg_sync_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

-- ============================================================================
-- STEP 4: Update RLS policies for profile self-update
-- ============================================================================

-- Drop the old avatar-only update policy
DROP POLICY IF EXISTS "Users can update own avatar" ON user_profiles;

-- Users can update their own profile (display_name, avatar_url, preferences, terms_accepted_at)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 5: RPC function to update user profile
-- ============================================================================

-- Allows a user to update their own profile fields.
-- Accepts optional display_name, preferences, and terms_accepted_at.
CREATE OR REPLACE FUNCTION update_user_profile(
  new_display_name text DEFAULT NULL,
  new_preferences jsonb DEFAULT NULL,
  new_terms_accepted_at timestamptz DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    display_name = COALESCE(new_display_name, display_name),
    preferences = COALESCE(new_preferences, preferences),
    terms_accepted_at = COALESCE(new_terms_accepted_at, terms_accepted_at),
    updated_at = now()
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found' USING ERRCODE = 'P0002';
  END IF;
END;
$$;
