-- Add poster_url column to evidence_photo_captions table for video thumbnails
ALTER TABLE evidence_photo_captions
ADD COLUMN poster_url text;