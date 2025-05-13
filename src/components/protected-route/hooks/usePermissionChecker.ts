
import { UserRole } from "@/hooks/auth/types";
import { handleAccessNotification, hasRequiredRole, checkEmailDomain, isDevelopmentMode } from "../roleUtils";

interface UsePermissionCheckerProps {
  user: any;
  getUserRole: () => Promise<UserRole>;
  requiredRole?: Exclude<UserRole, null>;
  emailDomain?: string;
  checkAttempts: number;
  setCheckAttempts: (attempts: number) => void;
  setHasAccess: (hasAccess: boolean | null) => void;
  setCheckingRole: (checking: boolean) => void;
  setRoleChecked: (checked: boolean) => void;
}

export const usePermissionChecker = ({
  user,
  getUserRole,
  requiredRole,
  emailDomain,
  checkAttempts,
  setCheckAttempts,
  setHasAccess,
  setCheckingRole,
  setRoleChecked
}: UsePermissionCheckerProps) => {
  
  const checkPermissions = async () => {
    const devMode = isDevelopmentMode();

    try {
      setCheckAttempts(prev => prev + 1);
      
      // Check domain match first if specified
      if (emailDomain && !checkEmailDomain(user.email, emailDomain)) {
        console.log("Email domain mismatch:", user.email, emailDomain);
        setHasAccess(false);
        setCheckingRole(false);
        setRoleChecked(true);
        
        handleAccessNotification({
          hasAccess: false,
          isDevelopment: devMode,
          reason: 'domain',
          emailDomain,
          userEmail: user.email
        });
        
        return;
      }
      
      if (!requiredRole) {
        // No specific role required, just authentication
        setHasAccess(true);
        setCheckingRole(false);
        setRoleChecked(true);
        return;
      }
      
      // Now check for required role
      const userRole = await getUserRole();
      
      if (!userRole) {
        // No role assigned to user
        console.log("No role assigned");
        
        // In development, grant access after few attempts
        if (devMode && checkAttempts >= 3) {
          console.log("Development mode - Granting access despite missing role");
          setHasAccess(true);
          setCheckingRole(false);
          setRoleChecked(true);
          
          handleAccessNotification({
            hasAccess: true,
            isDevelopment: true,
            reason: 'norole'
          });
          
          return;
        }
        
        // In production, deny access if no role after several attempts
        if (checkAttempts >= 3) {
          console.log("Production mode - Denying access due to missing role");
          setHasAccess(false);
          setCheckingRole(false);
          setRoleChecked(true);
          
          handleAccessNotification({
            hasAccess: false,
            isDevelopment: false,
            reason: 'norole'
          });
          
          return;
        }
        
        // Try again if not too many attempts yet
        console.log("Still checking for role, attempt:", checkAttempts);
        return;
      }
      
      // User has a role, check if it matches required role
      const hasAccess = hasRequiredRole(userRole, requiredRole);
      console.log(`User role: ${userRole}, Required role: ${requiredRole}, Has access: ${hasAccess}`);
      setHasAccess(hasAccess);
      setCheckingRole(false);
      setRoleChecked(true);
      
      // Show notification if access denied
      if (!hasAccess) {
        handleAccessNotification({
          hasAccess: false,
          isDevelopment: devMode,
          reason: 'role',
          userRole,
          requiredRole
        });
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      
      // After several attempts with errors, make a decision
      if (checkAttempts >= 3) {
        // In development, grant access despite errors
        if (devMode) {
          console.log("Development mode - Granting access despite errors");
          setHasAccess(true);
        } else {
          // In production, deny access after multiple errors
          console.log("Production mode - Denying access due to persistent errors");
          setHasAccess(false);
        }
        
        setCheckingRole(false);
        setRoleChecked(true);
      }
    }
  };

  return {
    checkPermissions
  };
};
