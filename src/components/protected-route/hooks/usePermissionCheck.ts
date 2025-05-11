
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/hooks/auth/types";
import { usePermissionChecker } from "./usePermissionChecker";
import { useSafetyTimeout } from "./useSafetyTimeout";

interface PermissionCheckProps {
  user: any;
  getUserRole: () => Promise<UserRole>;
  requiredRole?: Exclude<UserRole, null>;
  emailDomain?: string;
}

export const usePermissionCheck = ({
  user,
  getUserRole,
  requiredRole,
  emailDomain
}: PermissionCheckProps) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(!!requiredRole);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [roleChecked, setRoleChecked] = useState(false);

  // Setup safety timeout
  const { timeoutId } = useSafetyTimeout({
    checkingRole,
    user,
    requiredRole,
    setCheckingRole,
    setHasAccess,
    setRoleChecked
  });

  // Use the permission checker logic
  useEffect(() => {
    // Early return cases
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

    // Use the permission checker hook to handle the role checking logic
    const permissionChecker = usePermissionChecker({
      user,
      getUserRole,
      requiredRole,
      emailDomain,
      checkAttempts,
      setCheckAttempts,
      setHasAccess,
      setCheckingRole,
      setRoleChecked
    });

    permissionChecker.checkPermissions();

    return () => {
      // Clear safety timeout on unmount
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, requiredRole, getUserRole, checkAttempts, roleChecked, emailDomain, timeoutId]);

  return {
    hasAccess,
    checkingRole,
    checkAttempts
  };
};
