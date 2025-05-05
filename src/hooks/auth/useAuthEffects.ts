
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserRole, resolveRedirectPathByRole } from "./roleService";
import { UserRole } from "./types";

interface AuthEffectsProps {
  setUser: (user: any) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;
  setUserRole: (role: any) => void;
}

export const useAuthEffects = ({
  setUser,
  setSession,
  setLoading,
  setUserRole,
}: AuthEffectsProps) => {
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
                  
                  // Redirect based on role and user metadata
                  if (role === 'provider' || 
                      (newSession.user.user_metadata && newSession.user.user_metadata.is_provider)) {
                    // If user is a provider (from either role or metadata), redirect to extranet
                    navigate("/extranet-technique");
                  } else {
                    // Otherwise use the standard role-based redirection
                    const redirectPath = resolveRedirectPathByRole(role, newSession.user.email);
                    navigate(redirectPath);
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
            // Check for provider status in both roles and metadata
            const { data: prestadorData } = await supabase
              .from('prestadores_roles')
              .select('nivel')
              .eq('user_id', data.session.user.id)
              .maybeSingle();
              
            if (prestadorData || 
                (data.session.user.user_metadata && 
                 data.session.user.user_metadata.is_provider)) {
              setUserRole('prestadores_tecnicos');
            } else {
              const role = await fetchUserRole(data.session.user.id);
              setUserRole(role);
            }
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
  }, [navigate, setLoading, setSession, setUser, setUserRole]);
};
