-- Create photo_comments table for photo/video-level comments
CREATE TABLE photo_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_caption_id UUID NOT NULL REFERENCES evidence_photo_captions(id) ON DELETE CASCADE,
  
  -- Commenter info
  commenter_name TEXT NOT NULL,
  commenter_email TEXT NOT NULL,
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

-- Create indexes for performance
CREATE INDEX idx_photo_comments_photo_caption_id ON photo_comments(photo_caption_id);
CREATE INDEX idx_photo_comments_moderation_status ON photo_comments(moderation_status);
CREATE INDEX idx_photo_comments_created_at ON photo_comments(created_at DESC);

-- Enable RLS
ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view approved comments on photos from public evidence
CREATE POLICY "Anyone can view approved photo comments on public evidence"
ON photo_comments
FOR SELECT
USING (
  moderation_status = 'approved' 
  AND EXISTS (
    SELECT 1 
    FROM evidence_photo_captions epc
    JOIN evidence e ON e.id = epc.evidence_id
    WHERE epc.id = photo_comments.photo_caption_id 
    AND e.is_public = true
    AND e.moderation_status = 'approved'
  )
);

-- Policy 2: Anyone can submit photo comments
CREATE POLICY "Anyone can submit photo comments"
ON photo_comments
FOR INSERT
WITH CHECK (true);

-- Policy 3: Admins can view all photo comments
CREATE POLICY "Admins can view all photo comments"
ON photo_comments
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy 4: Admins can moderate photo comments
CREATE POLICY "Admins can moderate photo comments"
ON photo_comments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy 5: Admins can delete photo comments
CREATE POLICY "Admins can delete photo comments"
ON photo_comments
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));