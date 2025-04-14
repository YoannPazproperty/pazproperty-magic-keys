
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
      (event, session) => {
        console.log("Auth state changed:", event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === "SIGNED_OUT") {
          navigate("/auth");
        }
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
      console.log("Tentative de connexion avec:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erreur de connexion:", error);
        
        // Message d'erreur plus convivial basé sur le type d'erreur
        if (error.message.includes("Database error querying schema")) {
          toast.error("Problème de connexion à la base de données", {
            description: "Veuillez réessayer dans quelques instants ou contacter l'administrateur.",
          });
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Identifiants invalides", {
            description: "Vérifiez votre adresse e-mail et votre mot de passe.",
          });
        } else {
          toast.error("Échec de connexion", {
            description: error.message,
          });
        }
        
        return { error, success: false };
      }

      console.log("Connexion réussie, redirection vers /admin");
      toast.success("Connexion réussie");
      return { error: null, success: true };
    } catch (err) {
      console.error("Erreur inattendue:", err);
      toast.error("Erreur de connexion", {
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
      });
      return { error: err, success: false };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("Tentative d'authentification avec Google");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile',
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Erreur de connexion Google:", error);
        toast.error("Échec de connexion Google", {
          description: error.message,
        });
      }
    } catch (err) {
      console.error("Erreur inattendue lors de l'authentification Google:", err);
      toast.error("Erreur de connexion Google");
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erreur de déconnexion:", error);
        toast.error("Échec de déconnexion", {
          description: error.message,
        });
      } else {
        toast.success("Déconnexion réussie");
        navigate("/auth");
      }
    } catch (err) {
      console.error("Erreur inattendue lors de la déconnexion:", err);
      toast.error("Erreur de déconnexion");
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
