-- Create evidence table for tracking user submissions
CREATE TABLE public.evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('structural', 'electrical', 'plumbing', 'finishing', 'external', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

-- Create policies for evidence access
CREATE POLICY "Users can view their own evidence" 
ON public.evidence 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own evidence" 
ON public.evidence 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evidence" 
ON public.evidence 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evidence" 
ON public.evidence 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage bucket for evidence photos
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence-photos', 'evidence-photos', false);

-- Create storage policies for evidence photos
CREATE POLICY "Users can view their own evidence photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'evidence-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own evidence photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'evidence-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own evidence photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'evidence-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own evidence photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'evidence-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_evidence_updated_at
BEFORE UPDATE ON public.evidence
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();