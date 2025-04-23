
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
    console.log("Recovery token présent:", recoveryToken ? `${recoveryToken.substring(0, 8)}...` : "Non");
    console.log("Password fourni de longueur:", password ? password.length : 0);

    // Cas 1: Utilisation d'un token de récupération personnalisé
    if (recoveryToken) {
      console.log("Vérification du token de récupération:", recoveryToken.substring(0, 8) + "...");
      
      // Utiliser notre fonction SQL pour vérifier le token
      const { data: tokenData, error: verifyError } = await adminClient.rpc(
        'verify_password_reset_token',
        { token_param: recoveryToken }
      );

      console.log("Résultat brut de la vérification du token:", tokenData);

      if (verifyError) {
        console.error("Erreur lors de la vérification du token SQL:", verifyError);
        return new Response(
          JSON.stringify({ 
            error: "Erreur lors de la vérification du token",
            details: verifyError.message
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      if (!tokenData || tokenData.length === 0) {
        console.error("Token invalide ou expiré:", recoveryToken.substring(0, 8) + "...");
        return new Response(
          JSON.stringify({ 
            error: "Token de réinitialisation invalide ou expiré",
            details: "Aucun utilisateur trouvé pour ce token"
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Extraire correctement les données du token (userId et userEmail)
      const userData = tokenData[0];
      if (!userData || !userData.user_id || !userData.user_email) {
        console.error("Données incomplètes retournées par verify_password_reset_token");
        console.error("Données reçues:", tokenData);
        return new Response(
          JSON.stringify({ 
            error: "Données de token incomplètes",
            details: "L'identifiant ou l'email de l'utilisateur est manquant",
            debugData: tokenData
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      const userId = userData.user_id;
      const userEmail = userData.user_email;
      
      console.log("Token valide pour l'utilisateur:", userId);
      console.log("Email de l'utilisateur associé au token:", userEmail);

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

      // Vérifier que l'utilisateur existe toujours
      const { data: userData2, error: userError } = await adminClient.auth.admin.getUserById(userId);
      
      if (userError || !userData2?.user) {
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
      
      // Double vérification que l'email correspond
      if (userData2.user.email !== userEmail) {
        console.error("Incohérence dans les données utilisateur. Email attendu:", userEmail, "Email trouvé:", userData2.user.email);
        return new Response(
          JSON.stringify({ 
            error: "Incohérence dans les données utilisateur",
            details: "L'email associé à l'utilisateur ne correspond pas au token"
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Mettre à jour le mot de passe
      console.log("Mise à jour du mot de passe pour l'utilisateur:", userId, "avec email:", userEmail);
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

      console.log("Mot de passe mis à jour avec succès pour l'utilisateur:", userId, "avec email:", userEmail);
      
      // IMPORTANT: Vérifier le rôle de l'utilisateur ou en créer un si nécessaire
      try {
        // Vérifier d'abord si le type enum user_role existe
        const { data: enumExists } = await adminClient.rpc('run_sql', { 
          query: "SELECT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'user_role');" 
        });
        
        const userRoleEnumExists = enumExists && enumExists[0] && enumExists[0].exists;
        console.log("Type enum user_role existe:", userRoleEnumExists);
        
        if (!userRoleEnumExists) {
          console.log("Création du type enum user_role");
          await adminClient.rpc('run_sql', { 
            query: "CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'user');" 
          });
        }
        
        // Vérifier si la table user_roles existe
        const { data: tableExists } = await adminClient.rpc('run_sql', { 
          query: "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles');" 
        });
        
        const userRolesTableExists = tableExists && tableExists[0] && tableExists[0].exists;
        console.log("Table user_roles existe:", userRolesTableExists);
        
        if (!userRolesTableExists) {
          console.log("Création de la table user_roles");
          await adminClient.rpc('run_sql', { 
            query: `
              CREATE TABLE public.user_roles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                role user_role NOT NULL DEFAULT 'user'::user_role,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
              );
              ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
            `
          });
        }
        
        // Vérifier si l'utilisateur a déjà un rôle
        const { data: roleData, error: roleError } = await adminClient
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (roleError) {
          console.error("Erreur lors de la vérification du rôle:", roleError);
        } else if (!roleData) {
          // Créer un rôle admin pour l'utilisateur s'il n'en a pas
          console.log("Création d'un rôle admin pour l'utilisateur:", userId);
          const { error: insertRoleError } = await adminClient
            .from('user_roles')
            .insert({ user_id: userId, role: 'admin' });
          
          if (insertRoleError) {
            console.error("Erreur lors de la création du rôle admin:", insertRoleError);
          } else {
            console.log("Rôle admin créé avec succès pour l'utilisateur:", userId);
          }
        } else {
          console.log("L'utilisateur a déjà un rôle:", roleData.role);
          
          // Si l'utilisateur n'est pas admin, le promouvoir en admin
          if (roleData.role !== 'admin') {
            console.log("Promotion de l'utilisateur au rôle admin");
            const { error: updateRoleError } = await adminClient
              .from('user_roles')
              .update({ role: 'admin' })
              .eq('user_id', userId);
              
            if (updateRoleError) {
              console.error("Erreur lors de la mise à jour du rôle:", updateRoleError);
            } else {
              console.log("Rôle mis à jour avec succès pour l'utilisateur:", userId);
            }
          }
        }
      } catch (roleErr) {
        console.error("Exception lors de la gestion du rôle:", roleErr);
      }
      
      // Pour le débogage, vérifier si nous pouvons nous connecter avec ces identifiants
      try {
        console.log("Test de connexion avec le nouveau mot de passe pour:", userEmail);
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
      
      // Supprimer le token utilisé pour éviter sa réutilisation
      try {
        const { error: deleteTokenError } = await adminClient
          .from('password_reset_tokens')
          .delete()
          .eq('token', recoveryToken);
          
        if (deleteTokenError) {
          console.error("Erreur lors de la suppression du token utilisé:", deleteTokenError);
        } else {
          console.log("Token de récupération supprimé avec succès après utilisation");
        }
      } catch (deleteErr) {
        console.error("Erreur lors de la suppression du token:", deleteErr);
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

      // Vérifier le rôle de l'utilisateur ou en créer un si nécessaire
      try {
        // Vérifier si l'utilisateur a déjà un rôle
        const { data: roleData, error: roleError } = await adminClient
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (roleError) {
          console.error("Erreur lors de la vérification du rôle:", roleError);
        } else if (!roleData) {
          // Créer un rôle admin pour l'utilisateur s'il n'en a pas
          console.log("Création d'un rôle admin pour l'utilisateur:", userId);
          const { error: insertRoleError } = await adminClient
            .from('user_roles')
            .insert({ user_id: userId, role: 'admin' });
          
          if (insertRoleError) {
            console.error("Erreur lors de la création du rôle admin:", insertRoleError);
          } else {
            console.log("Rôle admin créé avec succès pour l'utilisateur:", userId);
          }
        } else {
          console.log("L'utilisateur a déjà un rôle:", roleData.role);
          
          // Si l'utilisateur n'est pas admin, le promouvoir en admin
          if (roleData.role !== 'admin') {
            console.log("Promotion de l'utilisateur au rôle admin");
            const { error: updateRoleError } = await adminClient
              .from('user_roles')
              .update({ role: 'admin' })
              .eq('user_id', userId);
              
            if (updateRoleError) {
              console.error("Erreur lors de la mise à jour du rôle:", updateRoleError);
            } else {
              console.log("Rôle mis à jour avec succès pour l'utilisateur:", userId);
            }
          }
        }
      } catch (roleErr) {
        console.error("Exception lors de la gestion du rôle:", roleErr);
      }

      // Pour le débogage, vérifier si nous pouvons nous connecter avec ces identifiants
      try {
        console.log("Test de connexion avec le nouveau mot de passe pour:", email);
        const { data: signInData, error: signInError } = await adminClient.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (signInError) {
          console.error("Échec du test de connexion après mise à jour:", signInError);
        } else {
          console.log("Test de connexion réussi après mise à jour pour:", email);
        }
      } catch (signInErr) {
        console.error("Erreur lors du test de connexion:", signInErr);
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
