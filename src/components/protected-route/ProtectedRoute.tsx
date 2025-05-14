
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';
import LoadingScreen from '@/components/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | null;
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

  // Show loading screen while verifying user role
  if (loading || checkingRole || !role) {
    return <LoadingScreen />;
  }

  // Redirect if user not logged in
  if (!user) {
    console.log('User not logged in, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Redirect if user lacks required role or wrong email domain
  if (!hasAccess) {
    console.log('Access denied for user:', user.email);
    return <Navigate to="/access-denied" replace />;
  }

  // All checks passed, display protected content
  return <>{children}</>;
};

export default ProtectedRoute;
