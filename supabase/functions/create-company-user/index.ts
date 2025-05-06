
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
    const { email, password, metadata } = requestData;
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Vérifier que l'email est un email @pazproperty.pt
    if (!email.endsWith('@pazproperty.pt')) {
      return new Response(
        JSON.stringify({ error: 'Only @pazproperty.pt email addresses are allowed' }),
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
    
    // Vérifier d'abord si l'utilisateur existe déjà
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
    
    // Si l'utilisateur existe déjà, renvoyer une erreur
    if (existingUsers && existingUsers.users && existingUsers.users.length > 0) {
      console.log('User already exists with email:', email);
      return new Response(
        JSON.stringify({ 
          error: 'A user with this email address already exists',
          details: 'An account with this email address is already registered in the system'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Créer l'utilisateur avec confirmation email automatique
    console.log("Creating user:", email);
    
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

    // Ajouter le rôle admin
    const role = metadata?.adminType || 'admin'; // 'admin' ou 'user' basé sur metadata
    
    // Ajouter le rôle dans user_roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: data.user.id,
        role: role
      });
    
    if (roleError) {
      console.error('Error setting admin role:', roleError);
      // Ne pas faire échouer toute l'opération si l'attribution du rôle échoue
    } else {
      console.log(`User created with ${role} role`);
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
