-- Fix RLS policy to allow service role operations for email template sync
DROP POLICY IF EXISTS "Admins can manage email templates" ON email_templates;

CREATE POLICY "Admins can manage email templates" ON email_templates
  FOR ALL
  USING (
    -- Allow if using service role (for automated sync from edge functions)
    auth.role() = 'service_role'
    OR
    -- Allow if authenticated user has admin role (for manual UI operations)
    has_role(auth.uid(), 'admin'::app_role)
  );