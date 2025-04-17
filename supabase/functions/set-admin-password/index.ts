
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
    
    // Create Supabase client with service role key for admin privileges
    const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { email, password, adminKey, recoveryToken } = await req.json();
    
    // Vérification de sécurité : Vérifier que l'appelant est autorisé (soit via adminKey soit via recoveryToken)
    if (!recoveryToken && (!adminKey || adminKey !== 'supadmin2025')) {
      console.error("Tentative non autorisée de définition de mot de passe");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Non autorisé"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }
    
    if (!password || password.length < 8) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Mot de passe invalide (minimum 8 caractères)"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Si nous avons un token de récupération, il s'agit d'un flux de réinitialisation de mot de passe
    if (recoveryToken) {
      console.log("Réinitialisation de mot de passe via token personnalisé");
      
      // Vérifier si le token est valide
      // Dans un système de production réel, nous vérifierions que le token existe dans une table dédiée
      // et est associé à un utilisateur spécifique
      
      // Pour cette démonstration, nous permettons la réinitialisation pour tout compte administrateur
      // Les utilisateurs normaux récupérant leur mot de passe seront traités dans une version future
      
      try {
        // Récupérer un utilisateur admin pour la démo
        const { data: adminUser, error: userError } = await adminAuthClient
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin")
          .single();
        
        if (userError || !adminUser) {
          console.error("Aucun utilisateur admin trouvé");
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Échec de la réinitialisation : utilisateur introuvable"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 404,
            }
          );
        }
        
        // Récupérer l'email de l'utilisateur
        const { data: userData, error: emailError } = await adminAuthClient
          .from("users")
          .select("email")
          .eq("id", adminUser.user_id)
          .single();
        
        if (emailError || !userData || !userData.email) {
          console.error("Impossible de récupérer l'email de l'admin");
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Échec de la réinitialisation : email introuvable"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }
        
        // Mettre à jour le mot de passe
        const { error: updateError } = await adminAuthClient.auth.admin.updateUserById(
          adminUser.user_id,
          { password: password }
        );
        
        if (updateError) {
          console.error("Erreur lors de la mise à jour du mot de passe:", updateError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Échec de la mise à jour du mot de passe",
              details: updateError.message
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }
        
        console.log("Mot de passe réinitialisé avec succès pour l'admin");
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Mot de passe réinitialisé avec succès"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (err) {
        console.error("Erreur inattendue lors de la réinitialisation du mot de passe:", err);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Erreur inattendue lors de la réinitialisation du mot de passe",
            details: err instanceof Error ? err.message : String(err)
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
    }
    
    // Si nous arrivons ici, c'est une définition de mot de passe administrateur
    if (!email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email manquant"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Rechercher l'utilisateur par email
    const { data: user, error: userError } = await adminAuthClient
      .from("users")
      .select("id")
      .eq("email", email)
      .single();
    
    if (userError || !user) {
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
    
    // Mettre à jour le mot de passe
    const { error: updateError } = await adminAuthClient.auth.admin.updateUserById(
      user.id,
      { password: password }
    );
    
    if (updateError) {
      console.error("Erreur lors de la définition du mot de passe:", updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Échec de la définition du mot de passe",
          details: updateError.message
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Mot de passe défini avec succès"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Erreur inattendue:", error);
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
