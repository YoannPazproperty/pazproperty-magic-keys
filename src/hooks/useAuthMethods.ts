
import { UserRole } from "./types";
import { signInWithPassword, signInWithGoogle, resetUserPassword, signOutUser } from "./authService";
import { fetchUserRole } from "./roleService";

const USER_ROLE_KEY = "paz_user_role";
const ROLE_CACHE_EXPIRY_KEY = "paz_role_cache_expiry";
const CACHE_DURATION = 1000 * 60 * 30;

interface AuthMethodsProps {
  setLoading: (loading: boolean) => void;
  setUserRole: (role: UserRole) => void;
  user: any;
}

export const useAuthMethods = ({ setLoading, setUserRole, user }: AuthMethodsProps) => {
  const cacheUserRole = (role: UserRole) => {
    if (!role) return;
    localStorage.setItem(USER_ROLE_KEY, role as string);
    localStorage.setItem(ROLE_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
  };

  const getCachedRole = (): UserRole | null => {
    const expiry = parseInt(localStorage.getItem(ROLE_CACHE_EXPIRY_KEY) || "0", 10);
    if (Date.now() > expiry) {
      localStorage.removeItem(USER_ROLE_KEY);
      localStorage.removeItem(ROLE_CACHE_EXPIRY_KEY);
      return null;
    }
    return localStorage.getItem(USER_ROLE_KEY) as UserRole;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInWithPassword(email, password);
      if (result.success && result.data?.user) {
        const role = await fetchUserRole(result.data.user.id);
        setUserRole(role);
        cacheUserRole(role);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      return await resetUserPassword(email);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await signOutUser();
      if (result.success) {
        setUserRole(null);
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
    const cachedRole = getCachedRole();
    if (cachedRole) {
      setUserRole(cachedRole);
      return cachedRole;
    }
    const role = await fetchUserRole(user.id);
    setUserRole(role);
    cacheUserRole(role);
    return role;
  };

  return { signIn, resetPassword, signOut, signInWithGoogle, getUserRole };
};
