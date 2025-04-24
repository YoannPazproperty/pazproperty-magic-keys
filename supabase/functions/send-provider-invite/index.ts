
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { Resend } from 'npm:resend@2.0.0';
import { corsHeaders } from './cors.ts';
import { ProviderInviteRequest } from './types.ts';
import { getProviderData, getUserByEmail, updateUserMetadata, createUser, ensureUserRole } from './database.ts';
import { sendInvitationEmail } from './email.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize clients with environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://pazproperty.pt';

    // Check if required environment variables are set
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('Email service configuration is missing');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
      throw new Error('Database configuration is missing');
    }

    const resend = new Resend(resendApiKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { providerId }: ProviderInviteRequest = await req.json();
    if (!providerId) {
      throw new Error('Provider ID is required');
    }

    console.log(`Processing invitation for provider ID: ${providerId}`);

    // Get provider info
    const provider = await getProviderData(supabase, providerId);
    console.log(`Provider found: ${provider.empresa}, Email: ${provider.email}`);

    // Check if email exists
    if (!provider.email) {
      throw new Error('Provider email is missing');
    }

    // Check if user exists and handle account creation/update
    const existingUser = await getUserByEmail(supabase, provider.email);
    let userId: string;
    let tempPassword: string | undefined;
    
    // Create temporary password only for new users
    if (!existingUser) {
      tempPassword = crypto.randomUUID().split('-')[0];
    }

    try {
      if (existingUser) {
        userId = existingUser.id;
        await updateUserMetadata(supabase, userId, {
          provider_id: providerId,
          nome: provider.nome_gerente,
          empresa: provider.empresa
        });
      } else {
        const newUser = await createUser(supabase, provider.email, tempPassword!, {
          provider_id: providerId,
          nome: provider.nome_gerente,
          empresa: provider.empresa
        });
        userId = newUser.id;
      }

      // Ensure user has manager role
      await ensureUserRole(supabase, userId, 'manager');

      // Send invitation email
      let emailResult = null;
      let emailError = null;
      let wasEmailSent = false;

      try {
        emailResult = await sendInvitationEmail(
          resend,
          provider.email,
          provider.nome_gerente,
          !existingUser,
          tempPassword,
          publicSiteUrl
        );
        wasEmailSent = true;
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        emailError = {
          message: emailError.message || "Unknown email error",
          statusCode: emailError.statusCode || 500
        };
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: wasEmailSent ? 'Invitation sent successfully' : 'User account created/updated but email could not be sent',
          isNewUser: !existingUser,
          emailSent: wasEmailSent,
          emailError: emailError ? {
            message: emailError.message,
            code: emailError.statusCode || 'UNKNOWN'
          } : null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (error) {
      console.error('Error managing user account:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in send-provider-invite function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An unknown error occurred',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 even with errors, to avoid CORS issues
      }
    );
  }
});
