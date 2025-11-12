import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { WelcomeEmail } from "./_templates/welcome.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  userName: string;
  dashboardUrl?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] send-welcome-email invoked`);

  try {
    const { email, userName, dashboardUrl }: WelcomeEmailRequest = await req.json();
    console.log(`[${requestId}] Sending welcome email to: ${email}`);
    console.log(`[${requestId}] Request body:`, JSON.stringify({ email, userName, dashboardUrl }));

    if (!email || !userName) {
      throw new Error('email and userName are required');
    }

    const html = await renderAsync(
      React.createElement(WelcomeEmail, {
        userName,
        dashboardUrl: dashboardUrl || 'https://www.redrowexposed.co.uk/dashboard',
      })
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    console.log(`[${requestId}] Sending via Resend API...`);
    console.log(`[${requestId}] From: Redrow Exposed <noreply@redrowexposed.co.uk>, To: ${email}`);
    
    const { data, error } = await resend.emails.send({
      from: "Redrow Exposed <noreply@redrowexposed.co.uk>",
      to: [email],
      subject: "Welcome to Redrow Exposed",
      html,
    });

    if (error) {
      console.error(`[${requestId}] Resend error:`, error);
      throw error;
    }

    console.log(`[${requestId}] Welcome email sent successfully:`, data?.id);
    console.log(`[${requestId}] Full Resend response:`, JSON.stringify(data));

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error(`[${requestId}] Error in send-welcome-email:`, error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
