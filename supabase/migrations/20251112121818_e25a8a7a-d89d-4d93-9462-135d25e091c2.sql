-- Insert the user-registration-notification email template
INSERT INTO public.email_templates (
  name,
  display_name,
  description,
  subject_template,
  html_content,
  category,
  variables,
  preview_data,
  is_active,
  is_system
) VALUES (
  'user-registration-notification',
  'Admin, a new user has registered',
  'Email to admin when a new user registers',
  'Admin, a new user has registered',
  '<p>Placeholder HTML - will be updated by sync</p>',
  'notification',
  '["userName", "userEmail", "propertyAddress", "developmentName", "registeredAt", "phone", "whatsappConsent", "gloConsent", "buildStyle", "viewProfileUrl"]'::jsonb,
  '{
    "userName": "Sarah Johnson",
    "userEmail": "sarah.johnson@example.com",
    "propertyAddress": "42 Oak Avenue, Manchester, Greater Manchester, M15 4XX",
    "developmentName": "Heritage Park",
    "registeredAt": "12 Nov 2025, 10:30 AM",
    "phone": "+44 7700 900123",
    "whatsappConsent": true,
    "gloConsent": true,
    "buildStyle": "New Build - Help to Buy",
    "viewProfileUrl": "https://www.redrowexposed.co.uk/admin/user-management"
  }'::jsonb,
  true,
  false
);