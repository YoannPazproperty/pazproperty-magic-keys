
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "../types";
import { fetchUserRole } from "../roleService";
import { cacheUserRole, getCachedRole } from "./roleCache";
import { getTokenExpiryTime } from "./sessionManager";

/**
 * Handle fetching and processing the initial session
 */
export const getInitialSession = async (
  setLoading: (loading: boolean) => void,
  setUser: (user: any) => void,
  setSession: (session: any) => void,
  setUserRole: (role: UserRole) => void,
  setTokenExpiresAt: (expiresAt: number | null) => void
): Promise<void> => {
  try {
    setLoading(true);
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error retrieving initial session:", error);
      }
      setLoading(false);
      return;
    } 
    
    setSession(data.session);
    setUser(data.session?.user ?? null);
    
    if (data.session) {
      setTokenExpiresAt(getTokenExpiryTime(data.session));
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
          cacheUserRole(role);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error checking initial role:", err);
        }
      }
    }
    
    setLoading(false);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Unexpected error retrieving session:", err);
    }
    setLoading(false);
  }
};
