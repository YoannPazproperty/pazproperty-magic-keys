
import { UserRole } from "./types";
import { signInWithPassword, signInWithGoogle, resetUserPassword, signOutUser } from "./authService";
import { fetchUserRole } from "./roleService";
import { toast } from "sonner";

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
    
    try {
      const role = await fetchUserRole(user.id);
      setUserRole(role);
      return role;
    } catch (error) {
      console.error("Error getting user role:", error);
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
