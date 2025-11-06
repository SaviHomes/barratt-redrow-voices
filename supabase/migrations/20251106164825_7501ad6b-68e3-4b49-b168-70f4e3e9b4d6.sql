-- Add label column to evidence_photo_captions table for room/location names
ALTER TABLE evidence_photo_captions ADD COLUMN IF NOT EXISTS label TEXT;

-- Add index for faster queries on evidence_id
CREATE INDEX IF NOT EXISTS idx_evidence_photo_captions_evidence_id ON evidence_photo_captions(evidence_id);