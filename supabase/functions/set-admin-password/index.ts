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
        JSON.stringify({
          error: "Configuration incorrecte - Variables d'environnement manquantes"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const { email, password, adminKey, recoveryToken } = body;

    console.log("Demande de définition/réinitialisation de mot de passe reçue");
    console.log("Méthode:", recoveryToken ? "Token de récupération" : email ? "Email direct" : "Clé admin");
    console.log("Email:", email || "Non fourni");
    console.log("Recovery token présent:", !!recoveryToken);
    console.log("Password fourni de longueur:", password ? password.length : 0);

    // Cas 1: Utilisation d'un token de récupération personnalisé
    if (recoveryToken) {
      console.log("Vérification du token de récupération...");
      
      // Utiliser notre nouvelle fonction SQL pour vérifier le token
      const { data: userId, error: verifyError } = await adminClient.rpc(
        'verify_password_reset_token',
        { token_param: recoveryToken }
      );

      if (verifyError || !userId) {
        console.error("Erreur lors de la vérification du token:", verifyError);
        return new Response(
          JSON.stringify({ 
            error: "Token de réinitialisation invalide ou expiré",
            details: verifyError ? verifyError.message : "Aucun utilisateur trouvé pour ce token"
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      console.log("Token valide pour l'utilisateur:", userId);

      if (!password || password.length < 8) {
        return new Response(
          JSON.stringify({ 
            error: "Le mot de passe doit contenir au moins 8 caractères" 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Récupérer les infos de l'utilisateur
      const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId);
      
      if (userError || !userData?.user) {
        console.error("Erreur lors de la récupération des données utilisateur:", userError);
        return new Response(
          JSON.stringify({ 
            error: "Utilisateur introuvable",
            details: userError?.message 
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      const userEmail = userData.user.email;
      console.log("Email de l'utilisateur récupéré:", userEmail);

      // Mettre à jour le mot de passe
      console.log("Mise à jour du mot de passe pour l'utilisateur:", userId);
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        userId,
        { password: password }
      );

      if (updateError) {
        console.error("Erreur lors de la mise à jour du mot de passe:", updateError);
        return new Response(
          JSON.stringify({ 
            error: "Échec de la mise à jour du mot de passe",
            details: updateError.message 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      console.log("Mot de passe mis à jour avec succès pour l'utilisateur:", userId);
      
      // Pour le débogage, vérifier si nous pouvons nous connecter avec ces identifiants
      try {
        console.log("Test de connexion avec le nouveau mot de passe...");
        const { data: signInData, error: signInError } = await adminClient.auth.signInWithPassword({
          email: userEmail,
          password: password
        });
        
        if (signInError) {
          console.error("Échec du test de connexion après réinitialisation:", signInError);
        } else {
          console.log("Test de connexion réussi après réinitialisation pour:", userEmail);
        }
      } catch (signInErr) {
        console.error("Erreur lors du test de connexion:", signInErr);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Mot de passe mis à jour avec succès",
          userEmail: userEmail  // Inclure l'email pour faciliter la connexion automatique
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Cas 2: Administrateur utilisant une clé admin
    else if (adminKey === "supadmin2025") {
      if (!email || !email.includes("@")) {
        return new Response(
          JSON.stringify({ error: "Email invalide" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      if (!password || password.length < 8) {
        return new Response(
          JSON.stringify({ error: "Le mot de passe doit contenir au moins 8 caractères" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Rechercher l'utilisateur par email
      console.log("Recherche de l'utilisateur par email:", email);
      const { data: authUser, error: findUserError } = await adminClient.auth.admin.listUsers({
        filter: {
          email: email
        }
      });

      if (findUserError || !authUser || authUser.users.length === 0) {
        console.error("Utilisateur introuvable:", findUserError || "Aucun utilisateur trouvé");
        return new Response(
          JSON.stringify({ 
            error: "Utilisateur introuvable" 
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      const userId = authUser.users[0].id;
      console.log("Utilisateur trouvé:", userId);

      // Mettre à jour le mot de passe
      console.log("Mise à jour du mot de passe pour l'email:", email);
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        userId,
        { password: password }
      );

      if (updateError) {
        console.error("Erreur lors de la mise à jour du mot de passe:", updateError);
        return new Response(
          JSON.stringify({ 
            error: "Échec de la mise à jour du mot de passe",
            details: updateError.message
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      console.log("Mot de passe administrateur mis à jour avec succès pour:", email);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Mot de passe administrateur mis à jour avec succès"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Cas 3: Non autorisé
    else {
      return new Response(
        JSON.stringify({ 
          error: "Non autorisé à définir ou réinitialiser des mots de passe" 
        }),
        {
          status: 403,
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
