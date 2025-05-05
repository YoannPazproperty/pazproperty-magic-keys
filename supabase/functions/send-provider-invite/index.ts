
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { Resend } from 'npm:resend@2.0.0';
import { corsHeaders } from './cors.ts';
import { ProviderInviteRequest } from './types.ts';
import { processProviderInvite } from './inviteProcessor.ts';

Deno.serve(async (req) => {
  console.log("=== START: Provider invite processing ===");
  console.log("Request URL:", req.url);
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Initialize clients with environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://pazproperty.pt';

    // Log environment variable status (not their values for security)
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
    
    // Process the invitation using the separated module
    const result = await processProviderInvite(supabase, resend, providerId, publicSiteUrl);
    
    console.log("Sending successful response:", result);
    console.log("=== END: Provider invite processing ===");
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error: any) {
    console.error('Error in send-provider-invite function:', error);
    console.error('Error stack:', error.stack);
    console.log("=== END: Provider invite processing with error ===");
    
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
