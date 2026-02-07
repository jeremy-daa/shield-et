-- Fix file_id column type from UUID to TEXT
-- This allows storing file paths like "user-id/image_12345.jpg"

ALTER TABLE evidence_metadata 
  ALTER COLUMN file_id TYPE TEXT;

-- No need to update existing data since table is empty
