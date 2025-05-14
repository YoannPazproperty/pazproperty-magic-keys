import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';
import LoadingScreen from '@/components/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  emailDomain?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, emailDomain }) => {
  const { user, loading, getUserRole } = useAuth();
  const { hasAccess, checkingRole, checkAttempts } = usePermissionCheck(user, loading, requiredRole, emailDomain);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const userRole = await getUserRole();
      setRole(userRole);
    };
    fetchUserRole();
  }, [getUserRole]);

  // Loading state
  if (loading || checkingRole || !role) {
    return <LoadingScreen />;
  }

  // User not logged in
  if (!user) {
    console.log('User not logged in, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // User lacks required role or wrong email domain
  if (!hasAccess) {
    console.log('Access denied for user:', user.email);
    return <Navigate to="/access-denied" replace />;
  }

  // Access granted
  return <>{children}</>;
};

export default ProtectedRoute;