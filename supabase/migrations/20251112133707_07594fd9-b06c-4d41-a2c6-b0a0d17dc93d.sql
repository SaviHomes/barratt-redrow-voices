-- Create news_articles table
CREATE TABLE public.news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  article_url text NOT NULL,
  source text NOT NULL,
  article_date date NOT NULL,
  thumbnail_url text,
  is_approved boolean DEFAULT false,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  order_index integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all articles"
  ON public.news_articles
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view approved articles"
  ON public.news_articles
  FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Deny anonymous access"
  ON public.news_articles
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_news_articles_approved 
  ON public.news_articles(is_approved, article_date DESC);

CREATE INDEX idx_news_articles_order 
  ON public.news_articles(order_index, article_date DESC);