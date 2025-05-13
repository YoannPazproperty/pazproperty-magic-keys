
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/hooks/auth/types";
import { 
  isDevelopmentMode, 
  checkEmailDomain, 
  handleAccessNotification 
} from "../roleUtils";

interface UsePermissionCheckerProps {
  user: User | null;
  getUserRole: () => Promise<UserRole>;
  requiredRole?: UserRole;
  emailDomain?: string;
  checkAttempts?: number;
  setCheckAttempts?: (value: number) => void;
  setHasAccess?: (value: boolean | null) => void;
  setCheckingRole?: (value: boolean) => void;
  setRoleChecked?: (value: boolean) => void;
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
  emailDomain,
  checkAttempts = 0,
  setCheckAttempts,
  setHasAccess,
  setCheckingRole,
  setRoleChecked
}: UsePermissionCheckerProps): PermissionCheckResult => {
  const [hasAccessState, setHasAccessState] = useState<boolean | null>(null);
  const [checkingRoleState, setCheckingRoleState] = useState<boolean>(false);
  const [roleCheckedState, setRoleCheckedState] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [checkAttemptsState, setCheckAttemptsState] = useState<number>(checkAttempts);
  
  // Safety timeout function
  const startSafetyTimeout = (callback: () => void): number => {
    return window.setTimeout(callback, 30000); // 30 seconds timeout
  };
  
  const clearSafetyTimeout = (id?: number): void => {
    if (id) clearTimeout(id);
  };
  
  // Set state helpers that use both internal and external state if provided
  const updateHasAccess = (value: boolean | null) => {
    setHasAccessState(value);
    if (setHasAccess) setHasAccess(value);
  };
  
  const updateCheckingRole = (value: boolean) => {
    setCheckingRoleState(value);
    if (setCheckingRole) setCheckingRole(value);
  };
  
  const updateRoleChecked = (value: boolean) => {
    setRoleCheckedState(value);
    if (setRoleChecked) setRoleChecked(value);
  };
  
  const updateCheckAttempts = (value: number) => {
    setCheckAttemptsState(value);
    if (setCheckAttempts) setCheckAttempts(value);
  };
  
  const performRoleCheck = async () => {
    if (!user || !user.id || roleCheckedState || checkingRoleState) return;
    
    updateCheckingRole(true);
    const devMode = isDevelopmentMode();

    try {
      // Update attempt count
      updateCheckAttempts(checkAttemptsState + 1);
      
      // Check domain match first if specified
      if (emailDomain && !checkEmailDomain(user.email, emailDomain)) {
        console.log(`Email domain validation failed. Required: ${emailDomain}, User: ${user.email}`);
        updateHasAccess(false);
        updateCheckingRole(false);
        updateRoleChecked(true);
        
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
        updateHasAccess(true);
        updateCheckingRole(false);
        updateRoleChecked(true);
        return;
      }
      
      // Check for required role
      console.log(`Checking if user has required role: ${requiredRole}`);
      const role = await getUserRole();
      
      setUserRole(role);
      console.log(`User role retrieved: ${role}, required: ${requiredRole}`);
      
      if (role === requiredRole || role === 'admin') {
        console.log("Role check passed");
        updateHasAccess(true);
      } else {
        console.log("Role check failed");
        updateHasAccess(false);
        
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
      updateHasAccess(false);
      
      // Change 'error' to 'timeout' as a valid reason value
      handleAccessNotification({
        hasAccess: false,
        isDevelopment: devMode,
        reason: 'timeout',
        userEmail: user.email
      });
    } finally {
      updateCheckingRole(false);
      updateRoleChecked(true);
    }
  };
  
  useEffect(() => {
    if (!user) {
      updateHasAccess(false);
      updateRoleChecked(true);
      return;
    }
    
    updateHasAccess(null);
    updateRoleChecked(false);
    
    const timeoutId = startSafetyTimeout(() => {
      console.warn("Role check timed out");
      updateCheckingRole(false);
      updateRoleChecked(true);
      updateHasAccess(false);
      
      handleAccessNotification({
        hasAccess: false,
        isDevelopment: isDevelopmentMode(),
        reason: 'timeout',
        userEmail: user.email
      });
    });
    
    performRoleCheck();
    
    return () => {
      clearSafetyTimeout(timeoutId);
    };
  }, [user, requiredRole, emailDomain]);
  
  return {
    hasAccess: hasAccessState,
    checkingRole: checkingRoleState,
    roleChecked: roleCheckedState,
    userRole,
    checkAttempts: checkAttemptsState
  };
};
