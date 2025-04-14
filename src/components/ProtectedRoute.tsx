
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode, useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "manager" | "user";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, getUserRole } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(!!requiredRole);

  useEffect(() => {
    if (!user || !requiredRole) {
      setHasAccess(!!user);
      setCheckingRole(false);
      return;
    }

    const checkRole = async () => {
      const userRole = await getUserRole();
      
      // Si l'utilisateur est admin, il a accès à tout
      if (userRole === "admin") {
        setHasAccess(true);
        setCheckingRole(false);
        return;
      }
      
      // Si l'utilisateur est manager, il a accès aux pages manager et user
      if (userRole === "manager" && (requiredRole === "manager" || requiredRole === "user")) {
        setHasAccess(true);
        setCheckingRole(false);
        return;
      }
      
      // Si l'utilisateur est user, il n'a accès qu'aux pages user
      if (userRole === "user" && requiredRole === "user") {
        setHasAccess(true);
        setCheckingRole(false);
        return;
      }
      
      setHasAccess(false);
      setCheckingRole(false);
    };

    checkRole();
  }, [user, requiredRole, getUserRole]);

  // Afficher un écran de chargement pendant la vérification
  if (loading || checkingRole) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-center text-gray-500">
            Vérification des autorisations...
          </p>
        </div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Rediriger vers une page d'accès refusé si l'utilisateur n'a pas le rôle requis
  if (requiredRole && hasAccess === false) {
    return <Navigate to="/access-denied" replace />;
  }

  // Afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;
