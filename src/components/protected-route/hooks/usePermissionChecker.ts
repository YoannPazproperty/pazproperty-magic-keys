
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/hooks/auth/types";
import { 
  isDevelopmentMode, 
  checkEmailDomain, 
  handleAccessNotification 
} from "../roleUtils";
import { useSafetyTimeout } from "./useSafetyTimeout";

interface UsePermissionCheckerProps {
  user: User | null;
  getUserRole: (userId: string) => Promise<UserRole | null>;
  requiredRole?: UserRole;
  emailDomain?: string;
}

interface PermissionCheckResult {
  hasAccess: boolean | null;
  checkingRole: boolean;
  roleChecked: boolean;
  userRole: UserRole | null;
  checkAttempts: number;
}

export const usePermissionChecker = ({
  user,
  getUserRole,
  requiredRole,
  emailDomain
}: UsePermissionCheckerProps): PermissionCheckResult => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState<boolean>(false);
  const [roleChecked, setRoleChecked] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [checkAttempts, setCheckAttempts] = useState<number>(0);
  
  const { startSafetyTimeout, clearSafetyTimeout } = useSafetyTimeout();
  
  const performRoleCheck = async () => {
    if (!user || !user.id || roleChecked || checkingRole) return;
    
    setCheckingRole(true);
    const devMode = isDevelopmentMode();

    try {
      // Fixed: Using a numeric value directly rather than a function
      setCheckAttempts(checkAttempts + 1);
      
      // Check domain match first if specified
      if (emailDomain && !checkEmailDomain(user.email, emailDomain)) {
        console.log(`Email domain validation failed. Required: ${emailDomain}, User: ${user.email}`);
        setHasAccess(false);
        setCheckingRole(false);
        setRoleChecked(true);
        
        // Fixed: Updated to match AccessNotificationParams interface
        handleAccessNotification({
          hasAccess: false,
          isDevelopment: devMode,
          reason: 'domain',
          emailDomain,
          userEmail: user.email
        });
        
        return;
      }
      
      // If no specific role is required, access is granted
      if (!requiredRole) {
        console.log("No specific role required, access granted");
        setHasAccess(true);
        setCheckingRole(false);
        setRoleChecked(true);
        return;
      }
      
      // Check for required role
      console.log(`Checking if user has required role: ${requiredRole}`);
      const role = await getUserRole(user.id);
      
      setUserRole(role);
      console.log(`User role retrieved: ${role}, required: ${requiredRole}`);
      
      if (role === requiredRole || role === 'admin') {
        console.log("Role check passed");
        setHasAccess(true);
      } else {
        console.log("Role check failed");
        setHasAccess(false);
        
        handleAccessNotification({
          hasAccess: false,
          isDevelopment: devMode,
          reason: 'role',
          userRole: role,
          requiredRole: requiredRole,
          userEmail: user.email
        });
      }
    } catch (error) {
      console.error("Error during permission check:", error);
      setHasAccess(false);
      
      handleAccessNotification({
        hasAccess: false,
        isDevelopment: devMode,
        reason: 'error',
        userEmail: user.email
      });
    } finally {
      setCheckingRole(false);
      setRoleChecked(true);
      clearSafetyTimeout();
    }
  };
  
  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setRoleChecked(true);
      return;
    }
    
    setHasAccess(null);
    setRoleChecked(false);
    
    const timeoutId = startSafetyTimeout(() => {
      console.warn("Role check timed out");
      setCheckingRole(false);
      setRoleChecked(true);
      setHasAccess(false);
      
      handleAccessNotification({
        hasAccess: false,
        isDevelopment: isDevelopmentMode(),
        reason: 'timeout',
        userEmail: user.email
      });
    });
    
    performRoleCheck();
    
    return () => {
      clearSafetyTimeout();
    };
  }, [user, requiredRole, emailDomain]);
  
  return {
    hasAccess,
    checkingRole,
    roleChecked,
    userRole,
    checkAttempts
  };
};
