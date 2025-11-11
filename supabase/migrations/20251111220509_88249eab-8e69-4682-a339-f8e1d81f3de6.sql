-- Make evidence-photos bucket public to allow images/videos to display
-- This allows getPublicUrl() to work correctly while RLS policies still control upload/delete permissions
UPDATE storage.buckets 
SET public = true 
WHERE id = 'evidence-photos';