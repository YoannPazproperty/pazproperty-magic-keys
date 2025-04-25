
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Configuration incorrecte" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Create Supabase client with admin privileges
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { email } = await req.json();
    
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email invalide" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Génération du lien de réinitialisation pour: ${email}`);
    
    // Vérifier si l'utilisateur existe
    const { data: authUser, error: userError } = await adminClient.auth.admin.listUsers({
      filter: {
        email: email
      }
    });

    if (userError || !authUser || authUser.users.length === 0) {
      console.log(`Utilisateur non trouvé pour l'email: ${email}`);
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Si cette adresse existe dans notre système, vous recevrez un e-mail avec les instructions."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const userId = authUser.users[0].id;
    const userEmail = authUser.users[0].email; // Utiliser l'email réel de l'utilisateur trouvé
    
    // Générer un token et une date d'expiration
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expire dans 24h

    console.log("Création du token pour l'utilisateur:", userId);
    console.log("Email de l'utilisateur:", userEmail);
    console.log("Date d'expiration du token:", expiresAt.toISOString());

    // Nettoyer les anciens tokens pour cet utilisateur avant d'en stocker un nouveau
    try {
      const { data: deleteResult } = await adminClient
        .from('password_reset_tokens')
        .delete()
        .eq('user_id', userId);
      
      console.log("Anciens tokens supprimés pour l'utilisateur:", userId);
    } catch (cleanErr) {
      console.error("Erreur lors du nettoyage des anciens tokens:", cleanErr);
      // Continuer même en cas d'erreur de nettoyage
    }

    // Stocker le token
    const { data: tokenData, error: tokenError } = await adminClient.rpc(
      'store_password_reset_token',
      { 
        user_id_param: userId,
        token_param: token,
        expires_at_param: expiresAt.toISOString()
      }
    );

    if (tokenError) {
      console.error("Erreur lors du stockage du token:", tokenError);
      return new Response(
        JSON.stringify({ 
          error: "Erreur lors de la génération du token",
          details: tokenError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Vérification immédiate que le token a bien été stocké
    try {
      const { data: verifyData, error: verifyError } = await adminClient.rpc(
        'verify_password_reset_token',
        { token_param: token }
      );
      
      if (verifyError) {
        console.error("Erreur lors de la vérification du token après création:", verifyError);
      } else {
        console.log("Vérification du token après création:", verifyData);
        
        // Double-check que le token est associé au bon utilisateur
        if (verifyData && verifyData.length > 0) {
          const foundUserId = verifyData[0].user_id;
          const foundEmail = verifyData[0].user_email;
          
          if (foundUserId !== userId || foundEmail !== userEmail) {
            console.error("ALERTE: Incohérence détectée dans les données du token!");
            console.error(`Token associé à: ${foundEmail}, mais demandé pour: ${userEmail}`);
          }
        }
      }
    } catch (verifyErr) {
      console.error("Exception lors de la vérification du token après création:", verifyErr);
    }

    // Utiliser le domaine de l'application pour les redirections
    const baseUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://pazproperty-magic-keys.lovable.app";
    const resetLink = `${baseUrl}/auth/callback?type=recovery&token=${token}&email=${encodeURIComponent(userEmail)}`;

    // Envoyer l'email si Resend est configuré
    if (resendApiKey) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: "Pazproperty <alexa@pazproperty.pt>",
            to: userEmail,
            subject: "Réinitialisation de votre mot de passe Pazproperty",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
                <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Pazproperty.</p>
                <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
                <p>
                  <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 4px;">
                    Réinitialiser mon mot de passe
                  </a>
                </p>
                <p>Ce lien expirera dans 24 heures.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
                <p>Cordialement,<br>L'équipe Pazproperty</p>
              </div>
            `,
          })
        });

        if (!emailResponse.ok) {
          console.error("Erreur lors de l'envoi via Resend:", await emailResponse.text());
        } else {
          console.log("Email envoyé avec succès via Resend");
        }
      } catch (resendError) {
        console.error("Exception lors de l'envoi de l'email via Resend:", resendError);
      }
    }

    // Pour le développement, renvoyer le lien directement
    console.log("Génération du lien de réinitialisation réussie pour " + userEmail + ": " + resetLink);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Instructions de réinitialisation envoyées par email",
        resetLink: resetLink, // Pour le développement uniquement
        userEmail: userEmail  // Afficher l'email utilisé pour vérification
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
        error: "Une erreur inattendue s'est produite",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
