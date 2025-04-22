
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
    
    // Create Supabase client with service role key (admin privileges)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { email, password, adminKey, recoveryToken } = await req.json();
    
    console.log("Tentative de définition de mot de passe:", 
      { 
        emailProvided: !!email, 
        passwordProvided: !!password, 
        adminKeyProvided: !!adminKey,
        recoveryTokenProvided: !!recoveryToken
      }
    );
    
    // Vérifier que nous avons au moins un identifiant (email ou token) et un mot de passe
    if ((!email && !recoveryToken) || !password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Paramètres manquants",
          details: "Email/token et mot de passe requis"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    let userId = null;
    
    // Si nous avons un token de récupération, l'utiliser pour identifier l'utilisateur
    if (recoveryToken) {
      try {
        // Vérifier si le token existe dans la base de données
        const { data: tokenData, error: tokenError } = await adminClient
          .from("password_reset_tokens")
          .select("user_id, expires_at")
          .eq("token", recoveryToken)
          .single();
        
        if (tokenError || !tokenData) {
          console.error("Token non trouvé:", tokenError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Token invalide ou expiré"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        
        // Vérifier si le token n'a pas expiré
        if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
          console.error("Token expiré:", tokenData.expires_at);
          
          // Supprimer le token expiré
          await adminClient
            .from("password_reset_tokens")
            .delete()
            .eq("token", recoveryToken);
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Token expiré"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        
        userId = tokenData.user_id;
        
        // Supprimer le token après utilisation
        await adminClient
          .from("password_reset_tokens")
          .delete()
          .eq("token", recoveryToken);
        
      } catch (tokenErr) {
        console.error("Erreur lors de la vérification du token:", tokenErr);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Erreur lors de la vérification du token"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
    }
    // Si nous avons un email et une clé admin, utiliser cette méthode
    else if (email && adminKey) {
      // Vérifier la clé admin pour des opérations privilégiées
      if (adminKey !== "supadmin2025") {
        console.error("Clé administrative invalide fournie");
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Clé administrative invalide"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          }
        );
      }
      
      // Chercher l'utilisateur par email
      const { data: userData, error: userError } = await adminClient
        .from("users")
        .select("id")
        .eq("email", email)
        .single();
      
      if (userError || !userData) {
        console.error("Utilisateur non trouvé:", userError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Utilisateur non trouvé"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
      }
      
      userId = userData.id;
    }
    // Si nous avons juste un email sans clé admin, c'est une tentative non autorisée
    else if (email && !adminKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Opération non autorisée"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }
    
    if (!userId) {
      console.error("Impossible d'identifier l'utilisateur");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Utilisateur non identifié"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Changer le mot de passe de l'utilisateur
    try {
      // Vérifier que l'utilisateur existe bien dans auth.users
      const { data: authUser, error: authUserError } = await adminClient.auth.admin.getUserById(userId);
      
      if (authUserError || !authUser) {
        console.error("Utilisateur non trouvé dans auth:", authUserError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Utilisateur non trouvé"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
      }
      
      // Changer le mot de passe
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        userId,
        { password: password }
      );
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du mot de passe:", updateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Erreur lors de la mise à jour du mot de passe",
            details: updateError.message
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
      
      console.log("Mot de passe mis à jour avec succès pour l'utilisateur:", userId);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Mot de passe mis à jour avec succès"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (updateErr) {
      console.error("Erreur inattendue lors de la mise à jour du mot de passe:", updateErr);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Erreur inattendue",
          details: updateErr instanceof Error ? updateErr.message : String(updateErr)
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Erreur globale:", error);
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
