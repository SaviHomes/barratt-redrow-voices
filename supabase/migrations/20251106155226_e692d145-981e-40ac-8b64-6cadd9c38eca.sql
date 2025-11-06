-- Create GLO interest registration table
CREATE TABLE public.glo_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  development_name TEXT,
  property_address TEXT,
  defect_categories TEXT[],
  estimated_damages NUMERIC,
  additional_comments TEXT,
  contact_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.glo_interest ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can register GLO interest"
  ON public.glo_interest
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own GLO interest"
  ON public.glo_interest
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own GLO interest"
  ON public.glo_interest
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all GLO interest"
  ON public.glo_interest
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all GLO interest"
  ON public.glo_interest
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER update_glo_interest_updated_at
  BEFORE UPDATE ON public.glo_interest
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();