
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
    const { email } = requestData;
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
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
    
    // Vérifier si l'utilisateur existe dans auth.users
    const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers({
      filter: {
        email: email
      }
    });
    
    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return new Response(
        JSON.stringify({ error: `Failed to check if user exists: ${checkError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Vérifier si l'utilisateur existe
    const userExists = existingUsers && existingUsers.users && existingUsers.users.length > 0;
    
    let userData = null;
    if (userExists && existingUsers.users[0]) {
      // Renvoyer des informations limitées sur l'utilisateur par sécurité
      userData = {
        id: existingUsers.users[0].id,
        email: existingUsers.users[0].email,
        created_at: existingUsers.users[0].created_at
      };
    }
    
    console.log(`Check user exists for ${email}: ${userExists ? 'User exists' : 'User does not exist'}`);
    
    return new Response(
      JSON.stringify({ 
        exists: userExists,
        user: userData
      }),
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
