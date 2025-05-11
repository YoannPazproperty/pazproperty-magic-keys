
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Debounce helper - prevents multiple calls within the specified delay
let authInProgress = false;
const debounceAuth = (callback: Function, delay = 2000) => {
  if (authInProgress) return Promise.resolve({ error: { message: "Authentication in progress" }, success: false, data: null });
  
  authInProgress = true;
  setTimeout(() => { authInProgress = false; }, delay);
  
  return callback();
};

export const signInWithPassword = async (email: string, password: string) => {
  return debounceAuth(async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Tentative de connexion avec email:", email);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Erreur de connexion:", error);
        }
        
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

      if (process.env.NODE_ENV === 'development') {
        console.log("Connexion réussie pour:", data.user?.email);
      }
      
      toast.success("Connexion réussie");
      return { error: null, success: true, data };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Erreur inattendue lors de la connexion:", err);
      }
      
      toast.error("Erreur de connexion", {
        description: "Une erreur inattendue s'est produite. Veuillez réessayer."
      });
      return { error: err, success: false, data: null };
    }
  });
};

export const signInWithGoogle = async () => {
  return debounceAuth(async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Tentative d'authentification avec Google");
      }
      
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
        if (process.env.NODE_ENV === 'development') {
          console.error("Erreur de connexion Google:", error);
        }
        
        toast.error("Échec de connexion Google", {
          description: error.message,
        });
        return { error, success: false };
      }
      
      return { error: null, success: true };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Erreur inattendue lors de l'authentification Google:", err);
      }
      
      toast.error("Erreur de connexion Google");
      return { error: err, success: false };
    }
  });
};

export const resetUserPassword = async (email: string) => {
  return debounceAuth(async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Demande de réinitialisation du mot de passe pour:", email);
      }
      
      if (!email || !email.includes('@')) {
        return { 
          error: { message: "Veuillez fournir une adresse e-mail valide" }, 
          success: false 
        };
      }

      const baseUrl = window.location.origin;
      const redirectTo = `${baseUrl}/auth/callback`;

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectTo
        });

        if (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Erreur lors de la réinitialisation du mot de passe:", error);
          }
          
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

        return { 
          error: null, 
          success: true,
          message: "Si cette adresse existe dans notre système, vous recevrez un e-mail avec les instructions."
        };
      } catch (apiErr: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Erreur d'API lors de la réinitialisation:", apiErr);
        }
        
        return { 
          error: apiErr, 
          success: true,
          message: "Si cette adresse existe dans notre système, vous recevrez un e-mail avec les instructions."
        };
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Exception inattendue lors de la réinitialisation du mot de passe:", err);
      }
      
      return { 
        error: err, 
        success: false,
        message: "Une erreur technique s'est produite. Veuillez réessayer plus tard."
      };
    }
  });
};

export const signOutUser = async () => {
  return debounceAuth(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Erreur de déconnexion:", error);
        }
        
        toast.error("Échec de déconnexion", {
          description: error.message,
        });
        return { error, success: false };
      } else {
        toast.success("Déconnexion réussie");
        return { error: null, success: true };
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Erreur inattendue lors de la déconnexion:", err);
      }
      
      toast.error("Erreur de déconnexion");
      return { error: err, success: false };
    }
  });
};

// Helper function for testing credentials - useful for debugging
export const testLoginCredentials = async (email: string, password: string) => {
  return debounceAuth(async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Test d'identifiants pour:", email);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Échec du test de connexion:", error);
        }
        
        return { 
          success: false, 
          error: error.message,
          details: {
            status: error.status,
            name: error.name
          }
        };
      }

      if (process.env.NODE_ENV === 'development') {
        console.log("Test de connexion réussi pour:", data.user?.email);
      }
      
      return { 
        success: true, 
        userId: data.user?.id,
        userEmail: data.user?.email,
        sessionActive: !!data.session
      };
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Erreur inattendue lors du test de connexion:", err);
      }
      
      return { 
        success: false, 
        error: err.message || "Erreur technique inattendue"
      };
    }
  });
};
