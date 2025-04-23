
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Configuration incorrecte",
          details: "Variables d'environnement manquantes"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Create Supabase admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const requestData = await req.json();
    
    console.log("Requête de réinitialisation de mot de passe reçue:", {
      email: requestData.email ? "présent" : "absent",
      password: requestData.password ? "présent" : "absent",
      adminKey: requestData.adminKey ? "présent" : "absent",
      recoveryToken: requestData.recoveryToken ? "présent" : "absent"
    });
    
    // Vérifier si les paramètres requis sont présents
    if (!requestData.password || requestData.password.length < 8) {
      console.log("Mot de passe invalide");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Mot de passe invalide. Doit contenir au moins 8 caractères."
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // METHODE 1: Définir le mot de passe à l'aide d'un recoveryToken
    if (requestData.recoveryToken) {
      console.log("Réinitialisation via recoveryToken");
      try {
        // Essayer d'abord de vérifier si ce token existe dans notre table personnalisée
        console.log("Vérification du token personnalisé");
        
        const { data: tokenData, error: tokenError } = await adminClient
          .from('password_reset_tokens')
          .select('*')
          .eq('token', requestData.recoveryToken)
          .single();
          
        if (tokenError || !tokenData) {
          console.log("Token personnalisé introuvable:", tokenError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Token de réinitialisation invalide ou expiré."
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        
        // Vérifier si le token est expiré
        const now = new Date();
        const expiresAt = new Date(tokenData.expires_at);
        
        if (now > expiresAt) {
          console.log("Token expiré");
          await adminClient
            .from('password_reset_tokens')
            .delete()
            .eq('id', tokenData.id);
            
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Le lien de réinitialisation a expiré. Veuillez demander un nouveau lien."
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        
        // Mettre à jour le mot de passe de l'utilisateur
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          tokenData.user_id,
          { password: requestData.password }
        );
        
        if (updateError) {
          console.error("Erreur lors de la mise à jour du mot de passe:", updateError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Erreur lors de la mise à jour du mot de passe: " + updateError.message
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }
        
        // Supprimer le token utilisé
        await adminClient
          .from('password_reset_tokens')
          .delete()
          .eq('id', tokenData.id);
        
        console.log("Mot de passe mis à jour avec succès via token personnalisé");
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Mot de passe mis à jour avec succès."
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (tokenError) {
        console.error("Erreur lors de la validation du token:", tokenError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Erreur lors de la validation du token de réinitialisation."
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
    }
    // METHODE 2: Reset direct par un administrateur avec email et adminKey
    else if (requestData.email && requestData.adminKey) {
      console.log("Réinitialisation directe par administrateur");
      // Vérifier la clé administrative simple (méthode basique pour la démo)
      if (requestData.adminKey !== "supadmin2025") {
        console.log("Clé d'administration invalide");
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Clé d'administration invalide"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          }
        );
      }
      
      // Rechercher l'utilisateur par email
      const { data: users, error: userError } = await adminClient.auth.admin.listUsers({
        filter: {
          email: requestData.email
        }
      });
      
      if (userError || !users || users.users.length === 0) {
        console.log("Utilisateur non trouvé:", userError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Utilisateur non trouvé avec cette adresse e-mail"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
      }
      
      const userId = users.users[0].id;
      
      // Mettre à jour le mot de passe
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        userId,
        { password: requestData.password }
      );
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du mot de passe:", updateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Erreur lors de la mise à jour du mot de passe: " + updateError.message
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
      
      console.log("Mot de passe mis à jour avec succès par administrateur");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Mot de passe mis à jour avec succès par un administrateur."
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    else {
      console.log("Paramètres insuffisants");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Paramètres insuffisants pour la réinitialisation du mot de passe"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Une erreur inattendue s'est produite",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
