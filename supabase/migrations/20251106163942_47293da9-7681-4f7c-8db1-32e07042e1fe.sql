-- Add public visibility and engagement fields to evidence table
ALTER TABLE public.evidence 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured_image_index INTEGER DEFAULT 0;

-- Create index for public evidence queries
CREATE INDEX IF NOT EXISTS idx_evidence_public ON public.evidence(is_public, created_at DESC) WHERE is_public = true;

-- Update RLS policy to allow public viewing of public evidence
CREATE POLICY "Anyone can view public evidence"
ON public.evidence
FOR SELECT
USING (is_public = true);

-- Create table for per-image captions
CREATE TABLE IF NOT EXISTS public.evidence_photo_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID REFERENCES public.evidence(id) ON DELETE CASCADE,
  photo_path TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on captions table
ALTER TABLE public.evidence_photo_captions ENABLE ROW LEVEL SECURITY;

-- Allow public viewing of captions for public evidence
CREATE POLICY "Anyone can view captions for public evidence"
ON public.evidence_photo_captions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.evidence 
    WHERE evidence.id = evidence_photo_captions.evidence_id 
    AND evidence.is_public = true
  )
);

-- Users can manage their own captions
CREATE POLICY "Users can manage their own captions"
ON public.evidence_photo_captions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.evidence 
    WHERE evidence.id = evidence_photo_captions.evidence_id 
    AND evidence.user_id = auth.uid()
  )
);