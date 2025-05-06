
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { Resend } from 'npm:resend@2.0.0';
import { corsHeaders } from '../_shared/cors.ts';

// Handle CORS
Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the request body
    const requestData = await req.json();
    const { email, name, userId, tempPassword } = requestData;
    
    if (!email || !name || !userId || !tempPassword) {
      return new Response(
        JSON.stringify({ error: 'Email, name, userId, and tempPassword are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    
    const resend = new Resend(resendApiKey);
    
    // Get the public site URL
    const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://www.pazproperty.pt';
    const adminLoginUrl = `${publicSiteUrl}/admin`;
    
    // Envoyer l'email d'invitation
    const { data, error } = await resend.emails.send({
      from: 'PazProperty <no-reply@pazproperty.pt>',
      to: [email],
      subject: 'Bienvenue sur PazProperty Admin - Vos identifiants de connexion',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Bienvenue sur PazProperty Admin</h1>
          <p>Bonjour ${name},</p>
          <p>Votre compte a été créé sur l'interface d'administration de PazProperty.</p>
          
          <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 12px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Identifiants de connexion :</strong></p>
            <p style="margin: 10px 0;">Email: <strong>${email}</strong></p>
            <p style="margin: 10px 0;">Mot de passe temporaire: <strong>${tempPassword}</strong></p>
          </div>
          
          <p>Pour vous connecter, cliquez sur le lien ci-dessous :</p>
          <a href="${adminLoginUrl}" style="display: inline-block; background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 15px 0;">
            Accéder à l'Administration
          </a>
          
          <p>Nous vous recommandons de changer votre mot de passe après votre première connexion.</p>
          
          <p>Cordialement,<br>L'équipe PazProperty</p>
        </div>
      `,
    });
    
    if (error) {
      console.error('Error sending invitation email:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Log dans Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase
        .from('logs')
        .insert({
          message: 'Email d\'invitation envoyé',
          data: {
            userId,
            email,
            type: 'company_invitation',
            timestamp: new Date().toISOString()
          }
        });
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation email sent successfully',
        emailId: data?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending invitation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
