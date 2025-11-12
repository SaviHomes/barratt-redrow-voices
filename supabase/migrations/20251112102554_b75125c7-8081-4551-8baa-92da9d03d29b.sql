-- Create RPC function to update email template HTML content with RLS bypass
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

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION update_email_template_html TO service_role;