
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Configuration incorrecte" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token manquant" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Recherche d'informations pour le token:", token);

    // Utiliser notre fonction SQL pour vérifier le token
    const { data: tokenData, error: tokenError } = await adminClient.rpc(
      'verify_password_reset_token',
      { token_param: token }
    );

    console.log("Résultat de la vérification du token:", tokenData, tokenError);

    if (tokenError) {
      console.error("Erreur lors de la vérification du token:", tokenError);
      return new Response(
        JSON.stringify({ error: "Échec de la vérification du token" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!tokenData || tokenData.length === 0) {
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Renvoyer les informations de l'utilisateur associé au token
    return new Response(
      JSON.stringify({
        userId: tokenData[0].user_id,
        userEmail: tokenData[0].user_email
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return new Response(
      JSON.stringify({ error: "Une erreur inattendue s'est produite" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
