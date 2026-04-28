-- Migration: Create public recipe covers storage bucket and RLS policies
--
-- Context:
-- Recipe editor supports either a remote URL or an uploaded image. Uploaded
-- covers are transformed to WebP client-side and stored under
-- `{userId}/{projectId}/{timestamp}-{uuid}.webp`.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-covers',
  'recipe-covers',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "recipe_covers_bucket_public_read" ON storage.objects;
CREATE POLICY "recipe_covers_bucket_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'recipe-covers');

DROP POLICY IF EXISTS "recipe_covers_bucket_authenticated_insert_own_folder" ON storage.objects;
CREATE POLICY "recipe_covers_bucket_authenticated_insert_own_folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'recipe-covers'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "recipe_covers_bucket_authenticated_update_own_folder" ON storage.objects;
CREATE POLICY "recipe_covers_bucket_authenticated_update_own_folder"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'recipe-covers'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'recipe-covers'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "recipe_covers_bucket_authenticated_delete_own_folder" ON storage.objects;
CREATE POLICY "recipe_covers_bucket_authenticated_delete_own_folder"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'recipe-covers'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );
