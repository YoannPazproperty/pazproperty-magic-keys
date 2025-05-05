
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Gestion des requêtes OPTIONS (CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          error: "Configuration incorrecte - Variables d'environnement manquantes"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: "Email invalide" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Vérification de l'authentification pour l'email: ${email}`);

    // Rechercher d'abord dans la table users
    const { data: publicUserData, error: publicUserError } = await adminClient
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    // Rechercher l'utilisateur dans auth.users
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers({
      filter: {
        email: email
      }
    });

    if (authError) {
      console.error("Erreur lors de la recherche dans auth.users:", authError);
      return new Response(
        JSON.stringify({ 
          error: "Erreur lors de la vérification de l'utilisateur",
          details: authError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Préparer la réponse
    const response = {
      publicUserExists: !!publicUserData,
      publicUserId: publicUserData?.id || null,
      authUserExists: authUsers?.users?.length > 0,
      authUserId: authUsers?.users?.[0]?.id || null,
      email: email,
      userDetails: authUsers?.users?.length > 0 ? {
        id: authUsers.users[0].id,
        email: authUsers.users[0].email,
        created_at: authUsers.users[0].created_at,
        last_sign_in_at: authUsers.users[0].last_sign_in_at,
        user_metadata: authUsers.users[0].user_metadata,
        email_confirmed: authUsers.users[0].email_confirmed_at !== null
      } : null
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return new Response(
      JSON.stringify({ 
        error: "Une erreur inattendue s'est produite",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
