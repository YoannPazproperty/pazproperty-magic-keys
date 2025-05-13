
import { useEffect, useState } from 'react';

interface PermissionResult {
  hasAccess: boolean;
  checkingRole: boolean;
  checkAttempts: number;
}

export const usePermissionCheck = (
  user: any,
  loading: boolean,
  requiredRole?: string | null,
  emailDomain?: string
): PermissionResult => {
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [checkAttempts, setCheckAttempts] = useState(0);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user || loading) {
        setCheckingRole(true);
        return;
      }

      const userRole = user?.role || null;
      const userEmail = user?.email || '';

      const roleOk = !requiredRole || userRole === requiredRole;
      const emailOk = !emailDomain || userEmail.endsWith(`@${emailDomain}`);

      setHasAccess(roleOk && emailOk);
      setCheckingRole(false);
    };

    checkPermissions();
    setCheckAttempts((prev) => prev + 1);
  }, [user, loading, requiredRole, emailDomain]);

  return { hasAccess, checkingRole, checkAttempts };
};
