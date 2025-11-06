-- Create moderation status enum
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected');

-- Add moderation columns to evidence table
ALTER TABLE evidence 
  ADD COLUMN moderation_status moderation_status DEFAULT 'pending',
  ADD COLUMN moderated_at TIMESTAMPTZ,
  ADD COLUMN moderated_by UUID,
  ADD COLUMN rejection_reason TEXT;

-- Update existing records to 'approved' if they're public
UPDATE evidence 
SET moderation_status = 'approved' 
WHERE is_public = true;

-- Create index for faster queries
CREATE INDEX idx_evidence_moderation_status ON evidence(moderation_status);

-- Allow admins to view all evidence (including pending)
CREATE POLICY "Admins can view all evidence"
ON evidence FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to update evidence moderation
CREATE POLICY "Admins can moderate evidence"
ON evidence FOR UPDATE
USING (has_role(auth.uid(), 'admin'));