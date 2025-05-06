
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
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
    const { email, password, metadata, isAdmin } = requestData;
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create the user with admin privileges
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata || {}
    });
    
    if (error) {
      console.error('Error creating user:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // If this is an admin user (with pazproperty.pt email), create admin role
    if (isAdmin || email.endsWith('@pazproperty.pt')) {
      const role = metadata?.adminType || 'admin'; // 'admin' or 'user' based on metadata
      
      // Add admin role to user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: role
        });
      
      if (roleError) {
        console.error('Error setting admin role:', roleError);
        // Don't fail the entire operation if role assignment fails
      } else {
        console.log(`User created with ${role} role`);
      }
    }
    
    return new Response(
      JSON.stringify({ user: data.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
