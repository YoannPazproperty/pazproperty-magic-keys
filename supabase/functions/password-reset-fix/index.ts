
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Password reset fix function initiated");
    
    try {
      // Execute the database function to fix NULL confirmation_token values
      const { data, error } = await supabase.rpc('fix_confirmation_tokens');
      
      if (error) {
        console.error("Error fixing confirmation tokens:", error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Échec de la correction des tokens",
            details: error
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
      
      console.log("Confirmation tokens fix result:", data);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Les tokens de confirmation ont été corrigés avec succès",
          details: data
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Erreur lors de l'exécution de la fonction SQL",
          details: dbError instanceof Error ? dbError.message : String(dbError)
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
