
import { UserRole } from "./types";
import { signInWithPassword, signInWithGoogle, resetUserPassword, signOutUser } from "./authService";
import { fetchUserRole } from "./roleService";
import { toast } from "sonner";

// Keys for localStorage
const USER_ROLE_KEY = "paz_user_role";
const ROLE_CACHE_EXPIRY_KEY = "paz_role_cache_expiry";
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

interface AuthMethodsProps {
  setLoading: (loading: boolean) => void;
  setUserRole: (role: UserRole) => void;
  user: any;
}

export const useAuthMethods = ({
  setLoading,
  setUserRole,
  user,
}: AuthMethodsProps) => {
  // Helper to cache the user role
  const cacheUserRole = (role: UserRole) => {
    if (!role) return;
    
    try {
      localStorage.setItem(USER_ROLE_KEY, role as string);
      localStorage.setItem(ROLE_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("Impossible de mettre en cache le rôle:", err);
      }
    }
  };

  // Helper to get cached role
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

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithPassword(email, password);

      // If the connection is successful, check/create the role for the user
      if (result.success && result.data?.user) {
        try {
          const role = await fetchUserRole(result.data.user.id);
          setUserRole(role);
          cacheUserRole(role);
          
          // If no role was found or created, display a warning
          if (!role) {
            if (process.env.NODE_ENV === 'development') {
              console.warn("No role defined for the user after connection");
            }
            
            toast.warning("Authorization problem", {
              description: "Your account has no defined role. Contact the administrator."
            });
          }
        } catch (roleErr) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Error when checking or assigning role:", roleErr);
          }
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
        // Clear role cache on sign out
        localStorage.removeItem(USER_ROLE_KEY);
        localStorage.removeItem(ROLE_CACHE_EXPIRY_KEY);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = async (): Promise<UserRole> => {
    if (!user) return null;
    
    try {
      // Check for cached role first
      const cachedRole = getCachedRole();
      if (cachedRole) {
        setUserRole(cachedRole);
        return cachedRole;
      }
      
      // If no cached role, fetch from server
      const role = await fetchUserRole(user.id);
      setUserRole(role);
      cacheUserRole(role);
      return role;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error getting user role:", error);
      }
      return null;
    }
  };

  return {
    signIn,
    resetPassword,
    signOut,
    signInWithGoogle,
    getUserRole,
  };
};
