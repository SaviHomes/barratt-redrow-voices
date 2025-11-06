import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BackupRequest {
  templateId: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    const authClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: hasAdminRole } = await authClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasAdminRole) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { templateId, notes }: BackupRequest = await req.json();

    const adminClient = createClient(supabaseUrl, supabaseKey);

    // Get the template to backup
    const { data: template, error: templateError } = await adminClient
      .from("email_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      return new Response(JSON.stringify({ error: "Template not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create manual backup
    const { data: backup, error: backupError } = await adminClient
      .from("email_template_backups")
      .insert({
        template_id: template.id,
        name: template.name,
        display_name: template.display_name,
        description: template.description,
        subject_template: template.subject_template,
        html_content: template.html_content,
        variables: template.variables,
        category: template.category,
        preview_data: template.preview_data,
        is_active: template.is_active,
        is_system: template.is_system,
        backup_reason: "manual",
        backup_notes: notes,
        backed_up_by: user.id,
        original_created_at: template.created_at,
        original_updated_at: template.updated_at,
      })
      .select()
      .single();

    if (backupError) {
      console.error("Backup creation error:", backupError);
      return new Response(JSON.stringify({ error: backupError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the action
    await adminClient.from("email_template_audit_log").insert({
      template_id: template.id,
      action: "MANUAL_BACKUP",
      performed_by: user.id,
      metadata: {
        backup_id: backup.id,
        notes: notes,
      },
    });

    return new Response(JSON.stringify({ success: true, backup }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in backup-templates function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
