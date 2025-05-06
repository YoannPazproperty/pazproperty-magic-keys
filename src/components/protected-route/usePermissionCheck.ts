
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/hooks/auth/types";
import { checkEmailDomain, hasRequiredRole, handleAccessNotification, isDevelopmentMode } from "./roleUtils";
import { toast } from "sonner";

interface UsePermissionCheckProps {
  user: User | null;
  getUserRole: () => Promise<UserRole>;
  requiredRole?: "admin" | "manager" | "provider" | "user";
  emailDomain?: string;
}

export const usePermissionCheck = ({
  user,
  getUserRole,
  requiredRole,
  emailDomain
}: UsePermissionCheckProps) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(!!requiredRole);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [roleChecked, setRoleChecked] = useState(false);
  const [timeout, setTimeout] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setCheckingRole(false);
      return;
    }

    if (!requiredRole && !emailDomain) {
      // If no role or domain is required, authenticated user has access
      setHasAccess(true);
      setCheckingRole(false);
      return;
    }

    // If we've already checked the role for this user and this page, don't recheck
    if (roleChecked) {
      return;
    }

    // Add a safety timeout to avoid infinite checking
    const safetyTimeout = window.setTimeout(() => {
      console.log("Safety timeout triggered after 5 seconds");
      if (checkingRole) {
        setCheckingRole(false);
        
        // In development mode, grant access by default when timeout occurs
        const devMode = isDevelopmentMode();
        if (devMode) {
          console.log("⚠️ Safety timeout - Development mode - Granting access by default");
          setHasAccess(true);
          setRoleChecked(true);
        } else {
          setHasAccess(false);
          setRoleChecked(true);
        }
        
        handleAccessNotification(devMode, devMode, 'timeout');
      }
    }, 5000); // 5 seconds timeout
    
    // Store timeout reference for cleanup
    setTimeout(safetyTimeout);

    const checkRole = async () => {
      try {
        // Check domain restriction first if specified
        if (emailDomain && user.email) {
          const domainMatch = checkEmailDomain(user.email, emailDomain);
          if (!domainMatch) {
            console.log(`Access denied: email ${user.email} is not from domain ${emailDomain}`);
            handleAccessNotification(false, false, 'domain', emailDomain);
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

          // If we've reached max attempts or no role is found
          if (!userRole || checkAttempts >= 2) {
            console.log("⚠️ No role found for user or max attempts reached:", checkAttempts);
            
            // For development purposes, grant access by default
            const devMode = isDevelopmentMode();
            if (devMode) {
              console.log("⚠️ Development mode detected - Granting access by default");
              setHasAccess(true);
              setRoleChecked(true);
              handleAccessNotification(true, true, 'norole');
            } else {
              setHasAccess(false);
              setRoleChecked(true);
              handleAccessNotification(false, false, 'norole');
            }
            setCheckingRole(false);
          } else {
            // If no role is found and this is not the last try, retry
            if (!userRole) {
              console.log("⚠️ No role found for user, retrying attempt:", checkAttempts + 1);
              setCheckAttempts(prev => prev + 1);
              return; // Don't set checkingRole to false yet
            }
            
            // User with a role that doesn't have the required permission
            setHasAccess(false);
            setRoleChecked(true);
            setCheckingRole(false);
            handleAccessNotification(false, false, 'role', undefined, userRole, requiredRole);
          }
        } else {
          // If only checking the domain and we reach here, the domain is correct
          setHasAccess(true);
          setCheckingRole(false);
          setRoleChecked(true);
        }
      } catch (error) {
        console.error("Error checking role:", error);
        
        // In case of error, in development mode, authorize access
        const devMode = isDevelopmentMode();
        if (devMode) {
          console.log("⚠️ Development mode detected - Granting access despite error");
          setHasAccess(true);
          setRoleChecked(true);
          toast.warning("Role verification error", { 
            description: "Access is granted by default in development mode despite the error",
            id: "role-error"
          });
        } else {
          setHasAccess(false);
          setRoleChecked(true);
        }
        
        setCheckingRole(false);
      }
    };

    checkRole();

    return () => {
      // Clear safety timeout on unmount
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [user, requiredRole, getUserRole, checkAttempts, roleChecked, emailDomain, timeout]);

  return {
    hasAccess,
    checkingRole,
    checkAttempts
  };
};
