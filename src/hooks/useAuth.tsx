
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
  const [userRole, setUserRole] = useState<"admin" | "manager" | "user" | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // Fonction pour récupérer le rôle en utilisant l'ID utilisateur
  const fetchUserRole = async (userId: string): Promise<"admin" | "manager" | "user" | null> => {
    try {
      setRoleLoading(true);
      console.log("Récupération du rôle pour l'utilisateur:", userId);
      
      // Vérifier d'abord si l'utilisateur est un prestataire externe
      const { data: prestadorRole, error: prestadorError } = await supabase
        .from('prestadores_roles')
        .select('nivel')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (prestadorRole) {
        console.log("Utilisateur identifié comme prestataire externe:", prestadorRole);
        return 'manager'; // Les prestataires sont toujours 'manager'
      }
      
      // Si pas un prestataire, vérifier les rôles internes
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();
        
      if (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
        
        // Vérifier si l'erreur est due à l'absence d'enregistrements
        if (error.code === 'PGRST116') {
          console.log("Aucun rôle trouvé pour l'utilisateur, attribution du rôle par défaut");
          
          // Vérifier si l'utilisateur a une adresse email pazproperty.pt
          const userEmail = user?.email || '';
          if (userEmail.endsWith('@pazproperty.pt')) {
            // Attribuer un rôle admin pour les emails @pazproperty.pt
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ 
                user_id: userId,
                role: 'admin'
              });
              
            if (insertError) {
              console.error("Erreur lors de l'attribution du rôle admin:", insertError);
            } else {
              console.log("Rôle 'admin' attribué automatiquement pour adresse @pazproperty.pt");
              return 'admin';
            }
          } else {
            // Attribuer un rôle par défaut (user) pour les autres
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ 
                user_id: userId,
                role: 'user'
              });
              
            if (insertError) {
              console.error("Erreur lors de l'attribution du rôle par défaut:", insertError);
            } else {
              console.log("Rôle 'user' attribué avec succès");
              return 'user';
            }
          }
        }
        
        return null;
      }
      
      console.log("Rôle récupéré pour l'utilisateur:", data?.role);
      return data?.role as "admin" | "manager" | "user" || null;
    } catch (err) {
      console.error("Erreur inattendue lors de la récupération du rôle:", err);
      return null;
    } finally {
      setRoleLoading(false);
    }
  };

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
            setUserRole(null);
          } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            console.log("Utilisateur connecté ou token rafraîchi");
            
            // Vérifier le rôle de l'utilisateur pour la redirection
            if (newSession?.user?.id) {
              setTimeout(async () => {
                try {
                  // Vérifier si c'est un prestataire externe d'abord
                  const { data: prestadorData } = await supabase
                    .from('prestadores_roles')
                    .select('nivel')
                    .eq('user_id', newSession.user.id)
                    .maybeSingle();
                  
                  if (prestadorData) {
                    // C'est un prestataire externe, rediriger vers l'extranet technique
                    setUserRole('manager');
                    navigate("/extranet-technique");
                    return;
                  }
                  
                  // Si ce n'est pas un prestataire, vérifier les rôles internes
                  const role = await fetchUserRole(newSession.user.id);
                  setUserRole(role);
                  
                  // Rediriger en fonction du rôle
                  if (role === 'admin') {
                    // Vérifier si l'email est @pazproperty.pt
                    const userEmail = newSession.user.email || '';
                    if (userEmail.endsWith('@pazproperty.pt')) {
                      navigate("/admin");
                    } else {
                      // Si le rôle est admin mais pas @pazproperty.pt, c'est une erreur
                      console.warn("Utilisateur avec rôle admin mais sans email @pazproperty.pt");
                      toast.warning("Accès restreint", {
                        description: "L'espace Admin est réservé aux employés de Pazproperty"
                      });
                      navigate("/");
                    }
                  } else if (role === 'user') {
                    navigate("/");
                  } else {
                    // Si pas de rôle, rediriger vers une page par défaut
                    navigate("/");
                  }
                } catch (err) {
                  console.error("Erreur lors de la vérification du rôle:", err);
                  // Rediriger vers une page par défaut en cas d'erreur
                  navigate("/");
                }
              }, 0);
            }
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
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          // Récupérer le rôle si l'utilisateur est connecté
          if (data.session?.user) {
            const role = await fetchUserRole(data.session.user.id);
            setUserRole(role);
          }
        }
        
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erreur de connexion:", error);
        
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
        
        return { error, success: false };
      }

      // Si la connexion réussit, vérifier/créer le rôle pour l'utilisateur
      try {
        const role = await fetchUserRole(data.user.id);
        setUserRole(role);
        
        // Si aucun rôle n'a été trouvé ou créé, afficher un avertissement
        if (!role) {
          console.warn("Aucun rôle défini pour l'utilisateur après la connexion");
          toast.warning("Problème d'autorisation", {
            description: "Votre compte n'a pas de rôle défini. Contactez l'administrateur."
          });
        } else {
          console.log("Rôle de l'utilisateur après connexion:", role);
        }
      } catch (roleErr) {
        console.error("Erreur lors de la vérification ou attribution du rôle:", roleErr);
      }

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
        setUserRole(null);
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
    
    // Si le rôle est déjà chargé et que nous ne sommes pas en train de le charger
    if (userRole && !roleLoading) {
      return userRole;
    }
    
    // Sinon, récupérer le rôle
    const role = await fetchUserRole(user.id);
    setUserRole(role);
    return role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading: loading || roleLoading,
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
