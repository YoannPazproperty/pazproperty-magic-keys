import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { usePermissionCheck } from '@/hooks';
import LoadingScreen from '@/components/LoadingScreen';
import { UserRole } from '@/hooks/auth/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  emailDomain?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  emailDomain,
}) => {
  const { user, loading, getUserRole } = useAuth();
  const { hasAccess, checkingRole, checkAttempts } = usePermissionCheck(
    user,
    loading,
    requiredRole,
    emailDomain
  );

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const userRole = await getUserRole();
      setRole(userRole);
    };
    fetchUserRole();
  }, [getUserRole]);

  // Show a loading screen during verification
  if (loading || checkingRole || !role) {
    return <LoadingScreen checkingRole={checkingRole} checkAttempts={checkAttempts} />;
  }

  // Redirect to login page if user is not logged in
  if (!user) {
    console.log('User not logged in, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Redirect to access denied page if user doesn't have the required role or email domain
  if (!hasAccess) {
    console.log('Access denied for user:', user.email);
    return <Navigate to="/access-denied" replace />;
  }

  // Display the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
