-- Create email template backups table
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

-- Enable RLS
ALTER TABLE public.email_template_backups ENABLE ROW LEVEL SECURITY;

-- RLS policies for backups
CREATE POLICY "Admins can manage all backups"
  ON public.email_template_backups
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all backups"
  ON public.email_template_backups
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create audit log table
CREATE TABLE public.email_template_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS for audit log
ALTER TABLE public.email_template_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.email_template_audit_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to create automatic backup
CREATE OR REPLACE FUNCTION public.backup_email_template()
RETURNS TRIGGER AS $$
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
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic backups
CREATE TRIGGER backup_template_before_update
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.backup_email_template();

CREATE TRIGGER backup_template_before_delete
  BEFORE DELETE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.backup_email_template();

-- Function to restore template from backup
CREATE OR REPLACE FUNCTION public.restore_email_template(backup_id UUID, restore_as_new BOOLEAN DEFAULT false)
RETURNS UUID AS $$
DECLARE
  backup_record RECORD;
  new_template_id UUID;
BEGIN
  -- Get backup record
  SELECT * INTO backup_record FROM public.email_template_backups WHERE id = backup_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Backup not found';
  END IF;
  
  IF restore_as_new THEN
    -- Create new template from backup
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
      false, -- Never restore as system template
      auth.uid()
    ) RETURNING id INTO new_template_id;
  ELSE
    -- Update existing template
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
  
  -- Log restore action
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