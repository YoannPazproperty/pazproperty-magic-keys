
import { createContext, useContext, useEffect } from "react";
import { AuthContextType } from "./types";
import { useAuthState } from "./useAuthState";
import { useAuthEffects } from "./useAuthEffects";
import { useAuthMethods } from "./useAuthMethods";
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    userRole,
    setUserRole,
    tokenExpiresAt,
    setTokenExpiresAt,
  } = useAuthState();

  useAuthEffects({
    setUser,
    setSession,
    setLoading,
    setUserRole,
    setTokenExpiresAt,
  });

  const {
    signIn,
    resetPassword,
    signOut,
    signInWithGoogle,
    getUserRole,
  } = useAuthMethods({
    setLoading,
    setUserRole,
    user,
  });

  // Additional effect for token health check
  useEffect(() => {
    if (!session) return;

    // Set up token health check every 10 minutes
    const tokenHealthCheck = setInterval(() => {
      if (!session?.expires_at) return;

      // Convert session expiry to timestamp (in milliseconds)
      const expiresAt = session.expires_at * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // If token expires in less than 15 minutes, request a refresh
      if (timeUntilExpiry < 15 * 60 * 1000) {
        if (process.env.NODE_ENV === 'development') {
          console.log("Auth token expiring soon, refreshing...");
        }
        // Force token refresh
        supabase.auth.refreshSession();
      }
    }, 10 * 60 * 1000); // Check every 10 minutes

    return () => clearInterval(tokenHealthCheck);
  }, [session]);

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
        userRole, // Add userRole to context for easier access
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
