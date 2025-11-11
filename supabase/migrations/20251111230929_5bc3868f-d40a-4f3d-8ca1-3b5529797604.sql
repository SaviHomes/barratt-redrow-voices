-- Allow admins to view all photo captions for evidence moderation
CREATE POLICY "Admins can view all photo captions"
ON public.evidence_photo_captions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));