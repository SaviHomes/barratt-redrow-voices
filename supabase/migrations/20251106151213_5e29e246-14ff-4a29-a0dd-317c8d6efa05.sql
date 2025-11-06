-- Create enum for development ratings if not exists
DO $$ BEGIN
  CREATE TYPE public.rating_value AS ENUM ('1', '2', '3', '4', '5');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create development_ratings table
CREATE TABLE IF NOT EXISTS public.development_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  development_name TEXT NOT NULL,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  build_quality_rating INTEGER CHECK (build_quality_rating >= 1 AND build_quality_rating <= 5),
  customer_service_rating INTEGER CHECK (customer_service_rating >= 1 AND customer_service_rating <= 5),
  value_for_money_rating INTEGER CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),
  review_text TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, development_name)
);

-- Enable RLS
ALTER TABLE public.development_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for development_ratings
CREATE POLICY "Users can insert their own ratings"
ON public.development_ratings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.development_ratings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view all ratings"
ON public.development_ratings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage all ratings"
ON public.development_ratings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_development_ratings_updated_at
BEFORE UPDATE ON public.development_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_development_ratings_development_name ON public.development_ratings(development_name);
CREATE INDEX idx_development_ratings_user_id ON public.development_ratings(user_id);