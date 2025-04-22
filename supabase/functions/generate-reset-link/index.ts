
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
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
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
    
    try {
      // Vérifier si l'utilisateur existe d'abord
      const { data: userData, error: userError } = await adminClient
        .from("users")
        .select("id, email")
        .eq("email", email)
        .single();
      
      if (userError || !userData) {
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
      
      // Maintenant vérifier si l'utilisateur existe bien dans auth.users
      const { data: authUser, error: authUserError } = await adminClient.auth.admin.listUsers({
        filter: {
          email: email
        }
      });
      
      if (authUserError || !authUser || authUser.users.length === 0) {
        console.log(`Utilisateur auth avec l'email ${email} non trouvé:`, authUserError);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Si cette adresse existe dans notre système, vous recevrez un e-mail avec les instructions."
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      const userId = authUser.users[0].id;
      
      // Générer un token unique et une date d'expiration (24h)
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Expire dans 24h
      
      // Stocker le token dans la base de données
      try {
        // Vérifier si la table password_reset_tokens existe, sinon la créer
        const { error: tableCheckError } = await adminClient.rpc(
          'check_table_exists',
          { table_name: 'password_reset_tokens' }
        );
        
        if (tableCheckError) {
          // La table n'existe probablement pas, on la crée
          const { error: createTableError } = await adminClient.rpc(
            'create_password_reset_tokens_table'
          );
          
          if (createTableError) {
            console.error("Erreur lors de la création de la table:", createTableError);
            // On continue quand même, car le RPC pourrait ne pas exister non plus
          }
        }
        
        // Supprimer d'abord tous les tokens existants pour cet utilisateur
        await adminClient
          .from("password_reset_tokens")
          .delete()
          .eq("user_id", userId);
          
        // Insérer le nouveau token
        const { error: insertError } = await adminClient
          .from("password_reset_tokens")
          .insert({
            user_id: userId,
            token: token,
            expires_at: expiresAt.toISOString(),
          });
        
        if (insertError) {
          console.error("Erreur lors de l'insertion du token:", insertError);
          
          // Si c'est une erreur de table inexistante, on essaie de créer la table
          if (insertError.message?.includes("relation") && insertError.message?.includes("does not exist")) {
            const createTableSQL = `
              CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                token TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
              );
              ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
              CREATE POLICY "Enable all access for service role" ON public.password_reset_tokens TO service_role USING (true);
            `;
            
            const { error: sqlError } = await adminClient.rpc('run_sql', { sql: createTableSQL });
            
            if (sqlError) {
              console.error("Erreur lors de la création de la table par SQL:", sqlError);
            } else {
              // Réessayer l'insertion
              const { error: retryError } = await adminClient
                .from("password_reset_tokens")
                .insert({
                  user_id: userId,
                  token: token,
                  expires_at: expiresAt.toISOString(),
                });
              
              if (retryError) {
                console.error("Erreur lors de la seconde tentative d'insertion:", retryError);
              }
            }
          }
        }
      } catch (tokenErr) {
        console.error("Erreur lors de la gestion du token:", tokenErr);
      }
      
      const baseUrl = "https://22c7e654-f304-419f-a370-324064acafb0.lovableproject.com";
      const resetLink = `${baseUrl}/auth/callback#type=recovery&access_token=${token}`;
      
      // En parallèle, essayer aussi la méthode Supabase
      try {
        const { error: supaResetError } = await adminClient.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: `${baseUrl}/auth/callback`,
          }
        });
        
        if (supaResetError) {
          console.error("Erreur lors de la génération du lien Supabase:", supaResetError);
        } else {
          console.log("Lien de réinitialisation Supabase généré avec succès");
        }
      } catch (supaErr) {
        console.error("Exception lors de la génération du lien Supabase:", supaErr);
      }
      
      console.log("Lien de réinitialisation personnalisé généré:", resetLink);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Si cette adresse existe dans notre système, vous recevrez un e-mail avec les instructions.",
          resetLink: resetLink // Uniquement pour la démonstration
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
