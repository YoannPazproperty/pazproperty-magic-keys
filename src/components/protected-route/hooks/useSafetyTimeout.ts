import { useState, useEffect } from "react";
import { UserRole } from "@/hooks/auth/types";
import { handleAccessNotification, isDevelopmentMode } from "../roleUtils";

interface SafetyTimeoutProps {
  checkingRole: boolean;
  user: any;
  requiredRole?: Exclude<UserRole, null>;
  setCheckingRole: (checking: boolean) => void;
  setHasAccess: (hasAccess: boolean | null) => void;
  setRoleChecked: (checked: boolean) => void;
}

export const useSafetyTimeout = ({
  checkingRole,
  user,
  requiredRole,
  setCheckingRole,
  setHasAccess,
  setRoleChecked
}: SafetyTimeoutProps) => {
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  useEffect(() => {
    if (!checkingRole) return;

    // Add a safety timeout to avoid infinite checking
    // 45 seconds to give more time for role verification
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
          const isCompanyEmail = user?.email?.endsWith('@pazproperty.pt') || false;
          
          if (isCompanyEmail && requiredRole === 'admin') {
            console.log("⚠️ Safety timeout - Company email detected - Granting admin access");
            setHasAccess(true);
          } else {
            // Otherwise deny access
            setHasAccess(false);
          }
          setRoleChecked(true);
        }
        
        handleAccessNotification({
          hasAccess: devMode,
          isDevelopment: devMode,
          reason: 'timeout'
        });
      }
    }, 45000); // 45 seconds timeout
    
    // Store timeout reference for cleanup
    setTimeoutId(safetyTimeout);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [checkingRole, user, requiredRole]);

  return { timeoutId };
};
