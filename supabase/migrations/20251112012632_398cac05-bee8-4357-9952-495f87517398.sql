-- Create evidence_comments table
CREATE TABLE evidence_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  
  -- Commenter info (for non-registered users)
  commenter_name TEXT NOT NULL,
  commenter_email TEXT NOT NULL,
  
  -- Optional: Link to registered user if they're logged in
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Comment content
  comment_text TEXT NOT NULL,
  
  -- Moderation
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX idx_evidence_comments_evidence_id ON evidence_comments(evidence_id);
CREATE INDEX idx_evidence_comments_moderation_status ON evidence_comments(moderation_status);
CREATE INDEX idx_evidence_comments_created_at ON evidence_comments(created_at DESC);

-- Enable RLS
ALTER TABLE evidence_comments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view approved comments on public evidence
CREATE POLICY "Anyone can view approved comments on public evidence"
ON evidence_comments
FOR SELECT
USING (
  moderation_status = 'approved' 
  AND EXISTS (
    SELECT 1 FROM evidence 
    WHERE evidence.id = evidence_comments.evidence_id 
    AND evidence.is_public = true
    AND evidence.moderation_status = 'approved'
  )
);

-- Policy 2: Anyone (even anonymous) can insert comments
CREATE POLICY "Anyone can submit comments"
ON evidence_comments
FOR INSERT
WITH CHECK (true);

-- Policy 3: Admins can view all comments
CREATE POLICY "Admins can view all comments"
ON evidence_comments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy 4: Admins can update comments (for moderation)
CREATE POLICY "Admins can moderate comments"
ON evidence_comments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy 5: Admins can delete comments
CREATE POLICY "Admins can delete comments"
ON evidence_comments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));