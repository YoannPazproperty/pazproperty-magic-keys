
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

    // Nettoyer les tokens expirés pour éviter tout conflit
    try {
      const { data: cleanupData, error: cleanupError } = await adminClient
        .from('password_reset_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());
      
      if (cleanupError) {
        console.error("Erreur lors du nettoyage des tokens expirés:", cleanupError);
      } else {
        console.log("Nettoyage des tokens expirés effectué");
      }
    } catch (cleanupErr) {
      console.error("Exception lors du nettoyage des tokens:", cleanupErr);
    }

    // Utiliser notre fonction SQL pour vérifier le token
    try {
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
        
        // Vérifier si le token existe mais est peut-être expiré
        const { data: expiredTokenCheck } = await adminClient
          .from('password_reset_tokens')
          .select('*')
          .eq('token', token)
          .single();
          
        if (expiredTokenCheck) {
          console.log("Token trouvé mais probablement expiré:", expiredTokenCheck);
          return new Response(
            JSON.stringify({ 
              error: "Token expiré",
              details: "Ce token de réinitialisation a expiré"
            }),
            {
              status: 410, // Gone - ressource n'est plus disponible
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: "Token invalide",
            details: "Aucun utilisateur associé à ce token" 
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // La fonction retourne maintenant un tableau avec un seul objet contenant user_id et user_email
      const userData = tokenData[0];
      console.log("Données token extraites:", userData);
      
      if (!userData.user_id || !userData.user_email) {
        console.error("Données utilisateur incomplètes:", userData);
        return new Response(
          JSON.stringify({ 
            error: "Données de token incomplètes",
            details: "ID utilisateur ou email manquant dans les données retournées"
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Récupérer les informations utilisateur pour vérifier que le compte existe toujours
      const { data: userInfo, error: userError } = await adminClient.auth.admin.getUserById(userData.user_id);

      if (userError || !userInfo?.user) {
        console.error("Utilisateur non trouvé malgré un token valide:", userData.user_id);
        return new Response(
          JSON.stringify({
            error: "Utilisateur non trouvé",
            details: "L'utilisateur associé à ce token n'existe plus"
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Vérifier que l'email correspond toujours
      if (userInfo.user.email !== userData.user_email) {
        console.error("Email incohérent entre le token et l'utilisateur actuel:", {
          tokenEmail: userData.user_email,
          userEmail: userInfo.user.email
        });
        return new Response(
          JSON.stringify({
            error: "Données incohérentes",
            details: "L'email associé à ce token ne correspond plus à l'utilisateur"
          }),
          {
            status: 400,
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
    } catch (rpcError) {
      console.error("Exception lors de l'appel RPC:", rpcError);
      return new Response(
        JSON.stringify({ 
          error: "Erreur lors de la vérification du token via RPC",
          details: rpcError instanceof Error ? rpcError.message : String(rpcError)
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
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
