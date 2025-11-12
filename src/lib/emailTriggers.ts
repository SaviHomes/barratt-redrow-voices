import { supabase } from "@/integrations/supabase/client";

export type TriggerEvent = 
  | 'user_registered'
  | 'evidence_approved'
  | 'evidence_rejected'
  | 'evidence_submitted'
  | 'claim_submitted'
  | 'glo_registered'
  | 'comment_submitted'
  | 'manual';

interface TriggerEventData {
  evidenceId?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  evidenceTitle?: string;
  rejectionReason?: string;
  [key: string]: any;
}

async function resolveRecipients(
  recipientConfig: any,
  eventData: TriggerEventData
): Promise<string[]> {
  const type = recipientConfig?.type || 'submitter';

  switch (type) {
    case 'submitter':
      return eventData.userEmail ? [eventData.userEmail] : [];
    
    case 'all_admins':
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      if (!adminRoles) return [];
      
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('user_id')
        .in('user_id', adminRoles.map(r => r.user_id));
      
      const adminEmails = await Promise.all(
        (adminProfiles || []).map(async (profile) => {
          const { data: { user } } = await supabase.auth.admin.getUserById(profile.user_id);
          return user?.email;
        })
      );
      
      return adminEmails.filter(Boolean) as string[];
    
    case 'all_users':
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('user_id');
      
      const allEmails = await Promise.all(
        (allProfiles || []).map(async (profile) => {
          const { data: { user } } = await supabase.auth.admin.getUserById(profile.user_id);
          return user?.email;
        })
      );
      
      return allEmails.filter(Boolean) as string[];
    
    default:
      return [];
  }
}

async function prepareTemplateData(
  eventType: TriggerEvent,
  eventData: TriggerEventData
): Promise<Record<string, any>> {
  const baseUrl = window.location.origin;

  switch (eventType) {
    case 'evidence_approved':
      return {
        userName: eventData.userName || 'User',
        evidenceTitle: eventData.evidenceTitle || 'Your Evidence',
        viewUrl: `${baseUrl}/public-gallery`,
      };
    
    case 'evidence_rejected':
      return {
        userName: eventData.userName || 'User',
        evidenceTitle: eventData.evidenceTitle || 'Your Evidence',
        rejectionReason: eventData.rejectionReason || 'Please review and resubmit',
        resubmitUrl: `${baseUrl}/upload-evidence`,
      };
    
    case 'user_registered':
      return {
        userName: eventData.userName || 'User',
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
      return eventData;
  }
}

export async function triggerEventEmail(
  eventType: TriggerEvent,
  eventData: TriggerEventData
): Promise<void> {
  try {
    console.log(`Checking for email trigger: ${eventType}`, eventData);

    // 1. Check if there's an active trigger for this event
    const { data: triggers, error: triggerError } = await supabase
      .from('email_triggers')
      .select('*, email_templates(*)')
      .eq('event_type', eventType)
      .eq('is_enabled', true);

    if (triggerError) {
      console.error('Error fetching triggers:', triggerError);
      return;
    }

    if (!triggers || triggers.length === 0) {
      console.log(`No active trigger for ${eventType}`);
      return;
    }

    // Process each trigger
    for (const trigger of triggers) {
      // @ts-ignore - email_templates relation
      const template = trigger.email_templates;
      
      if (!template || !template.is_active) {
        console.log(`Template inactive for trigger ${trigger.id}`);
        continue;
      }

      // 2. Determine recipients
      const recipients = await resolveRecipients(trigger.recipient_config, eventData);
      
      if (recipients.length === 0) {
        console.log(`No recipients for trigger ${trigger.id}`);
        continue;
      }

      // 3. Prepare template data
      const templateData = await prepareTemplateData(eventType, eventData);

      // 4. Send email via edge function
      const { error: sendError } = await supabase.functions.invoke('send-admin-email', {
        body: {
          templateId: template.id,
          recipients,
          customData: templateData,
        },
      });

      if (sendError) {
        console.error('Error sending triggered email:', sendError);
      } else {
        console.log(`Successfully triggered email for ${eventType} to ${recipients.length} recipients`);
      }
    }
  } catch (error) {
    console.error('Error in triggerEventEmail:', error);
  }
}
