
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const signInWithPassword = async (email: string, password: string) => {
  try {
    console.log("Tentative de connexion avec:", email);
    
    // Vérifier que l'email existe avant la tentative de connexion
    const { data: userExists, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (checkError) {
      console.warn("Erreur lors de la vérification de l'existence de l'utilisateur:", checkError);
      // Continuer même si erreur - peut-être que l'utilisateur existe dans auth mais pas dans la table users
    }
    
    if (userExists) {
      console.log("Utilisateur trouvé dans la base de données:", userExists.id);
    } else {
      console.log("Utilisateur non trouvé dans la table users, vérification dans auth.users impossible directement");
      
      // Au lieu d'utiliser une fonction RPC non existante, nous utilisons l'edge function qui peut vérifier dans auth.users
      try {
        const supabaseUrl = 'https://ubztjjxmldogpwawcnrj.supabase.co';
        const response = await fetch(
          `${supabaseUrl}/functions/v1/check-user-auth`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
          }
        );
        
        const authUserCheck = await response.json();
        console.log("Résultat de vérification via edge function:", authUserCheck);
      } catch (edgeFuncErr) {
        console.log("Impossible de vérifier dans auth.users via edge function:", edgeFuncErr);
      }
    }
    
    console.log("Tentative de connexion avec email:", email, "et mot de passe de longueur:", password ? password.length : 0);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Erreur de connexion détaillée:", error);
      console.error("Code d'erreur:", error.status);
      console.error("Message d'erreur:", error.message);
      
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Identifiants invalides", {
          description: "Vérifiez votre adresse e-mail et votre mot de passe."
        });
      } else if (error.message.includes("Database error querying schema")) {
        toast.error("Problème temporaire de connexion à la base de données", {
          description: "Veuillez réessayer dans quelques instants."
        });
      } else {
        toast.error("Échec de connexion", {
          description: error.message || "Veuillez réessayer."
        });
      }
      
      return { error, success: false, data: null };
    }

    console.log("Connexion réussie, données de session:", {
      userId: data.user?.id,
      userEmail: data.user?.email,
      hasSession: !!data.session,
      metadata: data.user?.user_metadata
    });
    
    toast.success("Connexion réussie");
    return { error: null, success: true, data };
  } catch (err) {
    console.error("Erreur inattendue lors de la connexion:", err);
    toast.error("Erreur de connexion", {
      description: "Une erreur inattendue s'est produite. Veuillez réessayer."
    });
    return { error: err, success: false, data: null };
  }
};

export const signInWithGoogle = async () => {
  try {
    console.log("Tentative d'authentification avec Google");
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'email profile',
      },
    });

    if (error) {
      console.error("Erreur de connexion Google:", error);
      toast.error("Échec de connexion Google", {
        description: error.message,
      });
      return { error, success: false };
    }
    
    return { error: null, success: true };
  } catch (err) {
    console.error("Erreur inattendue lors de l'authentification Google:", err);
    toast.error("Erreur de connexion Google");
    return { error: err, success: false };
  }
};

export const resetUserPassword = async (email: string) => {
  try {
    console.log("Demande de réinitialisation du mot de passe pour:", email);
    
    if (!email || !email.includes('@')) {
      return { 
        error: { message: "Veuillez fournir une adresse e-mail valide" }, 
        success: false 
      };
    }

    const baseUrl = window.location.origin;
    const redirectTo = `${baseUrl}/auth/callback`;
    
    console.log("URL de redirection pour la réinitialisation:", redirectTo);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      });

      if (error) {
        console.error("Erreur détaillée lors de la réinitialisation du mot de passe:", error);
        
        if (error.message && error.message.includes("rate limit")) {
          return { 
            error, 
            success: false,
            message: "Trop de tentatives. Veuillez réessayer dans quelques minutes."
          };
        } else if (error.message && error.message.includes("Invalid login credentials")) {
          return { 
            error, 
            success: false,
            message: "Adresse e-mail non reconnue dans notre système."
          };
        } else if (error.status === 500) {
          console.log("Détection d'une erreur 500 lors de la réinitialisation du mot de passe");
          return { 
            error: null, 
            success: true,
            message: "Si cette adresse existe dans notre système, vous recevrez un e-mail avec les instructions."
          };
        }
        
        return { 
          error, 
          success: false,
          message: error.message || "Erreur lors de la réinitialisation du mot de passe"
        };
      }

      console.log("Demande de réinitialisation envoyée avec succès");
      return { 
        error: null, 
        success: true,
        message: "Si cette adresse existe dans notre système, vous recevrez un e-mail avec les instructions."
      };
    } catch (apiErr: any) {
      console.error("Erreur d'API lors de la réinitialisation:", apiErr);
      return { 
        error: apiErr, 
        success: true,
        message: "Si cette adresse existe dans notre système, vous recevrez un e-mail avec les instructions."
      };
    }
  } catch (err: any) {
    console.error("Exception inattendue lors de la réinitialisation du mot de passe:", err);
    return { 
      error: err, 
      success: false,
      message: "Une erreur technique s'est produite. Veuillez réessayer plus tard."
    };
  }
};

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Erreur de déconnexion:", error);
      toast.error("Échec de déconnexion", {
        description: error.message,
      });
      return { error, success: false };
    } else {
      toast.success("Déconnexion réussie");
      return { error: null, success: true };
    }
  } catch (err) {
    console.error("Erreur inattendue lors de la déconnexion:", err);
    toast.error("Erreur de déconnexion");
    return { error: err, success: false };
  }
};

// Ajout d'une fonction utilitaire pour tester directement les identifiants
export const testLoginCredentials = async (email: string, password: string) => {
  try {
    console.log("Test d'identifiants pour:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Échec du test de connexion:", error);
      return { 
        success: false, 
        error: error.message,
        details: {
          status: error.status,
          name: error.name
        }
      };
    }

    console.log("Test de connexion réussi, utilisateur:", data.user?.email);
    return { 
      success: true, 
      userId: data.user?.id,
      userEmail: data.user?.email,
      sessionActive: !!data.session
    };
  } catch (err: any) {
    console.error("Erreur inattendue lors du test de connexion:", err);
    return { 
      success: false, 
      error: err.message || "Erreur technique inattendue"
    };
  }
};
