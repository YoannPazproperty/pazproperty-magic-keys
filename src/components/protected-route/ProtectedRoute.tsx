
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import LoadingScreen from "@/components/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  emailDomain?: string;
}

const ProtectedRoute = ({ children, requiredRole, emailDomain }: ProtectedRouteProps) => {
  const { user, loading, getUserRole } = useAuth();
  const { hasAccess, checkingRole } = usePermissionCheck(user, loading, requiredRole, emailDomain);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const userRole = await getUserRole();
      setRole(userRole);
    };
    fetchRole();
  }, [getUserRole]);

  if (loading || checkingRole || !role) {
    return <LoadingScreen checkingRole={checkingRole} />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
