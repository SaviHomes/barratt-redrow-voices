import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TriggerEventData {
  eventType: string;
  eventData: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Received trigger-event-email request`);

  try {
    const { eventType, eventData }: TriggerEventData = await req.json();
    console.log(`[${requestId}] Event type: ${eventType}`);
    console.log(`[${requestId}] Event data keys: ${Object.keys(eventData).join(', ')}`);

    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch active email triggers for this event type
    const { data: triggers, error: triggersError } = await supabase
      .from('email_triggers')
      .select(`
        *,
        email_templates (
          id,
          name,
          subject_template
        )
      `)
      .eq('event_type', eventType)
      .eq('is_active', true);

    if (triggersError) {
      console.error(`[${requestId}] Error fetching triggers:`, triggersError);
      throw triggersError;
    }

    if (!triggers || triggers.length === 0) {
      console.log(`[${requestId}] No active triggers found for event: ${eventType}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `No active triggers for ${eventType}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`[${requestId}] Found ${triggers.length} active trigger(s)`);

    // Process each trigger
    const emailResults = [];
    for (const trigger of triggers) {
      console.log(`[${requestId}] Processing trigger: ${trigger.id}, template: ${trigger.template_id}`);

      try {
        // Resolve recipients
        const recipients = await resolveRecipients(supabase, trigger.recipient_config, eventData, requestId);
        console.log(`[${requestId}] Resolved ${recipients.length} recipient(s)`);

        if (recipients.length === 0) {
          console.warn(`[${requestId}] No recipients found for trigger ${trigger.id}`);
          continue;
        }

        // Prepare template data
        const templateData = await prepareTemplateData(supabase, eventType, eventData, requestId);
        console.log(`[${requestId}] Template data prepared with ${Object.keys(templateData).length} fields`);

        // Send emails to each recipient
        for (const recipientEmail of recipients) {
          console.log(`[${requestId}] Sending email to: ${recipientEmail}`);

          const { error: emailError } = await supabase.functions.invoke('send-admin-email', {
            body: {
              to: [recipientEmail],
              templateId: trigger.template_id,
              templateData,
            },
          });

          if (emailError) {
            console.error(`[${requestId}] Error sending email to ${recipientEmail}:`, emailError);
            emailResults.push({ 
              recipient: recipientEmail, 
              success: false, 
              error: emailError.message 
            });
          } else {
            console.log(`[${requestId}] Email sent successfully to ${recipientEmail}`);
            emailResults.push({ 
              recipient: recipientEmail, 
              success: true 
            });
          }
        }
      } catch (triggerError: any) {
        console.error(`[${requestId}] Error processing trigger ${trigger.id}:`, triggerError);
        emailResults.push({ 
          triggerId: trigger.id, 
          success: false, 
          error: triggerError.message 
        });
      }
    }

    console.log(`[${requestId}] Email trigger processing complete. Results:`, emailResults);

    return new Response(
      JSON.stringify({ 
        success: true, 
        triggersProcessed: triggers.length,
        emailResults 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error(`[${requestId}] Error in trigger-event-email:`, error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function resolveRecipients(
  supabase: any, 
  recipientConfig: any, 
  eventData: Record<string, any>,
  requestId: string
): Promise<string[]> {
  const recipients: string[] = [];
  
  if (!recipientConfig) {
    console.warn(`[${requestId}] No recipient config provided`);
    return recipients;
  }

  const recipientType = recipientConfig.type || 'all_admins';
  console.log(`[${requestId}] Resolving recipients of type: ${recipientType}`);

  switch (recipientType) {
    case 'submitter':
      if (eventData.userEmail) {
        recipients.push(eventData.userEmail);
      } else if (eventData.commenterEmail) {
        recipients.push(eventData.commenterEmail);
      }
      break;

    case 'all_admins':
      // Fetch all admin user IDs from user_roles table
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) {
        console.error(`[${requestId}] Error fetching admin roles:`, rolesError);
        break;
      }

      if (!adminRoles || adminRoles.length === 0) {
        console.warn(`[${requestId}] No admin users found`);
        break;
      }

      console.log(`[${requestId}] Found ${adminRoles.length} admin user(s)`);

      // Fetch email addresses for each admin using service role auth API
      for (const roleRecord of adminRoles) {
        try {
          const { data: user, error: userError } = await supabase.auth.admin.getUserById(
            roleRecord.user_id
          );

          if (userError) {
            console.error(`[${requestId}] Error fetching user ${roleRecord.user_id}:`, userError);
            continue;
          }

          if (user?.user?.email) {
            recipients.push(user.user.email);
            console.log(`[${requestId}] Added admin email: ${user.user.email}`);
          }
        } catch (error: any) {
          console.error(`[${requestId}] Error getting admin user email:`, error);
        }
      }
      break;

    case 'all_users':
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id');

      if (profilesError) {
        console.error(`[${requestId}] Error fetching profiles:`, profilesError);
        break;
      }

      if (!profiles || profiles.length === 0) {
        console.warn(`[${requestId}] No user profiles found`);
        break;
      }

      console.log(`[${requestId}] Found ${profiles.length} user profile(s)`);

      for (const profile of profiles) {
        try {
          const { data: user, error: userError } = await supabase.auth.admin.getUserById(
            profile.user_id
          );

          if (userError) {
            console.error(`[${requestId}] Error fetching user ${profile.user_id}:`, userError);
            continue;
          }

          if (user?.user?.email) {
            recipients.push(user.user.email);
          }
        } catch (error: any) {
          console.error(`[${requestId}] Error getting user email:`, error);
        }
      }
      break;

    case 'specific':
      if (recipientConfig.emails && Array.isArray(recipientConfig.emails)) {
        recipients.push(...recipientConfig.emails);
      }
      break;
  }

  console.log(`[${requestId}] Resolved ${recipients.length} total recipient(s)`);
  return [...new Set(recipients)]; // Remove duplicates
}

async function prepareTemplateData(
  supabase: any,
  eventType: string, 
  eventData: Record<string, any>,
  requestId: string
): Promise<Record<string, any>> {
  console.log(`[${requestId}] Preparing template data for event: ${eventType}`);
  
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'https://example.com';

  switch (eventType) {
    case 'evidence_approved':
      return {
        userName: eventData.userName || 'User',
        evidenceTitle: eventData.evidenceTitle || 'Your Evidence',
        approvalDate: eventData.approvalDate || new Date().toISOString(),
        viewUrl: eventData.viewUrl || `${baseUrl}/my-evidence`,
      };

    case 'evidence_rejected':
      return {
        userName: eventData.userName || 'User',
        evidenceTitle: eventData.evidenceTitle || 'Your Evidence',
        rejectionReason: eventData.rejectionReason || 'Did not meet guidelines',
        rejectionDate: eventData.rejectionDate || new Date().toISOString(),
      };

    case 'user_registered':
      return {
        userName: eventData.userName || 'New User',
        registrationDate: eventData.registrationDate || new Date().toISOString(),
        dashboardUrl: `${baseUrl}/user-dashboard`,
      };
    
    case 'comment_submitted':
      return {
        commenterName: eventData.commenterName || 'Anonymous',
        commenterEmail: eventData.commenterEmail || '',
        commentText: eventData.commentText || '',
        commentType: eventData.commentType || 'evidence',
        evidenceTitle: eventData.evidenceTitle || 'Evidence',
        photoLabel: eventData.photoLabel,
        photoUrl: eventData.photoUrl,
        submittedAt: eventData.submittedAt || new Date().toISOString(),
        approveUrl: `${baseUrl}/admin/comments`,
        declineUrl: `${baseUrl}/admin/comments`,
        viewUrl: eventData.viewUrl || `${baseUrl}/public-gallery`,
      };
    
    default:
      console.log(`[${requestId}] Using default template data for unknown event type`);
      return eventData;
  }
}
