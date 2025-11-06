-- Create faqs table
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Anyone can view published FAQs
CREATE POLICY "Anyone can view published FAQs"
  ON public.faqs
  FOR SELECT
  USING (is_published = true);

-- Only admins can manage FAQs
CREATE POLICY "Admins can manage all FAQs"
  ON public.faqs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default FAQs
INSERT INTO public.faqs (question, answer, category, order_index, is_published) VALUES
  ('What types of Redrow property defects are common?', 'Common Redrow defects include structural issues, water damage, electrical problems, heating/insulation issues, roof leaks, and poor build quality finishing. Our platform documents hundreds of real cases across different developments.', 'general', 1, true),
  ('Can I claim compensation for Redrow property defects?', 'Yes, you may be entitled to compensation for repair costs, temporary accommodation, legal fees, and inconvenience caused by Redrow property defects. Our platform helps you document your case and submit formal claims.', 'claims', 2, true),
  ('How do I submit a complaint about Redrow build quality?', 'You can submit a formal complaint through our platform, contact Redrow customer care directly, or escalate to the Housing Ombudsman if necessary. We provide guidance on the most effective approach for your situation.', 'complaints', 3, true),
  ('Is this platform officially affiliated with Redrow?', 'No, this is an independent platform created by and for homeowners to share experiences and seek accountability. We are not affiliated with Redrow or Barratt Developments in any way.', 'general', 4, true),
  ('How can I upload evidence of property defects?', 'Use our secure upload system to share photos, documents, and detailed descriptions of property issues. All evidence is stored securely and can be used to support your claims and help other homeowners identify similar problems.', 'platform', 5, true),
  ('What should I do if Redrow won''t respond to my complaint?', 'If Redrow doesn''t respond adequately, you can escalate to the Housing Ombudsman, contact local trading standards, or consider legal action. Our platform provides resources and connects you with others who have faced similar issues.', 'complaints', 6, true);