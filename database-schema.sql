-- ================================================
-- REDROW EXPOSED - COMPLETE DATABASE SCHEMA
-- ================================================
-- 
-- Run this SQL in your external Supabase SQL Editor
-- 
-- Prerequisites:
-- 1. Create a new Supabase project
-- 2. Run this SQL in the SQL Editor
-- 3. Configure auth settings (enable email confirmations if needed)
-- 4. Add Edge Function secrets: RESEND_API_KEY, SITE_URL
-- 
-- ================================================

-- ================================================
-- PART 1: ENUMS (Custom Types)
-- ================================================

-- App roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Moderation status enum
CREATE TYPE public.moderation_status AS ENUM ('pending', 'approved', 'rejected');

-- Rating value enum  
DO $$ BEGIN
  CREATE TYPE public.rating_value AS ENUM ('1', '2', '3', '4', '5');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Email trigger events enum
CREATE TYPE public.trigger_event AS ENUM (
  'user_registered',
  'evidence_approved',
  'evidence_rejected',
  'evidence_submitted',
  'claim_submitted',
  'glo_registered',
  'manual',
  'comment_submitted'
);

-- ================================================
-- PART 2: UTILITY FUNCTIONS
-- ================================================

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to check user roles (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ================================================
-- PART 3: CORE TABLES
-- ================================================

-- ---------------------
-- User Roles Table
-- ---------------------
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------
-- Profiles Table
-- ---------------------
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  property_number TEXT,
  street_name TEXT NOT NULL,
  town_city TEXT NOT NULL,
  county TEXT NOT NULL,
  postcode TEXT NOT NULL,
  development_name TEXT,
  home_tel TEXT,
  mobile_tel TEXT,
  whatsapp_consent BOOLEAN NOT NULL DEFAULT false,
  build_style TEXT,
  advice_to_others TEXT,
  nhbc_contact BOOLEAN,
  social_media_consent BOOLEAN,
  decision_influenced BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------
-- Evidence Table
-- ---------------------
CREATE TABLE public.evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('structural', 'electrical', 'plumbing', 'finishing', 'external', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe', 'critical')),
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  featured_image_index INTEGER DEFAULT 0,
  moderation_status moderation_status DEFAULT 'pending',
  moderated_at TIMESTAMPTZ,
  moderated_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_evidence_public ON public.evidence(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX idx_evidence_moderation_status ON public.evidence(moderation_status);

CREATE POLICY "Users can view their own evidence" ON public.evidence FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own evidence" ON public.evidence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own evidence" ON public.evidence FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own evidence" ON public.evidence FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public evidence" ON public.evidence FOR SELECT USING (is_public = true);
CREATE POLICY "Admins can view all evidence" ON public.evidence FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can moderate evidence" ON public.evidence FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_evidence_updated_at BEFORE UPDATE ON public.evidence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------
-- Evidence Photo Captions Table
-- ---------------------
CREATE TABLE public.evidence_photo_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID REFERENCES public.evidence(id) ON DELETE CASCADE,
  photo_path TEXT NOT NULL,
  caption TEXT,
  label TEXT,
  poster_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.evidence_photo_captions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_evidence_photo_captions_evidence_id ON public.evidence_photo_captions(evidence_id);

CREATE POLICY "Anyone can view captions for public evidence" ON public.evidence_photo_captions FOR SELECT USING (EXISTS (SELECT 1 FROM public.evidence WHERE evidence.id = evidence_photo_captions.evidence_id AND evidence.is_public = true));
CREATE POLICY "Users can manage their own captions" ON public.evidence_photo_captions FOR ALL USING (EXISTS (SELECT 1 FROM public.evidence WHERE evidence.id = evidence_photo_captions.evidence_id AND evidence.user_id = auth.uid()));
CREATE POLICY "Admins can view all photo captions" ON public.evidence_photo_captions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ---------------------
-- Evidence Comments Table
-- ---------------------
CREATE TABLE public.evidence_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  commenter_name TEXT NOT NULL,
  commenter_email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  comment_text TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

ALTER TABLE public.evidence_comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_evidence_comments_evidence_id ON public.evidence_comments(evidence_id);
CREATE INDEX idx_evidence_comments_moderation_status ON public.evidence_comments(moderation_status);
CREATE INDEX idx_evidence_comments_created_at ON public.evidence_comments(created_at DESC);

CREATE POLICY "Anyone can view approved comments on public evidence" ON public.evidence_comments FOR SELECT USING (moderation_status = 'approved' AND EXISTS (SELECT 1 FROM evidence WHERE evidence.id = evidence_comments.evidence_id AND evidence.is_public = true AND evidence.moderation_status = 'approved'));
CREATE POLICY "Anyone can submit comments" ON public.evidence_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all comments" ON public.evidence_comments FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can moderate comments" ON public.evidence_comments FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete comments" ON public.evidence_comments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ---------------------
-- Photo Comments Table
-- ---------------------
CREATE TABLE public.photo_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_caption_id UUID NOT NULL REFERENCES evidence_photo_captions(id) ON DELETE CASCADE,
  commenter_name TEXT NOT NULL,
  commenter_email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  comment_text TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_photo_comments_photo_caption_id ON public.photo_comments(photo_caption_id);
CREATE INDEX idx_photo_comments_moderation_status ON public.photo_comments(moderation_status);
CREATE INDEX idx_photo_comments_created_at ON public.photo_comments(created_at DESC);

CREATE POLICY "Anyone can view approved photo comments on public evidence" ON public.photo_comments FOR SELECT USING (moderation_status = 'approved' AND EXISTS (SELECT 1 FROM evidence_photo_captions epc JOIN evidence e ON e.id = epc.evidence_id WHERE epc.id = photo_comments.photo_caption_id AND e.is_public = true AND e.moderation_status = 'approved'));
CREATE POLICY "Anyone can submit photo comments" ON public.photo_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all photo comments" ON public.photo_comments FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can moderate photo comments" ON public.photo_comments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete photo comments" ON public.photo_comments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ---------------------
-- Claims Table
-- ---------------------
CREATE TABLE public.claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  property_address TEXT NOT NULL,
  development_name TEXT,
  purchase_date DATE,
  completion_date DATE,
  property_type TEXT,
  claim_title TEXT NOT NULL,
  claim_description TEXT NOT NULL,
  issues_discovered_date DATE,
  defects_categories TEXT[] DEFAULT '{}',
  estimated_damages DECIMAL(10,2),
  costs_incurred DECIMAL(10,2),
  receipts_available BOOLEAN DEFAULT false,
  repair_quotes_obtained BOOLEAN DEFAULT false,
  previous_contact_with_redrow BOOLEAN DEFAULT false,
  legal_representation BOOLEAN DEFAULT false,
  additional_notes TEXT,
  supporting_documents TEXT[],
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_claims_user_id ON public.claims(user_id);
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_claims_created_at ON public.claims(created_at);

CREATE POLICY "Users can view their own claims" ON public.claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own claims" ON public.claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own claims" ON public.claims FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all claims" ON public.claims FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all claims" ON public.claims FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny all anonymous access to claims" ON public.claims AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------
-- GLO Interest Table
-- ---------------------
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

ALTER TABLE public.glo_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can register GLO interest" ON public.glo_interest FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own GLO interest" ON public.glo_interest FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own GLO interest" ON public.glo_interest FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all GLO interest" ON public.glo_interest FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all GLO interest" ON public.glo_interest FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_glo_interest_updated_at BEFORE UPDATE ON public.glo_interest FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------
-- Development Ratings Table
-- ---------------------
CREATE TABLE public.development_ratings (
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

ALTER TABLE public.development_ratings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_development_ratings_development_name ON public.development_ratings(development_name);
CREATE INDEX idx_development_ratings_user_id ON public.development_ratings(user_id);

CREATE POLICY "Users can insert their own ratings" ON public.development_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ratings" ON public.development_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view all ratings" ON public.development_ratings FOR SELECT USING (true);
CREATE POLICY "Admins can manage all ratings" ON public.development_ratings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_development_ratings_updated_at BEFORE UPDATE ON public.development_ratings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------
-- Visitor Analytics Table
-- ---------------------
CREATE TABLE public.visitor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  user_agent TEXT,
  referrer TEXT,
  page_path TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  traffic_type TEXT DEFAULT 'unknown',
  request_headers JSONB,
  is_lovable_infrastructure BOOLEAN DEFAULT false,
  detection_method TEXT,
  request_timing_ms INTEGER,
  session_duration_ms INTEGER
);

ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_visitor_analytics_visited_at ON public.visitor_analytics(visited_at DESC);
CREATE INDEX idx_visitor_analytics_ip ON public.visitor_analytics(ip_address);
CREATE INDEX idx_visitor_analytics_country ON public.visitor_analytics(country);
CREATE INDEX idx_visitor_analytics_traffic_type ON public.visitor_analytics(traffic_type);
CREATE INDEX idx_visitor_analytics_lovable_infra ON public.visitor_analytics(is_lovable_infrastructure);
CREATE INDEX idx_visitor_analytics_ip_visited ON public.visitor_analytics(ip_address, visited_at);

CREATE POLICY "Only admins can view visitor analytics" ON public.visitor_analytics FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can manage visitor analytics" ON public.visitor_analytics FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Allow service role to insert visitor data" ON public.visitor_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Deny anonymous SELECT on visitor analytics" ON public.visitor_analytics AS RESTRICTIVE FOR SELECT TO public USING (auth.uid() IS NOT NULL);
CREATE POLICY "Deny anonymous UPDATE on visitor analytics" ON public.visitor_analytics AS RESTRICTIVE FOR UPDATE TO public USING (auth.uid() IS NOT NULL);
CREATE POLICY "Deny anonymous DELETE on visitor analytics" ON public.visitor_analytics AS RESTRICTIVE FOR DELETE TO public USING (auth.uid() IS NOT NULL);

COMMENT ON COLUMN public.visitor_analytics.traffic_type IS 'Classification: human, bot, monitoring, unknown';
COMMENT ON COLUMN public.visitor_analytics.request_headers IS 'Full request headers for analysis';
COMMENT ON COLUMN public.visitor_analytics.is_lovable_infrastructure IS 'Flag indicating Lovable system traffic';
COMMENT ON COLUMN public.visitor_analytics.detection_method IS 'How traffic type was determined';
COMMENT ON COLUMN public.visitor_analytics.request_timing_ms IS 'Request processing time';
COMMENT ON COLUMN public.visitor_analytics.session_duration_ms IS 'Time since last request from same session';

-- ---------------------
-- FAQs Table
-- ---------------------
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published FAQs" ON public.faqs FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage all FAQs" ON public.faqs FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------
-- Site Settings Table
-- ---------------------
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------
-- News Articles Table
-- ---------------------
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  article_url TEXT NOT NULL,
  source TEXT NOT NULL,
  article_date DATE NOT NULL,
  thumbnail_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  order_index INTEGER DEFAULT 0
);

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all articles" ON public.news_articles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view approved articles" ON public.news_articles FOR SELECT USING (is_approved = true);
CREATE POLICY "Deny anonymous access" ON public.news_articles FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_news_articles_approved ON public.news_articles(is_approved, article_date DESC);
CREATE INDEX idx_news_articles_order ON public.news_articles(order_index, article_date DESC);

-- ---------------------
-- Social Posts Table
-- ---------------------
CREATE TABLE public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  post_url TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter')),
  company TEXT NOT NULL CHECK (company IN ('redrow', 'barratt', 'both')),
  creator_name TEXT NOT NULL,
  creator_handle TEXT,
  thumbnail_url TEXT,
  post_date DATE NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  order_index INTEGER DEFAULT 0
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all social posts" ON public.social_posts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view approved social posts" ON public.social_posts FOR SELECT USING (is_approved = true);

CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------
-- Password Reset Tokens Table
-- ---------------------
CREATE TABLE public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_email ON public.password_reset_tokens(email);

CREATE POLICY "Service role only" ON public.password_reset_tokens FOR ALL USING (false);

-- ================================================
-- PART 4: EMAIL SYSTEM TABLES
-- ================================================

-- ---------------------
-- Email Logs Table
-- ---------------------
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipients TEXT[] NOT NULL,
  sent_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent',
  resend_email_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_sent_by ON public.email_logs(sent_by);

CREATE POLICY "Admins can view all email logs" ON public.email_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert email logs" ON public.email_logs FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- ---------------------
-- Email Preferences Table
-- ---------------------
CREATE TABLE public.email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  newsletter_enabled BOOLEAN DEFAULT true,
  evidence_notifications BOOLEAN DEFAULT true,
  glo_updates BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email preferences" ON public.email_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own email preferences" ON public.email_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email preferences" ON public.email_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all email preferences" ON public.email_preferences FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_email_preferences_updated_at BEFORE UPDATE ON public.email_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------
-- Email Templates Table
-- ---------------------
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  subject_template TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'custom',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  preview_data JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_email_templates_active ON public.email_templates(is_active);
CREATE INDEX idx_email_templates_category ON public.email_templates(category);

CREATE POLICY "Admins can manage email templates" ON public.email_templates FOR ALL USING (auth.role() = 'service_role' OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view active templates" ON public.email_templates FOR SELECT USING (is_active = true);

-- ---------------------
-- Email Triggers Table
-- ---------------------
CREATE TABLE public.email_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  event_type trigger_event NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  recipient_config JSONB DEFAULT '{}'::jsonb,
  conditions JSONB DEFAULT '{}'::jsonb,
  delay_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, event_type)
);

ALTER TABLE public.email_triggers ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_email_triggers_event ON public.email_triggers(event_type, is_enabled);

CREATE POLICY "Admins can manage email triggers" ON public.email_triggers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service role can read active triggers" ON public.email_triggers FOR SELECT USING (is_enabled = true);

-- Email template updated_at trigger function
CREATE OR REPLACE FUNCTION update_email_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_email_template_updated_at();
CREATE TRIGGER email_triggers_updated_at BEFORE UPDATE ON public.email_triggers FOR EACH ROW EXECUTE FUNCTION update_email_template_updated_at();

-- ---------------------
-- Email Template Backups Table
-- ---------------------
CREATE TABLE public.email_template_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  subject_template TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  category TEXT DEFAULT 'custom',
  preview_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  backup_reason TEXT DEFAULT 'manual',
  backup_notes TEXT,
  backed_up_by UUID REFERENCES auth.users(id),
  backed_up_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  original_created_at TIMESTAMP WITH TIME ZONE,
  original_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.email_template_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all backups" ON public.email_template_backups FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all backups" ON public.email_template_backups FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- ---------------------
-- Email Template Audit Log Table
-- ---------------------
CREATE TABLE public.email_template_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.email_template_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON public.email_template_audit_log FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- ================================================
-- PART 5: ADVANCED FUNCTIONS
-- ================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    property_number,
    street_name,
    town_city,
    county,
    postcode,
    development_name,
    home_tel,
    mobile_tel,
    whatsapp_consent,
    build_style,
    advice_to_others,
    nhbc_contact,
    social_media_consent,
    decision_influenced
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'property_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'street_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'town_city', ''),
    COALESCE(NEW.raw_user_meta_data->>'county', ''),
    COALESCE(NEW.raw_user_meta_data->>'postcode', ''),
    COALESCE(NEW.raw_user_meta_data->>'development_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'home_tel', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile_tel', ''),
    COALESCE((NEW.raw_user_meta_data->>'whatsapp_consent')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'build_style', ''),
    COALESCE(NEW.raw_user_meta_data->>'advice_to_others', ''),
    COALESCE((NEW.raw_user_meta_data->>'nhbc_contact')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'social_media_consent')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'decision_influenced')::boolean, null)
  );
  RETURN NEW;
