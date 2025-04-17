
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Clé d'administration simple (dans une version de production, ce serait plus sécurisé)
const ADMIN_KEY = "supadmin2025";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, adminKey } = await req.json();
    
    if (adminKey !== ADMIN_KEY) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Clé d'administration invalide"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }
    
    if (!email || !password || password.length < 8) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email ou mot de passe invalide"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

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
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`Tentative de définition du mot de passe pour: ${email}`);

    try {
      // Mettre à jour le mot de passe de l'utilisateur
      const { data, error } = await adminClient.auth.admin.updateUserById(
        // Nous devons d'abord récupérer l'ID de l'utilisateur
        (await adminClient.auth.admin.listUsers()).data.users.find(u => u.email === email)?.id || "",
        { password }
      );
      
      if (error) {
        console.error("Erreur lors de la mise à jour du mot de passe:", error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Échec de la mise à jour du mot de passe",
            details: error.message
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
      
      console.log("Mot de passe mis à jour avec succès");
      
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
    } catch (authError) {
      console.error("Erreur lors de la mise à jour du mot de passe:", authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Erreur lors de la mise à jour du mot de passe",
          details: authError instanceof Error ? authError.message : String(authError)
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
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
