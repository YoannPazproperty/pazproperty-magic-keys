import { useEffect, useState } from 'react';
import { useAuth } from './auth';

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
  const { getUserRole } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [checkAttempts, setCheckAttempts] = useState(0);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user || loading) {
        setCheckingRole(true);
        return;
      }

      const userRole = await getUserRole();
      const userEmail = user?.email || '';

      const roleOk = !requiredRole || userRole === requiredRole;
      const emailOk = !emailDomain || userEmail.endsWith(`@${emailDomain}`);

      console.log("Permission Check → userRole:", userRole, "| Required:", requiredRole, "| Role OK:", roleOk, "| Email OK:", emailOk);

      setHasAccess(roleOk && emailOk);
      setCheckingRole(false);
    };

    checkPermissions();
    setCheckAttempts((prev) => prev + 1);
  }, [user, loading, requiredRole, emailDomain, getUserRole]);

  return { hasAccess, checkingRole, checkAttempts };
};
