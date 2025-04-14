
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    success: boolean;
  }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: any | null;
    success: boolean;
    message?: string;
  }>;
  getUserRole: () => Promise<"admin" | "manager" | "user" | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // D'abord configurer l'écouteur d'événements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        
        // Utiliser setTimeout pour éviter les deadlocks potentiels
        setTimeout(() => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (event === "SIGNED_OUT") {
            navigate("/auth");
          } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            console.log("Utilisateur connecté ou token rafraîchi");
          } else if (event === "PASSWORD_RECOVERY") {
            navigate("/auth/callback?reset=true");
          }
        }, 0);
      }
    );

    // Ensuite récupérer la session existante
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la récupération de la session initiale:", error);
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.error("Erreur inattendue lors de la récupération de la session:", err);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Tentative de connexion avec:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erreur de connexion:", error);
        
        return { error, success: false };
      }

      console.log("Connexion réussie");
      toast.success("Connexion réussie");
      
      // Ne pas naviguer ici - laisser le gestionnaire d'événements onAuthStateChange s'en charger
      return { error: null, success: true };
    } catch (err) {
      console.error("Erreur inattendue lors de la connexion:", err);
      return { error: err, success: false };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
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
      }
      // Pas besoin de naviguer - la redirection OAuth prendra le relais
      
    } catch (err) {
      console.error("Erreur inattendue lors de l'authentification Google:", err);
      toast.error("Erreur de connexion Google");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      console.log("Demande de réinitialisation du mot de passe pour:", email);
      
      // Vérification de base de l'adresse e-mail
      if (!email || !email.includes('@')) {
        return { 
          error: { message: "Veuillez fournir une adresse e-mail valide" }, 
          success: false 
        };
      }

      // Utiliser le paramètre redirectTo directement sans construire l'URL manuellement
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        console.error("Erreur détaillée lors de la réinitialisation du mot de passe:", error);
        
        // Traitement spécifique des types d'erreurs connus
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
    } catch (err: any) {
      console.error("Exception inattendue lors de la réinitialisation du mot de passe:", err);
      return { 
        error: err, 
        success: false,
        message: "Une erreur technique s'est produite. Veuillez réessayer plus tard."
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erreur de déconnexion:", error);
        toast.error("Échec de déconnexion", {
          description: error.message,
        });
      } else {
        toast.success("Déconnexion réussie");
        // Ne pas naviguer ici - laisser le gestionnaire d'événements onAuthStateChange s'en charger
      }
    } catch (err) {
      console.error("Erreur inattendue lors de la déconnexion:", err);
      toast.error("Erreur de déconnexion");
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = async (): Promise<"admin" | "manager" | "user" | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
        
      if (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
        return null;
      }
      
      return data?.role as "admin" | "manager" | "user" || null;
    } catch (err) {
      console.error("Erreur inattendue lors de la récupération du rôle:", err);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        getUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
