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
    // Increased from 15 seconds to 45 seconds to give more time for role verification
    const safetyTimeout = window.setTimeout(() => {
      console.log("Safety timeout triggered after 45 seconds");
      if (checkingRole) {
        setCheckingRole(false);
        
        // In development mode, grant access by default when timeout occurs
        const devMode = isDevelopmentMode();
        if (devMode) {
          console.log("⚠️ Safety timeout - Development mode - Granting access by default");
          setHasAccess(true);
          setRoleChecked(true);
        } else {
          // For production, we'll be more permissive when timing out
          // If it's @pazproperty.pt email, grant access on timeout
          const isCompanyEmail = user.email?.endsWith('@pazproperty.pt') || false;
          
          if (isCompanyEmail && requiredRole === 'admin') {
            console.log("⚠️ Safety timeout - Company email detected - Granting admin access");
            setHasAccess(true);
          } else {
            // Otherwise deny access
            setHasAccess(false);
          }
          setRoleChecked(true);
        }
        
        handleAccessNotification(devMode, devMode, 'timeout');
      }
    }, 45000); // Changed from 15000 to 45000 (45 seconds timeout)
    
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

          // If we've reached max attempts or no role is found
          if (!userRole || checkAttempts >= 3) { // Increased max attempts from 2 to 3
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
              handleAccessNotification(true, true, 'norole');
            } else {
              setHasAccess(false);
              setRoleChecked(true);
              handleAccessNotification(false, false, 'norole');
            }
            setCheckingRole(false);
          } else {
            // If no role is found and this is not the last try, retry with exponential backoff
            if (!userRole) {
              const nextAttempt = checkAttempts + 1;
              console.log(`⚠️ No role found for user, retrying attempt ${nextAttempt} in ${nextAttempt * 2} seconds`);
              
              // Use exponential backoff for retries
              setTimeout(() => {
                setCheckAttempts(nextAttempt);
              }, nextAttempt * 2000); // Wait longer between attempts
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
        
        // In case of error, check if user has company email for admin access
        const devMode = isDevelopmentMode();
        const isCompanyEmail = user.email?.endsWith('@pazproperty.pt') || false;
        
        if (devMode || (isCompanyEmail && requiredRole === 'admin')) {
          console.log(devMode 
            ? "⚠️ Development mode detected - Granting access despite error"
            : "⚠️ Company email detected - Granting admin access despite error");
          setHasAccess(true);
          setRoleChecked(true);
          toast.warning("Role verification error", { 
            description: "Access is granted by default despite the error",
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
