
import { checkEmailDomain, hasRequiredRole, handleAccessNotification, isDevelopmentMode } from "../roleUtils";

interface PermissionCheckerProps {
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
}: PermissionCheckerProps) => {
  const checkPermissions = async () => {
    try {
      // Check domain restriction first if specified
      if (emailDomain && user.email) {
        const domainMatch = checkEmailDomain(user.email, emailDomain);
        if (!domainMatch) {
          console.log(`Access denied: email ${user.email} is not from domain ${emailDomain}`);
          handleAccessNotification({
            hasAccess: false,
            isDevelopment: isDevelopmentMode(),
            reason: 'domain',
            emailDomain
          });
          setHasAccess(false);
          setCheckingRole(false);
          setRoleChecked(true);
          return;
        }
      }

      // Special case: if user email is from pazproperty.pt and trying to access admin
      if (requiredRole === 'admin' && user.email?.endsWith('@pazproperty.pt')) {
        console.log("User has pazproperty.pt email, granting admin access");
        setHasAccess(true);
        setCheckingRole(false);
        setRoleChecked(true);
        return;
      }

      // Then check role if needed
      if (requiredRole) {
        await checkUserRole();
      } else {
        // If only checking the domain and we reach here, the domain is correct
        setHasAccess(true);
        setCheckingRole(false);
        setRoleChecked(true);
      }
    } catch (error) {
      handlePermissionError(error);
    }
  };

  const checkUserRole = async () => {
    try {
      // First attempt will be immediate
      const userRole = await getUserRole();
      console.log("User's role verified:", userRole);
      console.log("Required role for this page:", requiredRole);
      
      const roleGrantsAccess = hasRequiredRole(userRole, requiredRole);
      
      if (roleGrantsAccess) {
        setHasAccess(true);
        setCheckingRole(false);
        setRoleChecked(true);
        return;
      }

      // Handle cases where role doesn't grant access or no role found
      handleRoleVerificationResult(userRole);
    } catch (error) {
      console.error("Error in role verification:", error);
      throw error;
    }
  };

  const handleRoleVerificationResult = (userRole: UserRole) => {
    // If we've reached max attempts or no role is found
    if (!userRole || checkAttempts >= 3) {
      console.log("⚠️ No role found for user or max attempts reached:", checkAttempts);
      
      // For development purposes, grant access by default
      const devMode = isDevelopmentMode();
      // Special case for production: If it's a pazproperty.pt email and trying to access admin section
      const isCompanyEmail = user.email?.endsWith('@pazproperty.pt') || false;
      
      if (devMode || (isCompanyEmail && requiredRole === 'admin')) {
        console.log(devMode 
          ? "⚠️ Development mode detected - Granting access by default" 
          : "⚠️ Company email detected - Granting admin access despite role issue");
        setHasAccess(true);
        setRoleChecked(true);
        handleAccessNotification({
          hasAccess: true,
          isDevelopment: devMode,
          reason: 'norole'
        });
      } else {
        setHasAccess(false);
        setRoleChecked(true);
        handleAccessNotification({
          hasAccess: false,
          isDevelopment: devMode,
          reason: 'norole'
        });
      }
      setCheckingRole(false);
    } else {
      // If no role is found and this is not the last try, retry with exponential backoff
      if (!userRole) {
        const nextAttempt = checkAttempts + 1;
        console.log(`⚠️ No role found for user, retrying attempt ${nextAttempt} in ${nextAttempt * 2} seconds`);
        
        // Use exponential backoff for retries - using window.setTimeout to be explicit
        window.setTimeout(() => {
          setCheckAttempts(nextAttempt);
        }, nextAttempt * 2000); // Wait longer between attempts
        return; // Don't set checkingRole to false yet
      }
      
      // User with a role that doesn't have the required permission
      setHasAccess(false);
      setRoleChecked(true);
      setCheckingRole(false);
      handleAccessNotification({
        hasAccess: false,
        isDevelopment: isDevelopmentMode(),
        reason: 'role',
        userRole,
        requiredRole
      });
    }
  };

  const handlePermissionError = (error: any) => {
    console.error("Error checking role:", error);
    
    // In case of error, check if user has company email for admin access
    const devMode = isDevelopmentMode();
    const isCompanyEmail = user.email?.endsWith('@pazproperty.pt') || false;
    
    if (devMode || (isCompanyEmail && requiredRole === 'admin')) {
      console.log(devMode 
        ? "⚠️ Development mode detected - Granting access despite error"
        : "⚠️ Company email detected - Granting admin access despite error");
      setHasAccess(true);
      setRoleChecked(true);
      import('sonner').then(({ toast }) => {
        toast.warning("Role verification error", { 
          description: "Access is granted by default despite the error",
          id: "role-error"
        });
      });
    } else {
      setHasAccess(false);
      setRoleChecked(true);
    }
    
    setCheckingRole(false);
  };

  return {
    checkPermissions
  };
};
