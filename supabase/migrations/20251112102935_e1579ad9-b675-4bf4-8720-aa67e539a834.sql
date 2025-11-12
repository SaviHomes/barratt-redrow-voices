-- Fix backup_email_template function to return NEW instead of OLD
-- This allows UPDATE operations to proceed with new values while still creating backups

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
  
  -- Log the action
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
  
  -- Return NEW to allow the update to proceed (was returning OLD which discarded changes)
  RETURN NEW;
END;
$$;