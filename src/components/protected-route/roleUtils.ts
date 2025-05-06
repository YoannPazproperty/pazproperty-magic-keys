
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

  // Special case: manager can access user pages
  if (userRole === "manager" && requiredRole === "user") return true;

  // Standard role matching
  return userRole === requiredRole;
};

/**
 * Handles displaying toast messages for access issues
 */
export const handleAccessNotification = (
  hasAccess: boolean, 
  isDevelopment: boolean, 
  reason: 'timeout' | 'domain' | 'role' | 'norole',
  emailDomain?: string,
  userRole?: UserRole, 
  requiredRole?: string
): void => {
  if (hasAccess) {
    if (isDevelopment && (reason === 'timeout' || reason === 'norole')) {
      toast.warning(reason === 'timeout' ? "Role verification timed out" : "No role defined", {
        description: "Access granted by default in development mode",
        id: reason === 'timeout' ? "role-timeout" : "role-warning"
      });
    }
    return;
  }

  // Handle access denied cases
  switch (reason) {
    case 'timeout':
      toast.error("Authorization timeout", {
        description: "Could not verify your permissions in time",
        id: "role-timeout-error"
      });
      break;
    case 'domain':
      toast.error("Access denied", {
        description: `This area is restricted to users with an email @${emailDomain}`,
        id: "domain-restricted"
      });
      break;
    case 'role':
      toast.error("Access denied", {
        description: `You have the role "${userRole}" but this page requires the role "${requiredRole}"`,
        id: "access-denied"
      });
      break;
    case 'norole':
      toast.error("Authorization error", {
        description: "Your account doesn't have an assigned role",
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
