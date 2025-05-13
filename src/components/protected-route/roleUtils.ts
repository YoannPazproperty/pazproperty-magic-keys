
import { toast } from "sonner";
import { UserRole } from "@/hooks/auth/types";

/**
 * Checks if a user's email domain matches the required domain
 */
export const checkEmailDomain = (
  userEmail: string | undefined | null,
  emailDomain: string | undefined
): boolean => {
  if (!emailDomain || !userEmail) return true;
  
  const userEmailDomain = userEmail.split('@')[1];
  return userEmailDomain === emailDomain;
};

/**
 * Check if user has the required role for access
 */
export const hasRequiredRole = (userRole: UserRole, requiredRole?: string): boolean => {
  // If no role is required, access is granted
  if (!requiredRole) return true;

  // If user is admin, they have access to everything
  if (userRole === "admin") return true;

  // Special case: employee can access user and customer pages
  if (userRole === "employee" && (requiredRole === "user" || requiredRole === "customer")) return true;

  // Standard role matching
  return userRole === requiredRole;
};

/**
 * Interface defining parameters for access notification
 * Fixed: Added missing userEmail field to ensure compatibility
 */
interface AccessNotificationParams {
  hasAccess: boolean;
  isDevelopment: boolean;
  reason: 'timeout' | 'domain' | 'role' | 'norole';
  emailDomain?: string;
  userRole?: UserRole;
  requiredRole?: string;
  userEmail?: string; // Added missing field
}

/**
 * Handles displaying toast messages for access issues
 */
export const handleAccessNotification = (
  params: AccessNotificationParams
): void => {
  const { hasAccess, isDevelopment, reason, emailDomain, userRole, requiredRole, userEmail } = params;
  
  if (hasAccess) {
    if (isDevelopment && (reason === 'timeout' || reason === 'norole')) {
      toast.warning(reason === 'timeout' ? "Vérification du rôle expirée" : "Aucun rôle défini", {
        description: "Accès accordé par défaut en mode développement",
        id: reason === 'timeout' ? "role-timeout" : "role-warning"
      });
    }
    return;
  }

  // Handle access denied cases
  switch (reason) {
    case 'timeout':
      toast.error("Délai d'autorisation dépassé", {
        description: "Impossible de vérifier vos autorisations dans le temps imparti",
        id: "role-timeout-error"
      });
      break;
    case 'domain':
      toast.error("Accès refusé", {
        description: `Cette zone est réservée aux utilisateurs avec un email @${emailDomain}`,
        id: "domain-restricted"
      });
      break;
    case 'role':
      toast.error("Accès refusé", {
        description: `Vous avez le rôle "${userRole}" mais cette page nécessite le rôle "${requiredRole}"`,
        id: "access-denied"
      });
      break;
    case 'norole':
      toast.error("Erreur d'autorisation", {
        description: "Votre compte n'a pas de rôle assigné",
        id: "role-error"
      });
      break;
  }
};

/**
 * Checks if the current environment is development mode
 */
export const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development' || window.location.hostname.includes('localhost');
};
