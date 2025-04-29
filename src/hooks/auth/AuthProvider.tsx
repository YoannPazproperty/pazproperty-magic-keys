import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthContextType, UserRole } from "./types";
import { fetchUserRole, resolveRedirectPathByRole } from "./roleService";
import { signInWithPassword, signInWithGoogle, resetUserPassword, signOutUser } from "./authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const navigate = useNavigate();

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
                  const redirectPath = resolveRedirectPathByRole(role, newSession.user.email);
                  navigate(redirectPath);
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
      const result = await signInWithPassword(email, password);

      // If the connection is successful, check/create the role for the user
      if (result.success && result.data?.user) {
        try {
          const role = await fetchUserRole(result.data.user.id);
          setUserRole(role);
          
          // If no role was found or created, display a warning
          if (!role) {
            console.warn("No role defined for the user after connection");
            toast.warning("Authorization problem", {
              description: "Your account has no defined role. Contact the administrator."
            });
          } else {
            console.log("User role after connection:", role);
          }
        } catch (roleErr) {
          console.error("Error when checking or assigning role:", roleErr);
        }
      }

      return { error: result.error, success: result.success };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      return await resetUserPassword(email);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const result = await signOutUser();
      if (result.success) {
        setUserRole(null);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = async (): Promise<UserRole> => {
    if (!user) return null;
    
    // If role is already loaded and we're not currently loading it
    if (userRole && !roleLoading) {
      return userRole;
    }
    
    // Otherwise, retrieve the role
    setRoleLoading(true);
    try {
      const role = await fetchUserRole(user.id);
      setUserRole(role);
      return role;
    } finally {
      setRoleLoading(false);
    }
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

// Create and export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
