
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserRole, resolveRedirectPathByRole } from "./roleService";
import { UserRole } from "./types";
import { toast } from "sonner";

// Constants for role cache
const USER_ROLE_KEY = "paz_user_role";
const ROLE_CACHE_EXPIRY_KEY = "paz_role_cache_expiry";

interface AuthEffectsProps {
  setUser: (user: any) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;
  setUserRole: (role: any) => void;
  setTokenExpiresAt: (expiresAt: number | null) => void;
}

export const useAuthEffects = ({
  setUser,
  setSession,
  setLoading,
  setUserRole,
  setTokenExpiresAt,
}: AuthEffectsProps) => {
  const navigate = useNavigate();

  // Helper to get cached role (duplicated here to avoid dependencies)
  const getCachedRole = (): UserRole | null => {
    try {
      const expiryStr = localStorage.getItem(ROLE_CACHE_EXPIRY_KEY);
      if (!expiryStr) return null;
      
      const expiry = parseInt(expiryStr, 10);
      if (isNaN(expiry) || Date.now() > expiry) {
        // Clear expired cache
        localStorage.removeItem(USER_ROLE_KEY);
        localStorage.removeItem(ROLE_CACHE_EXPIRY_KEY);
        return null;
      }
      
      return localStorage.getItem(USER_ROLE_KEY) as UserRole;
    } catch (err) {
      return null;
    }
  };

  // Helper to update token expiration information
  const updateTokenExpiryInfo = (session: any) => {
    if (session?.expires_at) {
      setTokenExpiresAt(session.expires_at * 1000); // Convert to milliseconds
    } else {
      setTokenExpiresAt(null);
    }
  };

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
          updateTokenExpiryInfo(newSession);
        }
        
        if (event === "SIGNED_OUT") {
          navigate("/auth");
          setUserRole(null);
          // Clear role cache
          localStorage.removeItem(USER_ROLE_KEY);
          localStorage.removeItem(ROLE_CACHE_EXPIRY_KEY);
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Check user's role for redirection
          if (newSession?.user?.id) {
            Promise.resolve().then(async () => {
              try {
                // Check if user email is @pazproperty.pt first
                const userEmail = newSession.user.email || '';
                
                if (userEmail.endsWith('@pazproperty.pt')) {
                  setUserRole('admin');
                  navigate("/admin");
                  return;
                }
                
                // Try to get role from cache first
                const cachedRole = getCachedRole();
                if (cachedRole) {
                  setUserRole(cachedRole);
                  handleRedirectionByRole(cachedRole, userEmail);
                  return;
                }
                
                // Check if this is a provider based on roles
                const { data: prestadorData } = await supabase
                  .from('prestadores_roles')
                  .select('nivel')
                  .eq('user_id', newSession.user.id)
                  .maybeSingle();
                
                if (prestadorData) {
                  setUserRole('provider');
                  navigate("/extranet-technique");
                  return;
                }
                
                // Check standard roles
                const role = await fetchUserRole(newSession.user.id);
                setUserRole(role);
                
                // Cache the role
                try {
                  localStorage.setItem(USER_ROLE_KEY, role);
                  localStorage.setItem(ROLE_CACHE_EXPIRY_KEY, (Date.now() + 30 * 60 * 1000).toString()); // 30 min cache
                } catch (err) {
                  // Silently fail if localStorage is unavailable
                }
                
                handleRedirectionByRole(role, userEmail);
              } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                  console.error("Error checking role:", err);
                }
                setLoading(false);
                navigate("/");
              }
            });
          }
        } else if (event === "PASSWORD_RECOVERY") {
          navigate("/auth/callback?reset=true");
        }
      }
    );

    const handleRedirectionByRole = (role: UserRole, email: string | null | undefined) => {
      // If role indicates provider or metadata shows provider, redirect to extranet
      if (role === 'provider') {
        navigate("/extranet-technique");
      } else {
        // Otherwise use standard role-based redirection
        const redirectPath = resolveRedirectPathByRole(role, email);
        navigate(redirectPath);
      }
    };

    // Then check for existing session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Error retrieving initial session:", error);
          }
          setLoading(false);
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          if (data.session) {
            updateTokenExpiryInfo(data.session);
          }
          
          // Retrieve role if user is logged in
          if (data.session?.user) {
            try {
              // First check if email is @pazproperty.pt
              const userEmail = data.session.user.email || '';
              
              if (userEmail.endsWith('@pazproperty.pt')) {
                setUserRole('admin');
                setLoading(false);
                return;
              }
              
              // Try to get role from cache first
              const cachedRole = getCachedRole();
              if (cachedRole) {
                setUserRole(cachedRole);
                setLoading(false);
                return;
              }
              
              // Check for provider status in roles
              const { data: prestadorData } = await supabase
                .from('prestadores_roles')
                .select('nivel')
                .eq('user_id', data.session.user.id)
                .maybeSingle();
                
              if (prestadorData || 
                  (data.session.user.user_metadata && 
                  data.session.user.user_metadata.is_provider)) {
                setUserRole('provider');
              } else {
                const role = await fetchUserRole(data.session.user.id);
                setUserRole(role);
                
                // Cache the role
                try {
                  localStorage.setItem(USER_ROLE_KEY, role);
                  localStorage.setItem(ROLE_CACHE_EXPIRY_KEY, (Date.now() + 30 * 60 * 1000).toString()); // 30 min cache
                } catch (err) {
                  // Silently fail if localStorage is unavailable
                }
              }
              setLoading(false);
            } catch (err) {
              if (process.env.NODE_ENV === 'development') {
                console.error("Error checking initial role:", err);
              }
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Unexpected error retrieving session:", err);
        }
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setLoading, setSession, setUser, setUserRole, setTokenExpiresAt]);
};
