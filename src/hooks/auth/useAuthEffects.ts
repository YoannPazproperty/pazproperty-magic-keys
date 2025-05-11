
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "./types";
import { clearRoleCache } from "./utils/roleCache";
import { getTokenExpiryTime } from "./utils/sessionManager";
import { handleAuthStateChange } from "./utils/authStateHandlers";
import { getInitialSession } from "./utils/initialSession";

interface AuthEffectsProps {
  setUser: (user: any) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;
  setUserRole: (role: any) => void;
  setTokenExpiresAt: (expiresAt: number | null) => void;
}

/**
 * Hook to manage authentication effects including session state and token refresh
 */
export const useAuthEffects = ({
  setUser,
  setSession,
  setLoading,
  setUserRole,
  setTokenExpiresAt,
}: AuthEffectsProps) => {
  const navigate = useNavigate();

  // Main effect for auth state management
  useEffect(() => {
    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (process.env.NODE_ENV === 'development') {
          console.log("Auth state changed:", event);
        }
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession) {
          setTokenExpiresAt(getTokenExpiryTime(newSession));
        }
        
        if (event === "SIGNED_OUT") {
          navigate("/auth");
          setUserRole(null);
          clearRoleCache();
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Process auth state change with the utility function
          if (newSession?.user?.id) {
            Promise.resolve().then(() => {
              handleAuthStateChange(
                event, 
                newSession.user.id,
                newSession.user.email, 
                setUserRole,
                navigate
              ).catch(err => {
                setLoading(false);
                navigate("/");
                console.error("Auth state handling error:", err);
              });
            });
          }
        } else if (event === "PASSWORD_RECOVERY") {
          navigate("/auth/callback?reset=true");
        }
      }
    );

    // Then check for existing session
    getInitialSession(setLoading, setUser, setSession, setUserRole, setTokenExpiresAt);

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setLoading, setSession, setUser, setUserRole, setTokenExpiresAt]);

  // Additional effect for token refresh monitoring
  useEffect(() => {
    // Set up token health check every 10 minutes
    const tokenHealthCheck = setInterval(() => {
      supabase.auth.getSession().then(({ data }) => {
        const session = data.session;
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
      });
    }, 10 * 60 * 1000); // Check every 10 minutes

    return () => clearInterval(tokenHealthCheck);
  }, []);
};
