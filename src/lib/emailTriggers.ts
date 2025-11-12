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

/**
 * Triggers an email notification by calling the server-side edge function.
 * This wrapper ensures email triggering works with proper authentication and admin privileges.
 */
export async function triggerEventEmail(
  eventType: TriggerEvent,
  eventData: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Triggering email for event: ${eventType}`);
    
    const { data, error } = await supabase.functions.invoke('trigger-event-email', {
      body: {
        eventType,
        eventData,
      },
    });

    if (error) {
      console.error('Error triggering event email:', error);
      return { success: false, error: error.message };
    }

    console.log('Email trigger response:', data);
    return { success: true };
  } catch (error: any) {
    console.error('Error in triggerEventEmail:', error);
    return { success: false, error: error.message };
  }
}
