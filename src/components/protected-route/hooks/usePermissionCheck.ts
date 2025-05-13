
import { useCallback, useState } from "react";
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/hooks/auth/types";
import { usePermissionChecker } from "./usePermissionChecker";

interface UsePermissionCheckProps {
  user: User | null;
  getUserRole: () => Promise<UserRole>;
  requiredRole?: UserRole;
  emailDomain?: string;
}

interface UsePermissionCheckResult {
  hasAccess: boolean | null;
  checkingRole: boolean;
  checkPermission: () => Promise<boolean>;
  checkAttempts: number;
}

export const usePermissionCheck = ({
  user,
  getUserRole,
  requiredRole,
  emailDomain,
}: UsePermissionCheckProps): UsePermissionCheckResult => {
  const [manuallyChecking, setManuallyChecking] = useState(false);
  
  // Use the permission checker
  const { hasAccess, checking, attempts } = usePermissionChecker({
    user,
    getUserRole,
    requiredRole,
    emailDomain,
  });
  
  // Function to manually check permission
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (!user || !requiredRole) {
        return !requiredRole; // If no required role, allow access
      }
      
      setManuallyChecking(true);
      
      // Check email domain
      if (emailDomain) {
        const userEmail = user.email?.toLowerCase() || "";
        if (!userEmail.endsWith(`@${emailDomain.toLowerCase()}`)) {
          return false;
        }
      }
      
      // Check role
      const userRole = await getUserRole();
      const hasRequiredPermission = userRole === requiredRole;
      
      setManuallyChecking(false);
      return hasRequiredPermission;
    } catch (err) {
      console.error("Error checking permission manually:", err);
      setManuallyChecking(false);
      return false;
    }
  }, [user, requiredRole, emailDomain, getUserRole]);
  
  return {
    hasAccess,
    checkingRole: checking || manuallyChecking,
    checkPermission,
    checkAttempts: attempts,
  };
};
