import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";
import React from 'https://esm.sh/react@18.3.1';
import { renderAsync } from 'https://esm.sh/@react-email/components@0.0.22';
import { ContactAdminNotification } from './_templates/contact-admin-notification.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`[${crypto.randomUUID()}] Processing contact form request`);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`[${crypto.randomUUID()}] Sending contact form email from: ${email}`);

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "Redrow Exposed <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Thank you for contacting us, ${name}!</h2>
            <p style="margin: 15px 0; line-height: 1.6;">We have received your message and will get back to you as soon as possible.</p>
            <p style="margin: 15px 0; line-height: 1.6;">Best regards,<br>The Redrow Exposed Team</p>
          </div>
        </div>
      `,
    });

    console.log("User confirmation email sent successfully:", userEmailResponse);

    // Send notification email to admin
    const adminEmailHtml = await renderAsync(
      React.createElement(ContactAdminNotification, {
        userName: name,
        userEmail: email,
        subject: subject,
        message: message,
        submittedAt: new Date().toLocaleString('en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Europe/London'
        })
      })
    );

    const adminEmailResponse = await resend.emails.send({
      from: "Redrow Exposed Contact Form <onboarding@resend.dev>",
      to: ["contact@redrowexposed.co.uk"],
      reply_to: email,
      subject: `New Contact Form: ${subject}`,
      html: adminEmailHtml,
    });

    console.log("Admin notification email sent successfully:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Emails sent successfully",
        userEmailId: userEmailResponse.data?.id,
        adminEmailId: adminEmailResponse.data?.id 
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
    console.error("Error in send-contact-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);