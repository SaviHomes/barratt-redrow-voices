import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportRequest {
  backupId?: string; // If provided, export single backup; otherwise export all
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

    const { backupId }: ExportRequest = await req.json();

    const adminClient = createClient(supabaseUrl, supabaseKey);

    let exportData;
    let filename;

    if (backupId) {
      // Export single backup
      const { data: backup, error: backupError } = await adminClient
        .from("email_template_backups")
        .select("*")
        .eq("id", backupId)
        .single();

      if (backupError || !backup) {
        return new Response(JSON.stringify({ error: "Backup not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      exportData = {
        version: "1.0",
        exportType: "single",
        exportedAt: new Date().toISOString(),
        exportedBy: user.id,
        backup,
      };

      filename = `template-backup-${backup.name}-${Date.now()}.json`;
    } else {
      // Export all backups
      const { data: backups, error: backupsError } = await adminClient
        .from("email_template_backups")
        .select("*")
        .order("backed_up_at", { ascending: false });

      if (backupsError) {
        return new Response(JSON.stringify({ error: backupsError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      exportData = {
        version: "1.0",
        exportType: "full",
        exportedAt: new Date().toISOString(),
        exportedBy: user.id,
        backups,
      };

      filename = `all-template-backups-${Date.now()}.json`;
    }

    // Create downloadable JSON
    const jsonString = JSON.stringify(exportData, null, 2);

    return new Response(jsonString, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error in export-templates function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
