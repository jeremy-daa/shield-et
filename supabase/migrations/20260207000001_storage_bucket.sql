-- Create Evidence Vault Storage Bucket
-- Includes RLS policies for user-specific file access

-- Create bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence-vault',
  'evidence-vault',
  false,
  52428800, -- 50MB in bytes
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/ogg',
    'audio/webm',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Users can upload files to their own folder
DROP POLICY IF EXISTS "Users upload own evidence" ON storage.objects;
CREATE POLICY "Users upload own evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'evidence-vault' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Users can view their own files
DROP POLICY IF EXISTS "Users access own evidence" ON storage.objects;
CREATE POLICY "Users access own evidence"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'evidence-vault' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Users can update their own files
DROP POLICY IF EXISTS "Users update own evidence" ON storage.objects;
CREATE POLICY "Users update own evidence"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'evidence-vault' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Users can delete their own files
DROP POLICY IF EXISTS "Users delete own evidence" ON storage.objects;
CREATE POLICY "Users delete own evidence"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'evidence-vault' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
