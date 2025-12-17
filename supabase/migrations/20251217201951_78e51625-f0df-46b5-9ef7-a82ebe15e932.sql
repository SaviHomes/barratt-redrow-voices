-- Create complaints table for admin-managed complaints
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  complaint_date DATE NOT NULL,
  source TEXT,
  source_url TEXT,
  admin_notes TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all complaints"
  ON public.complaints FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view published complaints"
  ON public.complaints FOR SELECT
  USING (is_published = true);

-- Create trigger for updated_at
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed existing complaint
INSERT INTO public.complaints (title, description, location, complaint_date, source, is_published)
VALUES (
  'Property was built on a Swallowhole',
  'After purchasing a property in Royston, Hertfordshire, I was informed by NHBC that our new home was built on a chalk swallowhole. We were assured this was properly remediated. However, after contacting specialists, we discovered that minimal work had been done to address the issue, leaving our home potentially at risk of ground collapse.',
  'Royston, Hertfordshire',
  '2024-01-15',
  'NHBC Report',
  true
);