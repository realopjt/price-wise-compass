
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { PasswordResetEmail } from './_templates/password-reset-email.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    console.log('Password reset email function triggered');

    const body = await req.json();
    const { email, resetLink } = body;

    if (!email || !resetLink) {
      return new Response(
        JSON.stringify({ error: 'Missing email or resetLink' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Sending password reset email to:', email);

    const html = await renderAsync(
      React.createElement(PasswordResetEmail, {
        resetLink,
        userEmail: email,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'PriceWise <noreply@pricewise.app>',
      to: [email],
      subject: 'Reset your PriceWise password',
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Password reset email sent successfully:', data);
    return new Response(JSON.stringify({ 
      success: true, 
      messageId: data?.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-password-reset function:', error);
    return new Response(
      JSON.stringify({ 
        error: {
          message: error.message || 'Internal server error'
        }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
