
import { useCallback, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/hooks/auth/types";
import { useSafetyTimeout } from "./useSafetyTimeout";

export type PermissionErrorType = "domain" | "timeout" | "role" | "norole" | "error";

export interface PermissionCheckResult {
  hasAccess: boolean | null;
  checking: boolean;
  error: PermissionErrorType | null;
  attempts: number;
}

export interface UsePermissionCheckerProps {
  user: User | null;
  getUserRole: () => Promise<UserRole>;
  requiredRole?: UserRole;
  emailDomain?: string;
}

export const usePermissionChecker = ({
  user,
  getUserRole,
  requiredRole,
  emailDomain,
}: UsePermissionCheckerProps): PermissionCheckResult => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [error, setError] = useState<PermissionErrorType | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  
  // Use the safety timeout hook
  const { startSafetyTimeout, clearSafetyTimeout } = useSafetyTimeout();

  // Email domain check
  const checkEmailDomain = useCallback(() => {
    if (!user || !emailDomain) return true;
    
    const userEmail = user.email?.toLowerCase() || "";
    return userEmail.endsWith(`@${emailDomain.toLowerCase()}`);
  }, [user, emailDomain]);

  // Check if user has the required role
  const checkRolePermission = useCallback(async () => {
    if (!user || !requiredRole) return true;
    
    try {
      const userRole = await getUserRole();
      console.log(`User role: ${userRole}, Required role: ${requiredRole}`);
      
      // No role means no access
      if (!userRole) {
        setError("norole");
        return false;
      }
      
      // Check if user has the required role
      const hasRequiredRole = userRole === requiredRole;
      
      if (!hasRequiredRole) {
        setError("role");
      }
      
      return hasRequiredRole;
    } catch (err) {
      console.error("Error checking role permission:", err);
      setError("error");
      return false;
    }
  }, [user, requiredRole, getUserRole]);

  // Perform the check
  const performCheck = useCallback(async () => {
    // Skip checks if user is null
    if (!user) {
      setHasAccess(false);
      setChecking(false);
      return;
    }
    
    setChecking(true);
    setError(null);
    setAttempts((prev) => prev + 1);
    
    // Start safety timeout
    const timeoutId = startSafetyTimeout(() => {
      console.warn("Role check timed out after 5 seconds");
      setError("timeout");
      setHasAccess(false);
      setChecking(false);
    }, 5000);
    
    try {
      // Check email domain
      const domainValid = checkEmailDomain();
      
      if (!domainValid) {
        setError("domain");
        setHasAccess(false);
        setChecking(false);
        clearSafetyTimeout(timeoutId);
        return;
      }
      
      // Check role
      const roleValid = await checkRolePermission();
      
      setHasAccess(roleValid);
      setChecking(false);
      clearSafetyTimeout(timeoutId);
    } catch (err) {
      console.error("Error in permission check:", err);
      setError("error");
      setHasAccess(false);
      setChecking(false);
      clearSafetyTimeout(timeoutId);
    }
  }, [user, checkEmailDomain, checkRolePermission, startSafetyTimeout, clearSafetyTimeout]);

  // Run the check when the dependencies change
  useEffect(() => {
    if (user) {
      performCheck();
    } else {
      setHasAccess(false);
      setChecking(false);
      setError(null);
    }
  }, [user, performCheck]);

  return { hasAccess, checking, error, attempts };
};
