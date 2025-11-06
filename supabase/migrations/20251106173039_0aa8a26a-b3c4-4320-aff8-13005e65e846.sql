-- Create trigger_event enum
CREATE TYPE trigger_event AS ENUM (
  'user_registered',
  'evidence_approved',
  'evidence_rejected',
  'evidence_submitted',
  'claim_submitted',
  'glo_registered',
  'manual'
);

-- Create email_templates table
CREATE TABLE email_templates (
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

CREATE INDEX idx_email_templates_active ON email_templates(is_active);
CREATE INDEX idx_email_templates_category ON email_templates(category);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Admins can manage email templates"
ON email_templates FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active templates"
ON email_templates FOR SELECT
USING (is_active = true);

-- Create email_triggers table
CREATE TABLE email_triggers (
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

CREATE INDEX idx_email_triggers_event ON email_triggers(event_type, is_enabled);

-- Enable RLS
ALTER TABLE email_triggers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_triggers
CREATE POLICY "Admins can manage email triggers"
ON email_triggers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can read active triggers"
ON email_triggers FOR SELECT
USING (is_enabled = true);

-- Seed system templates with HTML versions
INSERT INTO email_templates (name, display_name, description, subject_template, html_content, variables, is_system, category, preview_data) VALUES
(
  'welcome',
  'Welcome Email',
  'Sent when new users register',
  'Welcome to Redrow Exposed, {{userName}}!',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;"><tr><td align="center" style="padding: 40px 0;"><table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;"><tr><td style="padding: 40px 40px 20px; text-align: center; background-color: #0891b2; border-radius: 8px 8px 0 0;"><h1 style="color: #ffffff; margin: 0; font-size: 28px;">Redrow Exposed</h1></td></tr><tr><td style="padding: 40px;"><h2 style="color: #0891b2; margin-top: 0;">Welcome to Redrow Exposed!</h2><p style="color: #333333; line-height: 1.6; font-size: 16px;">Hi {{userName}},</p><p style="color: #333333; line-height: 1.6; font-size: 16px;">Thank you for joining Redrow Exposed. We''re here to support homeowners who have experienced issues with their Redrow properties.</p><p style="color: #333333; line-height: 1.6; font-size: 16px;"><strong>What you can do:</strong></p><ul style="color: #333333; line-height: 1.6; font-size: 16px;"><li>Upload evidence of defects and issues</li><li>Submit formal claims</li><li>Join our Group Litigation Order</li><li>Connect with other affected homeowners</li></ul><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding: 20px 0;"><a href="{{dashboardUrl}}" style="background-color: #0891b2; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Go to Dashboard</a></td></tr></table></td></tr><tr><td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;"><p style="color: #6b7280; font-size: 14px; margin: 0;">© 2024 Redrow Exposed. All rights reserved.</p></td></tr></table></td></tr></table></body></html>',
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
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;"><tr><td align="center" style="padding: 40px 0;"><table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;"><tr><td style="padding: 40px 40px 20px; text-align: center; background-color: #0891b2; border-radius: 8px 8px 0 0;"><h1 style="color: #ffffff; margin: 0; font-size: 28px;">Redrow Exposed</h1></td></tr><tr><td style="padding: 40px;"><div style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 12px; font-weight: bold; padding: 6px 12px; border-radius: 4px; margin-bottom: 16px;">✓ APPROVED</div><h2 style="color: #0891b2; margin-top: 0;">Evidence Approved!</h2><p style="color: #333333; line-height: 1.6; font-size: 16px;">Hi {{userName}},</p><p style="color: #333333; line-height: 1.6; font-size: 16px;">Great news! Your evidence submission "<strong>{{evidenceTitle}}</strong>" has been reviewed and approved by our team.</p><p style="color: #333333; line-height: 1.6; font-size: 16px;">Your evidence is now publicly visible in our gallery and will help strengthen our collective case.</p><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding: 20px 0;"><a href="{{viewUrl}}" style="background-color: #0891b2; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Your Evidence</a></td></tr></table><div style="background-color: #eff6ff; padding: 16px; border-radius: 4px; border-left: 4px solid #0891b2;"><p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Thank you for contributing to our community!</strong> Your submission helps other homeowners understand the full extent of issues with Redrow properties.</p></div></td></tr><tr><td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;"><p style="color: #6b7280; font-size: 14px; margin: 0;">© 2024 Redrow Exposed. All rights reserved.</p></td></tr></table></td></tr></table></body></html>',
  '["userName", "evidenceTitle", "viewUrl"]'::jsonb,
  true,
  'system',
  '{"userName": "Jane Doe", "evidenceTitle": "Cracked Foundation in Living Room", "viewUrl": "https://example.com/evidence/123"}'::jsonb
),
(
  'evidence-rejected',
  'Evidence Rejected',
  'Notify users when evidence needs revision',
  'Update on Your Evidence Submission',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;"><tr><td align="center" style="padding: 40px 0;"><table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;"><tr><td style="padding: 40px 40px 20px; text-align: center; background-color: #0891b2; border-radius: 8px 8px 0 0;"><h1 style="color: #ffffff; margin: 0; font-size: 28px;">Redrow Exposed</h1></td></tr><tr><td style="padding: 40px;"><div style="display: inline-block; background-color: #f59e0b; color: #ffffff; font-size: 12px; font-weight: bold; padding: 6px 12px; border-radius: 4px; margin-bottom: 16px;">⚠ NEEDS REVISION</div><h2 style="color: #0891b2; margin-top: 0;">Evidence Requires Revision</h2><p style="color: #333333; line-height: 1.6; font-size: 16px;">Hi {{userName}},</p><p style="color: #333333; line-height: 1.6; font-size: 16px;">Thank you for submitting your evidence "<strong>{{evidenceTitle}}</strong>". Our team has reviewed it and we need you to make some revisions before we can approve it.</p><div style="background-color: #fef3c7; padding: 16px; border-radius: 4px; border-left: 4px solid #f59e0b; margin: 20px 0;"><p style="color: #92400e; margin: 0; font-size: 14px;"><strong>Reason for revision:</strong></p><p style="color: #92400e; margin: 10px 0 0; font-size: 14px;">{{rejectionReason}}</p></div><p style="color: #333333; line-height: 1.6; font-size: 16px;">Please review the feedback and resubmit your evidence with the necessary changes.</p><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding: 20px 0;"><a href="{{resubmitUrl}}" style="background-color: #0891b2; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Resubmit Evidence</a></td></tr></table></td></tr><tr><td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;"><p style="color: #6b7280; font-size: 14px; margin: 0;">© 2024 Redrow Exposed. All rights reserved.</p></td></tr></table></td></tr></table></body></html>',
  '["userName", "evidenceTitle", "rejectionReason", "resubmitUrl"]'::jsonb,
  true,
  'system',
  '{"userName": "John Smith", "evidenceTitle": "Water Damage", "rejectionReason": "Please provide clearer photos showing the extent of the damage. The current images are too dark to clearly see the issue.", "resubmitUrl": "https://example.com/upload-evidence"}'::jsonb
),
(
  'newsletter',
  'Newsletter Template',
  'Monthly announcements and updates',
  '{{announcementTitle}}',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;"><tr><td align="center" style="padding: 40px 0;"><table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;"><tr><td style="padding: 40px 40px 20px; text-align: center; background-color: #0891b2; border-radius: 8px 8px 0 0;"><h1 style="color: #ffffff; margin: 0; font-size: 28px;">Redrow Exposed</h1></td></tr><tr><td style="padding: 40px;"><div style="display: inline-block; background-color: #0891b2; color: #ffffff; font-size: 12px; font-weight: bold; padding: 6px 12px; border-radius: 4px; margin-bottom: 16px;">📰 NEWSLETTER</div><h2 style="color: #0891b2; margin-top: 0;">{{announcementTitle}}</h2><div style="color: #333333; line-height: 1.6; font-size: 16px;">{{announcementBody}}</div><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding: 20px 0;"><a href="{{ctaUrl}}" style="background-color: #0891b2; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">{{ctaText}}</a></td></tr></table></td></tr><tr><td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;"><p style="color: #6b7280; font-size: 14px; margin: 0;">© 2024 Redrow Exposed. All rights reserved.</p></td></tr></table></td></tr></table></body></html>',
  '["announcementTitle", "announcementBody", "ctaText", "ctaUrl"]'::jsonb,
  true,
  'marketing',
  '{"announcementTitle": "Monthly Update - December 2024", "announcementBody": "<p>Dear Community,</p><p>This month we have seen significant progress in our collective action. Here are the highlights:</p><ul><li>50+ new evidence submissions</li><li>Legal team review scheduled for January</li><li>New members joining daily</li></ul>", "ctaText": "Read Full Update", "ctaUrl": "https://example.com/updates"}'::jsonb
),
(
  'glo-update',
  'GLO Update',
  'Group litigation updates',
  'GLO Update: {{updateTitle}}',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;"><tr><td align="center" style="padding: 40px 0;"><table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;"><tr><td style="padding: 40px 40px 20px; text-align: center; background-color: #0891b2; border-radius: 8px 8px 0 0;"><h1 style="color: #ffffff; margin: 0; font-size: 28px;">Redrow Exposed</h1></td></tr><tr><td style="padding: 40px;"><div style="display: inline-block; background-color: #8b5cf6; color: #ffffff; font-size: 12px; font-weight: bold; padding: 6px 12px; border-radius: 4px; margin-bottom: 16px;">⚖️ GLO UPDATE</div><h2 style="color: #0891b2; margin-top: 0;">{{updateTitle}}</h2><div style="color: #333333; line-height: 1.6; font-size: 16px;">{{updateBody}}</div><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding: 20px 0;"><a href="{{ctaUrl}}" style="background-color: #0891b2; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">{{ctaText}}</a></td></tr></table><div style="background-color: #eff6ff; padding: 16px; border-radius: 4px; border-left: 4px solid #0891b2; margin-top: 20px;"><p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Stay informed:</strong> We will continue to keep you updated on all developments in our Group Litigation Order against Redrow.</p></div></td></tr><tr><td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;"><p style="color: #6b7280; font-size: 14px; margin: 0;">© 2024 Redrow Exposed. All rights reserved.</p></td></tr></table></td></tr></table></body></html>',
  '["updateTitle", "updateBody", "ctaText", "ctaUrl"]'::jsonb,
  true,
  'system',
  '{"updateTitle": "Legal Team Appointed", "updateBody": "<p>We are pleased to announce that our legal team has been formally appointed and will begin reviewing all submitted evidence next month.</p><p>This is a significant milestone in our collective action.</p>", "ctaText": "Learn More", "ctaUrl": "https://example.com/glo"}'::jsonb
),
(
  'custom',
  'Custom Message',
  'Blank template for custom messages',
  '{{title}}',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;"><tr><td align="center" style="padding: 40px 0;"><table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;"><tr><td style="padding: 40px 40px 20px; text-align: center; background-color: #0891b2; border-radius: 8px 8px 0 0;"><h1 style="color: #ffffff; margin: 0; font-size: 28px;">Redrow Exposed</h1></td></tr><tr><td style="padding: 40px;"><h2 style="color: #0891b2; margin-top: 0;">{{title}}</h2><div style="color: #333333; line-height: 1.6; font-size: 16px;">{{body}}</div><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding: 20px 0;"><a href="{{ctaUrl}}" style="background-color: #0891b2; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">{{ctaText}}</a></td></tr></table></td></tr><tr><td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;"><p style="color: #6b7280; font-size: 14px; margin: 0;">© 2024 Redrow Exposed. All rights reserved.</p></td></tr></table></td></tr></table></body></html>',
  '["title", "body", "ctaText", "ctaUrl"]'::jsonb,
  true,
  'custom',
  '{"title": "Important Announcement", "body": "<p>This is a custom message template that you can use for any purpose.</p>", "ctaText": "Learn More", "ctaUrl": "https://example.com"}'::jsonb
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_email_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_templates_updated_at
BEFORE UPDATE ON email_templates
FOR EACH ROW
EXECUTE FUNCTION update_email_template_updated_at();

CREATE TRIGGER email_triggers_updated_at
BEFORE UPDATE ON email_triggers
FOR EACH ROW
EXECUTE FUNCTION update_email_template_updated_at();