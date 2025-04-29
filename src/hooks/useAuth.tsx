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
  getUserRole: () => Promise<"admin" | "manager" | "prestadores_tecnicos" | "user" | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<"admin" | "manager" | "prestadores_tecnicos" | "user" | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // Function to retrieve the role using user ID
  const fetchUserRole = async (userId: string): Promise<"admin" | "manager" | "prestadores_tecnicos" | "user" | null> => {
    try {
      setRoleLoading(true);
      console.log("Retrieving role for user:", userId);
      
      // First check if the user is a technical service provider (prestadores_tecnicos)
      const { data: prestadorRole, error: prestadorError } = await supabase
        .from('prestadores_roles')
        .select('nivel')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (prestadorRole) {
        console.log("User identified as an external service provider:", prestadorRole);
        return 'prestadores_tecnicos'; // External service providers are always 'prestadores_tecnicos'
      }
      
      // If not a service provider, check for internal roles
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();
        
      if (error) {
        console.error("Error retrieving role:", error);
        
        // Check if error is due to lack of records
        if (error.code === 'PGRST116') {
          console.log("No role found for the user, assigning default role");
          
          // Check if user has a pazproperty.pt email address
          const userEmail = user?.email || '';
          if (userEmail.endsWith('@pazproperty.pt')) {
            // Assign admin role for @pazproperty.pt emails
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ 
                user_id: userId,
                role: 'admin'
              });
              
            if (insertError) {
              console.error("Error assigning admin role:", insertError);
            } else {
              console.log("'admin' role automatically assigned for @pazproperty.pt address");
              return 'admin';
            }
          } else {
            // Assign default role (user) for others
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ 
                user_id: userId,
                role: 'user'
              });
              
            if (insertError) {
              console.error("Error assigning default role:", insertError);
            } else {
              console.log("'user' role assigned successfully");
              return 'user';
            }
          }
        }
        
        return null;
      }
      
      console.log("Role retrieved for user:", data?.role);
      return data?.role as "admin" | "manager" | "prestadores_tecnicos" | "user" || null;
    } catch (err) {
      console.error("Unexpected error retrieving role:", err);
      return null;
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        
        // Use setTimeout to avoid potential blocking in the callback
        setTimeout(() => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (event === "SIGNED_OUT") {
            navigate("/auth");
            setUserRole(null);
          } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            console.log("User logged in or token refreshed");
            
            // Check user's role for redirection
            if (newSession?.user?.id) {
              setTimeout(async () => {
                try {
                  // Check if this is an external technical service provider first
                  const { data: prestadorData } = await supabase
                    .from('prestadores_roles')
                    .select('nivel')
                    .eq('user_id', newSession.user.id)
                    .maybeSingle();
                  
                  if (prestadorData) {
                    // This is a technical service provider, redirect to extranet technique
                    setUserRole('prestadores_tecnicos');
                    navigate("/extranet-technique");
                    return;
                  }
                  
                  // If not a service provider, check internal roles
                  const role = await fetchUserRole(newSession.user.id);
                  setUserRole(role);
                  
                  // Redirect based on role
                  if (role === 'admin') {
                    // Check if email is @pazproperty.pt
                    const userEmail = newSession.user.email || '';
                    if (userEmail.endsWith('@pazproperty.pt')) {
                      navigate("/admin");
                    } else {
                      // If role is admin but not @pazproperty.pt, there's an error
                      console.warn("User with admin role but without @pazproperty.pt email");
                      toast.warning("Restricted access", {
                        description: "The Admin space is reserved for Pazproperty employees"
                      });
                      navigate("/");
                    }
                  } else if (role === 'user') {
                    navigate("/");
                  } else {
                    // If no role, redirect to a default page
                    navigate("/");
                  }
                } catch (err) {
                  console.error("Error checking role:", err);
                  // Redirect to default page in case of error
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
          console.error("Error retrieving initial session:", error);
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          // Retrieve role if user is logged in
          if (data.session?.user) {
            const role = await fetchUserRole(data.session.user.id);
            setUserRole(role);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error retrieving session:", err);
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

  const getUserRole = async (): Promise<"admin" | "manager" | "prestadores_tecnicos" | "user" | null> => {
    if (!user) return null;
    
    // If role is already loaded and we're not currently loading it
    if (userRole && !roleLoading) {
      return userRole;
    }
    
    // Otherwise, retrieve the role
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
