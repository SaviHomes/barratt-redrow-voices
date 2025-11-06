import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { renderAsync } from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

// Import email templates from local _templates directory
import { WelcomeEmail } from './_templates/welcome.tsx';
import { EvidenceApprovedEmail } from './_templates/evidence-approved.tsx';
import { EvidenceRejectedEmail } from './_templates/evidence-rejected.tsx';
import { NewsletterEmail } from './_templates/newsletter.tsx';
import { GloUpdateEmail } from './_templates/glo-update.tsx';
import { CustomEmail } from './_templates/custom.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TemplateConfig {
  name: string;
  component: any;
  previewData: Record<string, any>;
}

const templates: TemplateConfig[] = [
  {
    name: 'welcome',
    component: WelcomeEmail,
    previewData: {
      userName: 'John Smith',
      dashboardUrl: 'https://example.com/dashboard'
    }
  },
  {
    name: 'evidence-approved',
    component: EvidenceApprovedEmail,
    previewData: {
      userName: 'John Smith',
      evidenceTitle: 'Roof Damage Documentation',
      viewUrl: 'https://example.com/evidence/123'
    }
  },
  {
    name: 'evidence-rejected',
    component: EvidenceRejectedEmail,
    previewData: {
      userName: 'John Smith',
      evidenceTitle: 'Floor Defect Photos',
      rejectionReason: 'The images are too blurry. Please resubmit with clearer photos.',
      resubmitUrl: 'https://example.com/upload-evidence'
    }
  },
  {
    name: 'newsletter',
    component: NewsletterEmail,
    previewData: {
      announcementTitle: 'Important Platform Updates',
      announcementBody: '<p>We are excited to announce new features that will help you track your claims more effectively.</p>',
      ctaText: 'View Updates',
      ctaUrl: 'https://example.com/updates'
    }
  },
  {
    name: 'glo-update',
    component: GloUpdateEmail,
    previewData: {
      updateTitle: 'Case Progress Update',
      updateBody: '<p>We wanted to keep you informed about the latest developments in the group litigation case.</p>',
      ctaText: 'Read Full Update',
      ctaUrl: 'https://example.com/glo-info'
    }
  },
  {
    name: 'custom',
    component: CustomEmail,
    previewData: {
      title: 'Important Notification',
      body: '<p>This is a custom email message with important information for you.</p>',
      ctaText: 'Learn More',
      ctaUrl: 'https://example.com'
    }
  }
];

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !isAdmin) {
      console.error('Admin check failed:', roleError);
      throw new Error('Forbidden: Admin access required');
    }

    console.log('Starting email template sync...');

    const results = [];

    // Process each template
    for (const template of templates) {
      try {
        console.log(`Rendering template: ${template.name}`);

        // Render the React Email component to HTML
        const html = await renderAsync(
          React.createElement(template.component, template.previewData)
        );

        console.log(`Rendered HTML for ${template.name}, length: ${html.length}`);

        // Update the database record
        const { error: updateError } = await supabaseClient
          .from('email_templates')
          .update({
            html_content: html,
            updated_at: new Date().toISOString()
          })
          .eq('name', template.name);

        if (updateError) {
          console.error(`Error updating template ${template.name}:`, updateError);
          results.push({
            template: template.name,
            success: false,
            error: updateError.message
          });
        } else {
          console.log(`Successfully updated template: ${template.name}`);
          results.push({
            template: template.name,
            success: true
          });
        }
      } catch (error: any) {
        console.error(`Error processing template ${template.name}:`, error);
        results.push({
          template: template.name,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Sync complete: ${successCount} succeeded, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${successCount} templates successfully, ${failureCount} failed`,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in sync-email-templates function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 401 : error.message.includes('Forbidden') ? 403 : 500,
      }
    );
  }
};

serve(handler);
