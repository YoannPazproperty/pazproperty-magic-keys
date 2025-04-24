
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { Resend } from 'npm:resend@2.0.0';
import { corsHeaders } from './cors.ts';
import { ProviderInviteRequest } from './types.ts';
import { getProviderData, getUserByEmail, updateUserMetadata, createUser, ensureUserRole } from './database.ts';
import { sendInvitationEmail } from './email.ts';

Deno.serve(async (req) => {
  console.log("Received provider invite request");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize clients with environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://pazproperty.pt';

    // Log environment variable status (pas leurs valeurs pour sécurité)
    console.log("Environment check:", { 
      hasResendKey: !!resendApiKey, 
      hasSupabaseUrl: !!supabaseUrl, 
      hasServiceKey: !!supabaseServiceKey,
      publicSiteUrl
    });

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
    let body;
    try {
      body = await req.json();
      console.log("Request body received:", body);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      throw new Error("Invalid request body format");
    }
    
    const { providerId } = body as ProviderInviteRequest;
    if (!providerId) {
      console.error("Missing providerId in request");
      throw new Error('Provider ID is required');
    }

    console.log(`Processing invitation for provider ID: ${providerId}`);

    // Get provider info
    const provider = await getProviderData(supabase, providerId);
    console.log(`Provider found: ${provider.empresa}, Email: ${provider.email}`);

    // Check if email exists
    if (!provider.email) {
      console.error("Provider has no email");
      throw new Error('Provider email is missing');
    }

    // Check if user exists and handle account creation/update
    const existingUser = await getUserByEmail(supabase, provider.email);
    console.log("User check:", existingUser ? "User exists" : "User does not exist");
    
    let userId: string;
    let tempPassword: string | undefined;
    
    // Create temporary password only for new users
    if (!existingUser) {
      tempPassword = crypto.randomUUID().split('-')[0];
      console.log("Generated temporary password for new user");
    }

    try {
      if (existingUser) {
        userId = existingUser.id;
        console.log(`Updating existing user metadata for user: ${userId}`);
        await updateUserMetadata(supabase, userId, {
          provider_id: providerId,
          nome: provider.nome_gerente,
          empresa: provider.empresa
        });
      } else {
        console.log(`Creating new user for email: ${provider.email}`);
        const newUser = await createUser(supabase, provider.email, tempPassword!, {
          provider_id: providerId,
          nome: provider.nome_gerente,
          empresa: provider.empresa
        });
        userId = newUser.id;
        console.log(`New user created with ID: ${userId}`);
      }

      // Ensure user has manager role
      console.log(`Ensuring user ${userId} has manager role`);
      await ensureUserRole(supabase, userId, 'manager');

      // Send invitation email
      let emailResult = null;
      let emailError = null;
      let wasEmailSent = false;

      try {
        console.log("Sending invitation email");
        emailResult = await sendInvitationEmail(
          resend,
          provider.email,
          provider.nome_gerente,
          !existingUser,
          tempPassword,
          publicSiteUrl
        );
        wasEmailSent = true;
        console.log("Email sent successfully");
      } catch (emailErr: any) {
        console.error('Error sending invitation email:', emailErr);
        emailError = {
          message: emailErr.message || "Unknown email error",
          statusCode: emailErr.statusCode || 500
        };
      }

      const responseData = {
        success: true,
        message: wasEmailSent ? 'Invitation sent successfully' : 'User account created/updated but email could not be sent',
        isNewUser: !existingUser,
        emailSent: wasEmailSent,
        emailError: emailError ? {
          message: emailError.message,
          code: emailError.statusCode || 'UNKNOWN'
        } : null
      };
      
      console.log("Sending successful response:", responseData);
      
      return new Response(
        JSON.stringify(responseData),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (error) {
      console.error('Error managing user account:', error);
      throw error;
    }
  } catch (error: any) {
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
