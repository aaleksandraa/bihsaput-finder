import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  name: string;
  type: 'license_verified' | 'profile_approved';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, type }: NotificationRequest = await req.json();

    let subject = '';
    let html = '';

    if (type === 'license_verified') {
      subject = 'Vaša licenca je verifikovana';
      html = `
        <h1>Čestitamo, ${name}!</h1>
        <p>Vaša licenca je uspješno verifikovana od strane administratora.</p>
        <p>Vaš profil sada prikazuje verifikaciju licence, što pomaže klijentima da vas lakše prepoznaju kao provjeren profesionalac.</p>
        <p>Srdačan pozdrav,<br>Vaš Tim</p>
      `;
    } else if (type === 'profile_approved') {
      subject = 'Vaš profil je odobren';
      html = `
        <h1>Dobrodošli, ${name}!</h1>
        <p>Vaš profil je uspješno odobren od strane administratora i sada je javno vidljiv.</p>
        <p>Klijenti mogu vidjeti vaš profil i kontaktirati vas preko platforme.</p>
        <p>Srdačan pozdrav,<br>Vaš Tim</p>
      `;
    }

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Platforma <onboarding@resend.dev>',
        to: [email],
        subject: subject,
        html: html,
      }),
    });

    const emailData = await emailResponse.json();
    
    if (!emailResponse.ok) {
      throw new Error(emailData.message || 'Failed to send email');
    }

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
