import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@3.2.0";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/render@0.0.12";
import { WelcomeEmail } from "./_templates/welcome.tsx";
import { EvidenceApprovedEmail } from "./_templates/evidence-approved.tsx";
import { EvidenceRejectedEmail } from "./_templates/evidence-rejected.tsx";
import { NewsletterEmail } from "./_templates/newsletter.tsx";
import { GloUpdateEmail } from "./_templates/glo-update.tsx";
import { CustomEmail } from "./_templates/custom.tsx";
import { ContactAdminNotification } from "./_templates/contact-admin-notification.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminEmailRequest {
  templateId?: string; // Use custom template from DB
  template?: 'welcome' | 'evidence-approved' | 'evidence-rejected' | 'newsletter' | 'glo-update' | 'custom' | 'contact-admin-notification'; // Legacy
  recipients: string[];
  subject?: string; // Optional override
  customData?: Record<string, any>; // Variables to replace
}

// Helper function to replace {{variable}} placeholders
const replaceVariables = (template: string, data: Record<string, any>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    // Extract JWT token from Authorization header
    const jwt = authHeader.replace('Bearer ', '');

    // Create auth client with ANON key to verify user and check role
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verify user is authenticated by passing JWT directly
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(jwt);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await authClient
      .rpc("has_role", { _user_id: user.id, _role: "admin" });

    if (roleError || !isAdmin) {
      console.error("Admin check failed:", roleError);
      throw new Error("Admin access required");
    }

    // Create admin client with SERVICE_ROLE key for database operations
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { templateId, template, recipients, subject, customData = {} }: AdminEmailRequest = await req.json();

    let html: string;
    let finalSubject: string;

    if (templateId) {
      // Fetch template from database using admin client
      const { data: templateData, error: templateError } = await adminClient
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single();

      if (templateError || !templateData) {
        console.error('Template fetch error:', templateError);
        throw new Error('Template not found or inactive');
      }

      // Replace variables in HTML content and subject
      html = replaceVariables(templateData.html_content, customData);
      finalSubject = subject || replaceVariables(templateData.subject_template, customData);

      console.log(`Using database template: ${templateData.name}`);
    } else if (template) {
      // Legacy: use hardcoded React Email templates
      finalSubject = subject || 'Email from Redrow Exposed';
      
      console.log(`Sending ${template} email to ${recipients.length} recipients`);

      // Render the appropriate email template
      switch (template) {
        case 'welcome':
          html = await renderAsync(
            React.createElement(WelcomeEmail, {
              userName: customData.userName || 'User',
              dashboardUrl: customData.viewUrl || 'https://www.redrowexposed.co.uk',
            })
          );
          break;
        case 'evidence-approved':
          html = await renderAsync(
            React.createElement(EvidenceApprovedEmail, {
              userName: customData.userName || 'User',
              evidenceTitle: customData.evidenceTitle || 'Your Evidence',
              viewUrl: customData.viewUrl || 'https://www.redrowexposed.co.uk/public-gallery',
            })
          );
          break;
        case 'evidence-rejected':
          html = await renderAsync(
            React.createElement(EvidenceRejectedEmail, {
              userName: customData.userName || 'User',
              evidenceTitle: customData.evidenceTitle || 'Your Evidence',
              rejectionReason: customData.rejectionReason || 'Please review the guidelines and resubmit.',
              resubmitUrl: customData.resubmitUrl || 'https://www.redrowexposed.co.uk/upload-evidence',
            })
          );
          break;
        case 'newsletter':
          html = await renderAsync(
            React.createElement(NewsletterEmail, {
              announcementTitle: customData.announcementTitle || 'Newsletter',
              announcementBody: customData.announcementBody || '',
              ctaText: customData.ctaText,
              ctaUrl: customData.ctaUrl,
            })
          );
          break;
        case 'glo-update':
          html = await renderAsync(
            React.createElement(GloUpdateEmail, {
              updateTitle: customData.announcementTitle || 'GLO Update',
              updateBody: customData.announcementBody || '',
              ctaText: customData.ctaText,
              ctaUrl: customData.ctaUrl,
            })
          );
          break;
        case 'custom':
          html = await renderAsync(
            React.createElement(CustomEmail, {
              title: customData.announcementTitle || subject || 'Message',
              body: customData.announcementBody || '',
              ctaText: customData.ctaText,
              ctaUrl: customData.ctaUrl,
            })
          );
          break;
        case 'contact-admin-notification':
          html = await renderAsync(
            React.createElement(ContactAdminNotification, {
              userName: customData.userName || 'User',
              userEmail: customData.userEmail || 'user@example.com',
              subject: customData.subject || 'Contact Form Submission',
              message: customData.message || '',
              submittedAt: customData.submittedAt || new Date().toLocaleString()
            })
          );
          finalSubject = subject || 'New Contact Form Submission';
          break;
        default:
          throw new Error(`Unknown template: ${template}`);
      }
    } else {
      throw new Error('Either templateId or template must be provided');
    }

    // Send emails
    const emailPromises = recipients.map(async (email) => {
      try {
        const { data, error } = await resend.emails.send({
          from: "Redrow Exposed <noreply@redrowexposed.co.uk>",
          to: [email],
          subject: finalSubject,
          html: html,
        });

        if (error) {
          console.error(`Failed to send to ${email}:`, error);
          return { email, success: false, error: error.message };
        }

        console.log(`Email sent successfully to ${email}:`, data?.id);
        return { email, success: true, resendId: data?.id };
      } catch (err: any) {
        console.error(`Error sending to ${email}:`, err);
        return { email, success: false, error: err.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    // Log the email send in database using admin client
    await adminClient.from("email_logs").insert({
      template_type: templateId ? 'custom_template' : template || 'unknown',
      subject: finalSubject,
      recipients: recipients,
      sent_by: user.id,
      status: failedCount === 0 ? 'sent' : 'partial',
      metadata: {
        template_id: templateId,
        successCount,
        failedCount,
        customData,
        results: results.filter(r => !r.success),
      },
    });

    console.log(`Email batch complete: ${successCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successCount} emails successfully, ${failedCount} failed`,
        results,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-admin-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === "Unauthorized" || error.message === "Admin access required" ? 403 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