END;
$function$;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to backup email template
CREATE OR REPLACE FUNCTION public.backup_email_template()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.email_template_backups (
    template_id,
    name,
    display_name,
    description,
    subject_template,
    html_content,
    variables,
    category,
    preview_data,
    is_active,
    is_system,
    backup_reason,
    backed_up_by,
    original_created_at,
    original_updated_at
  ) VALUES (
    OLD.id,
    OLD.name,
    OLD.display_name,
    OLD.description,
    OLD.subject_template,
    OLD.html_content,
    OLD.variables,
    OLD.category,
    OLD.preview_data,
    OLD.is_active,
    OLD.is_system,
    CASE 
      WHEN TG_OP = 'DELETE' THEN 'auto-delete'
      ELSE 'auto-update'
    END,
    auth.uid(),
    OLD.created_at,
    OLD.updated_at
  );
  
  INSERT INTO public.email_template_audit_log (
    template_id,
    action,
    performed_by,
    metadata
  ) VALUES (
    OLD.id,
    TG_OP,
    auth.uid(),
    jsonb_build_object(
      'template_name', OLD.name,
      'backup_created', true
    )
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER backup_template_before_update BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.backup_email_template();
CREATE TRIGGER backup_template_before_delete BEFORE DELETE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.backup_email_template();

-- Function to restore email template
CREATE OR REPLACE FUNCTION public.restore_email_template(backup_id UUID, restore_as_new BOOLEAN DEFAULT false)
RETURNS UUID AS $$
DECLARE
  backup_record RECORD;
  new_template_id UUID;
BEGIN
  SELECT * INTO backup_record FROM public.email_template_backups WHERE id = backup_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Backup not found';
  END IF;
  
  IF restore_as_new THEN
    INSERT INTO public.email_templates (
      name,
      display_name,
      description,
      subject_template,
      html_content,
      variables,
      category,
      preview_data,
      is_active,
      is_system,
      created_by
    ) VALUES (
      backup_record.name || '_restored_' || extract(epoch from now())::text,
      backup_record.display_name || ' (Restored)',
      backup_record.description,
      backup_record.subject_template,
      backup_record.html_content,
      backup_record.variables,
      backup_record.category,
      backup_record.preview_data,
      backup_record.is_active,
      false,
      auth.uid()
    ) RETURNING id INTO new_template_id;
  ELSE
    UPDATE public.email_templates SET
      display_name = backup_record.display_name,
      description = backup_record.description,
      subject_template = backup_record.subject_template,
      html_content = backup_record.html_content,
      variables = backup_record.variables,
      category = backup_record.category,
      preview_data = backup_record.preview_data,
      is_active = backup_record.is_active,
      updated_at = now()
    WHERE id = backup_record.template_id;
    
    new_template_id := backup_record.template_id;
  END IF;
  
  INSERT INTO public.email_template_audit_log (
    template_id,
    action,
    performed_by,
    metadata
  ) VALUES (
    new_template_id,
    'RESTORE',
    auth.uid(),
    jsonb_build_object(
      'backup_id', backup_id,
      'restored_as_new', restore_as_new,
      'restored_from', backup_record.backed_up_at
    )
  );
  
  RETURN new_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update email template HTML (RLS bypass)
CREATE OR REPLACE FUNCTION update_email_template_html(
  template_name TEXT,
  new_html_content TEXT
) RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE email_templates
  SET 
    html_content = new_html_content,
    updated_at = NOW()
  WHERE name = template_name;
END;
$$;

GRANT EXECUTE ON FUNCTION update_email_template_html TO service_role;

-- Function to delete user by admin
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_profile jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;
  
  SELECT jsonb_build_object(
    'user_id', user_id,
    'first_name', first_name,
    'last_name', last_name,
    'deleted_at', now()
  ) INTO deleted_profile
  FROM public.profiles
  WHERE user_id = target_user_id;
  
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN deleted_profile;
END;
$$;

-- Function to get users with emails
CREATE OR REPLACE FUNCTION public.get_users_with_emails()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  email text,
  street_name text,
  property_number text,
  development_name text,
  town_city text,
  county text,
  postcode text,
  home_tel text,
  mobile_tel text,
  whatsapp_consent boolean,
  nhbc_contact boolean,
  social_media_consent boolean,
  decision_influenced boolean,
  build_style text,
  advice_to_others text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can view all user emails';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    u.email::text,
    p.street_name,
    p.property_number,
    p.development_name,
    p.town_city,
    p.county,
    p.postcode,
    p.home_tel,
    p.mobile_tel,
    p.whatsapp_consent,
    p.nhbc_contact,
    p.social_media_consent,
    p.decision_influenced,
    p.build_style,
    p.advice_to_others,
    p.created_at
  FROM public.profiles p
  INNER JOIN auth.users u ON u.id = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Function to get evidence stats per user
CREATE OR REPLACE FUNCTION public.get_user_evidence_stats()
RETURNS TABLE (
  user_id uuid,
  evidence_count bigint,
  photo_count bigint,
  video_count bigint,
  total_media_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can view user evidence statistics';
  END IF;
  
  RETURN QUERY
  SELECT 
    e.user_id,
    COUNT(DISTINCT e.id)::bigint as evidence_count,
    COUNT(CASE 
      WHEN epc.photo_path NOT LIKE '%.mp4' 
      AND epc.photo_path NOT LIKE '%.mov' 
      AND epc.photo_path NOT LIKE '%.avi' 
      AND epc.photo_path NOT LIKE '%.webm'
      AND epc.photo_path NOT LIKE '%.mkv'
      AND epc.photo_path NOT LIKE '%.m4v'
      THEN 1 
    END)::bigint as photo_count,
    COUNT(CASE 
      WHEN epc.photo_path LIKE '%.mp4' 
      OR epc.photo_path LIKE '%.mov' 
      OR epc.photo_path LIKE '%.avi' 
      OR epc.photo_path LIKE '%.webm'
      OR epc.photo_path LIKE '%.mkv'
      OR epc.photo_path LIKE '%.m4v'
      THEN 1 
    END)::bigint as video_count,
    COUNT(epc.id)::bigint as total_media_count
  FROM public.evidence e
  LEFT JOIN public.evidence_photo_captions epc ON epc.evidence_id = e.id
  GROUP BY e.user_id;
END;
$$;

-- Function to cleanup expired password tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_password_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < NOW() OR used_at IS NOT NULL;
END;
$$;

-- ================================================
-- PART 6: STORAGE BUCKET
-- ================================================

-- Create and configure storage bucket for evidence photos
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence-photos', 'evidence-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies
CREATE POLICY "Users can view their own evidence photos" ON storage.objects FOR SELECT USING (bucket_id = 'evidence-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own evidence photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'evidence-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own evidence photos" ON storage.objects FOR UPDATE USING (bucket_id = 'evidence-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own evidence photos" ON storage.objects FOR DELETE USING (bucket_id = 'evidence-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view public evidence photos" ON storage.objects FOR SELECT USING (bucket_id = 'evidence-photos');

-- ================================================
-- PART 7: SEED DATA
-- ================================================

-- Default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('developments_page_enabled', 'false'::jsonb, 'Controls visibility of the Developments directory page'),
  ('customer_experiences_enabled', 'true'::jsonb, 'Controls visibility of customer experiences section')
ON CONFLICT (key) DO NOTHING;

-- Default FAQs
INSERT INTO public.faqs (question, answer, category, order_index, is_published) VALUES
  ('What types of Redrow property defects are common?', 'Common Redrow defects include structural issues, water damage, electrical problems, heating/insulation issues, roof leaks, and poor build quality finishing. Our platform documents hundreds of real cases across different developments.', 'general', 1, true),
  ('Can I claim compensation for Redrow property defects?', 'Yes, you may be entitled to compensation for repair costs, temporary accommodation, legal fees, and inconvenience caused by Redrow property defects. Our platform helps you document your case and submit formal claims.', 'claims', 2, true),
  ('How do I submit a complaint about Redrow build quality?', 'You can submit a formal complaint through our platform, contact Redrow customer care directly, or escalate to the Housing Ombudsman if necessary. We provide guidance on the most effective approach for your situation.', 'complaints', 3, true),
  ('Is this platform officially affiliated with Redrow?', 'No, this is an independent platform created by and for homeowners to share experiences and seek accountability. We are not affiliated with Redrow or Barratt Developments in any way.', 'general', 4, true),
  ('How can I upload evidence of property defects?', 'Use our secure upload system to share photos, documents, and detailed descriptions of property issues. All evidence is stored securely and can be used to support your claims and help other homeowners identify similar problems.', 'platform', 5, true),
  ('What should I do if Redrow won''t respond to my complaint?', 'If Redrow doesn''t respond adequately, you can escalate to the Housing Ombudsman, contact local trading standards, or consider legal action. Our platform provides resources and connects you with others who have faced similar issues.', 'complaints', 6, true)
ON CONFLICT DO NOTHING;

-- Default email templates
INSERT INTO email_templates (name, display_name, description, subject_template, html_content, variables, is_system, category, preview_data) VALUES
(
  'welcome',
  'Welcome Email',
  'Sent when new users register',
  'Welcome to Redrow Exposed, {{userName}}!',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;"><tr><td align="center" style="padding: 40px 0;"><table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;"><tr><td style="padding: 40px 40px 20px; text-align: center; background-color: #0891b2; border-radius: 8px 8px 0 0;"><h1 style="color: #ffffff; margin: 0; font-size: 28px;">Redrow Exposed</h1></td></tr><tr><td style="padding: 40px;"><h2 style="color: #0891b2; margin-top: 0;">Welcome!</h2><p style="color: #333333; line-height: 1.6; font-size: 16px;">Hi {{userName}},</p><p style="color: #333333; line-height: 1.6; font-size: 16px;">Thank you for joining Redrow Exposed.</p></td></tr></table></td></tr></table></body></html>',
  '["userName", "dashboardUrl"]'::jsonb,
  true,
  'system',
  '{"userName": "John Smith", "dashboardUrl": "https://example.com/dashboard"}'::jsonb
),
(
  'evidence-approved',
  'Evidence Approved',
  'Notify users when evidence is approved',
  'Your Evidence Has Been Approved!',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><p>Your evidence "{{evidenceTitle}}" has been approved.</p></body></html>',
  '["userName", "evidenceTitle", "viewUrl"]'::jsonb,
  true,
  'system',
  '{"userName": "Jane Doe", "evidenceTitle": "Test Evidence", "viewUrl": "https://example.com/evidence/123"}'::jsonb
),
(
  'evidence-rejected',
  'Evidence Rejected',
  'Notify users when evidence needs revision',
  'Update on Your Evidence Submission',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><p>Your evidence "{{evidenceTitle}}" needs revision: {{rejectionReason}}</p></body></html>',
  '["userName", "evidenceTitle", "rejectionReason", "resubmitUrl"]'::jsonb,
  true,
  'system',
  '{"userName": "John Smith", "evidenceTitle": "Water Damage", "rejectionReason": "Please provide clearer photos.", "resubmitUrl": "https://example.com/upload-evidence"}'::jsonb
),
(
  'newsletter',
  'Newsletter Template',
  'Monthly announcements and updates',
  '{{announcementTitle}}',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h2>{{announcementTitle}}</h2><div>{{announcementBody}}</div></body></html>',
  '["announcementTitle", "announcementBody", "ctaText", "ctaUrl"]'::jsonb,
  true,
  'marketing',
  '{"announcementTitle": "Monthly Update", "announcementBody": "<p>Updates here.</p>", "ctaText": "Read More", "ctaUrl": "https://example.com"}'::jsonb
),
(
  'glo-update',
  'GLO Update',
  'Group litigation updates',
  'GLO Update: {{updateTitle}}',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h2>{{updateTitle}}</h2><div>{{updateBody}}</div></body></html>',
  '["updateTitle", "updateBody", "ctaText", "ctaUrl"]'::jsonb,
  true,
  'system',
  '{"updateTitle": "Legal Update", "updateBody": "<p>Details here.</p>", "ctaText": "Learn More", "ctaUrl": "https://example.com/glo"}'::jsonb
),
(
  'custom',
  'Custom Message',
  'Blank template for custom messages',
  '{{title}}',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h2>{{title}}</h2><div>{{body}}</div></body></html>',
  '["title", "body", "ctaText", "ctaUrl"]'::jsonb,
  true,
  'custom',
  '{"title": "Custom Title", "body": "<p>Custom content.</p>", "ctaText": "Learn More", "ctaUrl": "https://example.com"}'::jsonb
),
(
  'user-registration-notification',
  'Admin, a new user has registered',
  'Email to admin when a new user registers',
  'Admin, a new user has registered',
  '<p>New user registered: {{userName}} ({{userEmail}})</p>',
  '["userName", "userEmail", "propertyAddress", "developmentName", "registeredAt", "phone", "whatsappConsent", "gloConsent", "buildStyle", "viewProfileUrl"]'::jsonb,
  false,
  'notification',
  '{"userName": "Sarah Johnson", "userEmail": "sarah@example.com", "propertyAddress": "42 Oak Avenue", "developmentName": "Heritage Park", "registeredAt": "12 Nov 2025", "viewProfileUrl": "https://example.com/admin/users"}'::jsonb
),
(
  'comment-admin-notification',
  'New Comment Requires Moderation',
  'Email sent to admin when a new comment is submitted',
  'New Comment Requires Moderation',
  '<p>New comment from {{commenterName}}: {{commentText}}</p>',
  '["commenterName", "commenterEmail", "commentText", "commentType", "evidenceTitle", "photoLabel", "photoUrl", "submittedAt", "approveUrl", "declineUrl", "viewUrl"]'::jsonb,
  false,
  'notification',
  '{"commenterName": "John Doe", "commenterEmail": "john@example.com", "commentText": "Great evidence!", "commentType": "evidence", "evidenceTitle": "Water Damage", "submittedAt": "12 Nov 2025"}'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- ================================================
-- SETUP COMPLETE
-- ================================================
-- 
-- After running this schema:
-- 
-- 1. Configure Auth settings in Supabase Dashboard:
--    - Enable email confirmations or auto-confirm as needed
-- 
-- 2. Add Edge Function secrets:
--    - RESEND_API_KEY (for email sending)
--    - SITE_URL (your production URL)
-- 
-- 3. Create an admin user:
--    - Register a user through the app
--    - Then run: INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_ID', 'admin');
-- 
-- ================================================
