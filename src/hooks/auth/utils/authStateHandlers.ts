
import { AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "../types";
import { fetchUserRole } from "../roleService";
import { cacheUserRole, getCachedRole } from "./roleCache";
import { handleRedirectionByRole } from "./sessionManager";

/**
 * Handle auth state events like sign-in, sign-out, etc.
 */
export const handleAuthStateChange = async (
  event: AuthChangeEvent,
  userId: string | undefined,
  userEmail: string | undefined,
  setUserRole: (role: UserRole) => void,
  navigate: (path: string) => void
): Promise<void> => {
  if (event === "SIGNED_OUT") {
    navigate("/auth");
    setUserRole(null);
    return;
  }
  
  if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && userId) {
    // Check if user email is @pazproperty.pt first for quick access
    if (userEmail?.endsWith('@pazproperty.pt')) {
      setUserRole('admin');
      navigate("/admin");
      return;
    }
    
    // Try to get role from cache first for quick response
    const cachedRole = getCachedRole();
    if (cachedRole) {
      setUserRole(cachedRole);
      handleRedirectionByRole(cachedRole, userEmail, navigate);
      return;
    }
    
    try {
      // Check if this is a provider based on roles
      const { data: prestadorData } = await supabase
        .from('prestadores_roles')
        .select('nivel')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (prestadorData) {
        setUserRole('provider');
        navigate("/extranet-technique");
        return;
      }
      
      // Check standard roles
      const role = await fetchUserRole(userId);
      setUserRole(role);
      
      // Cache the role
      cacheUserRole(role);
      
      // Handle redirection based on role
      handleRedirectionByRole(role, userEmail, navigate);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error checking role:", err);
      }
      navigate("/");
    }
  } else if (event === "PASSWORD_RECOVERY") {
    navigate("/auth/callback?reset=true");
  }
};
