
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
    
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email manquant ou invalide"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Génération d'un lien de réinitialisation pour: ${email}`);
    
    // Générer un token de réinitialisation
    try {
      // Vérifier si l'utilisateur existe d'abord
      const { data: user, error: userError } = await adminAuthClient
        .from("users")
        .select("email")
        .eq("email", email)
        .single();
      
      if (userError || !user) {
        console.log(`Utilisateur avec l'email ${email} non trouvé`);
        // Ne pas révéler si l'utilisateur existe ou non
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Si cette adresse existe dans notre système, vous recevrez un e-mail avec les instructions.",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      // Générer lien de réinitialisation
      const baseUrl = "https://22c7e654-f304-419f-a370-324064acafb0.lovableproject.com";
      const token = crypto.randomUUID();
      
      // Dans un système de production réel, nous stockerions ce token dans la base de données
      // Mais pour une démonstration, nous allons simplement créer un lien
      const resetLink = `${baseUrl}/auth/callback#type=recovery&access_token=${token}`;
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Lien de réinitialisation généré avec succès",
          resetLink: resetLink
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (authError) {
      console.error("Erreur lors de la génération du lien:", authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Erreur lors de la génération du lien de réinitialisation",
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
