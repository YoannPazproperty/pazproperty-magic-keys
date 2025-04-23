
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
    
    // Log token pour debug
    console.log("Token reçu:", token);
    
    // Vérifier que le token est valide en format
    if (!token.match(/^[a-zA-Z0-9-]+$/)) {
      console.error("Format de token invalide");
      return new Response(
        JSON.stringify({ error: "Format de token invalide" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Utiliser notre fonction SQL pour vérifier le token
    const { data: tokenData, error: tokenError } = await adminClient.rpc(
      'verify_password_reset_token',
      { token_param: token }
    );

    console.log("Résultat brut de la vérification du token:", tokenData);

    if (tokenError) {
      console.error("Erreur lors de la vérification du token:", tokenError);
      return new Response(
        JSON.stringify({ 
          error: "Échec de la vérification du token",
          details: tokenError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!tokenData || tokenData.length === 0) {
      console.log("Token invalide ou expiré - aucune donnée retournée");
      return new Response(
        JSON.stringify({ 
          error: "Token invalide ou expiré",
          details: "Aucun utilisateur associé à ce token" 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Vérifier la présence des données attendues
    const userData = tokenData[0];
    console.log("Données utilisateur extraites:", userData);
    
    if (!userData.user_id || !userData.user_email) {
      console.error("Données utilisateur incomplètes:", userData);
      return new Response(
        JSON.stringify({ 
          error: "Données de token incomplètes",
          details: "ID utilisateur ou email manquant dans les données retournées",
          tokenData: tokenData
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Renvoyer les informations de l'utilisateur associé au token
    console.log("Informations utilisateur complètes trouvées:", userData);
    return new Response(
      JSON.stringify({
        userId: userData.user_id,
        userEmail: userData.user_email
      }),
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
