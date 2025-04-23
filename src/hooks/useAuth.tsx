
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        
        // Utiliser setTimeout pour éviter des blocages potentiels dans le callback
        setTimeout(() => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (event === "SIGNED_OUT") {
            navigate("/auth");
          } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            console.log("Utilisateur connecté ou token rafraîchi");
            
            // Vérifier si l'utilisateur doit être redirigé vers la zone admin
            setTimeout(async () => {
              try {
                const { data } = await supabase
                  .from('user_roles')
                  .select('role')
                  .eq('user_id', newSession?.user?.id)
                  .maybeSingle();
                  
                const isAdmin = data?.role === 'admin';
                console.log("Vérification du rôle:", data?.role, "Est admin:", isAdmin);
                
                // Rediriger vers la page admin si l'utilisateur a un rôle admin
                if (isAdmin) {
                  navigate("/admin");
                } else if (data?.role) {
                  // Si l'utilisateur a un autre rôle, rediriger vers une autre page selon le besoin
                  navigate("/");
                }
              } catch (err) {
                console.error("Erreur lors de la vérification du rôle:", err);
              }
            }, 0);
          } else if (event === "PASSWORD_RECOVERY") {
            navigate("/auth/callback?reset=true");
          }
        }, 0);
      }
    );

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
      console.log("Longueur du mot de passe:", password.length);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erreur de connexion:", error);
        console.log("Message d'erreur:", error.message);
        
        if (error.message.includes("Invalid login credentials")) {
          console.log("Erreur d'identifiants invalides détectée");
          console.log("L'utilisateur a entré des identifiants invalides. Soit l'utilisateur n'existe pas, soit le mot de passe est incorrect.");
          
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
        
        return { error, success: false };
      }

      // Vérifier le rôle de l'utilisateur
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user?.id)
          .maybeSingle();
          
        // Si l'utilisateur n'a pas de rôle, lui attribuer le rôle 'user' par défaut
        if (!roleData) {
          console.log("Utilisateur sans rôle détecté, attribution du rôle par défaut");
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({ 
              user_id: data.user?.id,
              role: 'user'
            });
            
          if (insertError) {
            console.error("Erreur lors de l'attribution du rôle par défaut:", insertError);
          } else {
            console.log("Rôle 'user' attribué avec succès");
          }
        } else {
          console.log("Rôle utilisateur existant:", roleData.role);
        }
      } catch (roleErr) {
        console.error("Erreur lors de la vérification ou attribution du rôle:", roleErr);
      }

      console.log("Connexion réussie");
      toast.success("Connexion réussie");
      
      return { error: null, success: true };
    } catch (err) {
      console.error("Erreur inattendue lors de la connexion:", err);
      toast.error("Erreur de connexion", {
        description: "Une erreur inattendue s'est produite. Veuillez réessayer."
      });
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
