-- Migration: Create public avatars storage bucket and RLS policies
--
-- Context:
-- 000013_user_profiles.sql documented the intended bucket but left INSERT into
-- storage.buckets commented out. Production then had no `avatars` bucket, causing
-- StorageApiError "Bucket not found" on upload/list/remove.
--
-- Policies mirror the app contract: paths are `{userId}/avatar.webp`; users may
-- only read/write/delete objects under their own folder; public read for CDN URLs.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "avatars_bucket_public_read" ON storage.objects;
CREATE POLICY "avatars_bucket_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_bucket_authenticated_insert_own_folder" ON storage.objects;
CREATE POLICY "avatars_bucket_authenticated_insert_own_folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "avatars_bucket_authenticated_update_own_folder" ON storage.objects;
CREATE POLICY "avatars_bucket_authenticated_update_own_folder"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "avatars_bucket_authenticated_delete_own_folder" ON storage.objects;
CREATE POLICY "avatars_bucket_authenticated_delete_own_folder"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );
