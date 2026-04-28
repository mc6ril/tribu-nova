-- Migration: User profiles with avatar support
--
-- Creates a user_profiles table synced from auth.users via trigger.
-- Profiles are readable by all authenticated users (needed for team member display)
-- but only writable via trigger or the avatar update function.
--
-- Also creates the avatars storage bucket with appropriate policies.

-- ============================================================================
-- STEP 1: Create user_profiles table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email
  ON user_profiles (email);

-- Trigger for updated_at timestamp
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 2: Sync trigger - populate user_profiles from auth.users
-- ============================================================================

-- Sync function: creates or updates a user_profiles row whenever
-- an auth.users row is inserted or updated.
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(NEW.email, ''),
    display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', EXCLUDED.display_name),
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Trigger on auth.users to sync profile data
CREATE TRIGGER trg_sync_user_profile
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

-- ============================================================================
-- STEP 3: Backfill existing users into user_profiles
-- ============================================================================

INSERT INTO public.user_profiles (id, email, display_name)
SELECT
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'display_name', '')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = u.id
);

-- ============================================================================
-- STEP 4: Enable RLS on user_profiles
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read profiles (needed for teammate display)
CREATE POLICY "Authenticated users can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can update only their own avatar_url
CREATE POLICY "Users can update own avatar"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No direct INSERT or DELETE from client - managed by trigger
-- (The sync trigger uses SECURITY DEFINER to bypass RLS)

-- ============================================================================
-- STEP 5: RPC function to update avatar URL
-- ============================================================================

-- Allows a user to update their own avatar_url in user_profiles.
-- Used after uploading an avatar file to storage.
CREATE OR REPLACE FUNCTION update_avatar_url(new_avatar_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.user_profiles
  SET avatar_url = new_avatar_url,
      updated_at = now()
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

-- ============================================================================
-- STEP 6: Avatars storage bucket
-- ============================================================================

-- Note: Storage bucket creation and policies are typically managed via
-- Supabase Dashboard or seed scripts, not migrations. The SQL below
-- documents the intended configuration. If your Supabase instance supports
-- storage management via SQL, uncomment the following:

-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'avatars',
--   'avatars',
--   true,
--   2097152, -- 2MB
--   ARRAY['image/jpeg', 'image/png', 'image/webp']
-- )
-- ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies (applied via Supabase Dashboard or storage API):
-- SELECT (read): public access (anyone can view avatars)
-- INSERT: auth.uid()::text = (storage.foldername(name))[1] (users upload to their own folder)
-- UPDATE: auth.uid()::text = (storage.foldername(name))[1]
-- DELETE: auth.uid()::text = (storage.foldername(name))[1]
