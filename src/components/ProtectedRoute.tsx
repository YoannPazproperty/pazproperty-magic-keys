
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "manager" | "user";
  emailDomain?: string; // Ajout de la restriction par domaine d'email
}

const ProtectedRoute = ({ children, requiredRole, emailDomain }: ProtectedRouteProps) => {
  const { user, loading, getUserRole } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(!!requiredRole);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setCheckingRole(false);
      return;
    }

    if (!requiredRole && !emailDomain) {
      // Si aucun rôle ou domaine n'est requis, l'utilisateur authentifié a accès
      setHasAccess(true);
      setCheckingRole(false);
      return;
    }

    // Si on a déjà vérifié le rôle pour cet utilisateur et cette page, ne pas refaire la vérification
    if (roleChecked) {
      return;
    }

    const checkRole = async () => {
      try {
        // Vérifier d'abord la restriction par domaine d'email si elle est spécifiée
        if (emailDomain && user.email) {
          const userEmailDomain = user.email.split('@')[1];
          if (userEmailDomain !== emailDomain) {
            console.log(`Accès refusé: l'email ${user.email} n'appartient pas au domaine ${emailDomain}`);
            toast.error("Accès refusé", { 
              description: `Cet espace est réservé aux utilisateurs avec une adresse email @${emailDomain}`,
              id: "domain-restricted"
            });
            setHasAccess(false);
            setCheckingRole(false);
            setRoleChecked(true);
            return;
          }
        }

        // Ensuite vérifier le rôle si nécessaire
        if (requiredRole) {
          const userRole = await getUserRole();
          console.log("Rôle de l'utilisateur vérifié:", userRole);
          console.log("Rôle requis pour cette page:", requiredRole);
          
          // Si l'utilisateur est admin, il a accès à tout
          if (userRole === "admin") {
            setHasAccess(true);
            setCheckingRole(false);
            setRoleChecked(true);
            return;
          }
          
          // Si l'utilisateur est manager, il a accès aux pages manager et user
          if (userRole === "manager" && (requiredRole === "manager" || requiredRole === "user")) {
            setHasAccess(true);
            setCheckingRole(false);
            setRoleChecked(true);
            return;
          }
          
          // Si l'utilisateur est user, il n'a accès qu'aux pages user
          if (userRole === "user" && requiredRole === "user") {
            setHasAccess(true);
            setCheckingRole(false);
            setRoleChecked(true);
            return;
          }
          
          if (!userRole) {
            console.log("⚠️ Aucun rôle trouvé pour l'utilisateur, tentative:", checkAttempts + 1);
            
            // Si aucun rôle n'est trouvé et que c'est le premier essai, la table des rôles est peut-être vide
            if (checkAttempts < 3) {
              setCheckAttempts(prev => prev + 1);
              setTimeout(() => checkRole(), 1000); // Réessayer après 1 seconde
              return;
            }
            
            // Pour les besoins de développement, accorder l'accès par défaut
            if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('localhost')) {
              console.log("⚠️ Mode développement détecté - Accordons l'accès par défaut");
              setHasAccess(true);
              setRoleChecked(true);
              toast.warning("Aucun rôle défini", { 
                description: "L'accès est accordé par défaut en mode développement",
                id: "role-warning"
              });
            } else {
              setHasAccess(false);
              setRoleChecked(true);
              toast.error("Erreur d'autorisation", { 
                description: "Votre compte n'a pas de rôle assigné",
                id: "role-error"
              });
            }
          } else {
            // Utilisateur avec un rôle qui n'a pas la permission requise
            setHasAccess(false);
            setRoleChecked(true);
            toast.error("Accès refusé", { 
              description: `Vous avez le rôle "${userRole}" mais cette page requiert le rôle "${requiredRole}"`,
              id: "access-denied"
            });
          }
        } else {
          // Si on vérifie uniquement le domaine et qu'on arrive ici, c'est que le domaine est correct
          setHasAccess(true);
          setCheckingRole(false);
          setRoleChecked(true);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du rôle:", error);
        
        // En cas d'erreur, en mode développement, autoriser l'accès
        if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('localhost')) {
          console.log("⚠️ Mode développement détecté - Accordons l'accès malgré l'erreur");
          setHasAccess(true);
          setRoleChecked(true);
          toast.warning("Erreur de vérification des rôles", { 
            description: "L'accès est accordé par défaut en mode développement malgré l'erreur",
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
  }, [user, requiredRole, getUserRole, checkAttempts, roleChecked, emailDomain]);

  // Afficher un écran de chargement pendant la vérification
  if (loading || checkingRole) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-center text-gray-500">
            {checkingRole ? "Vérification des autorisations..." : "Chargement..."}
          </p>
        </div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    console.log("Utilisateur non connecté, redirection vers /auth");
    return <Navigate to="/auth" replace />;
  }

  // Rediriger vers une page d'accès refusé si l'utilisateur n'a pas le rôle requis ou le bon domaine d'email
  if (hasAccess === false) {
    console.log("Accès refusé pour l'utilisateur:", user.email);
    return <Navigate to="/access-denied" replace />;
  }

  // Afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;
