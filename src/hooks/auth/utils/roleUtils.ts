
import { UserRole } from "../types";

/**
 * Safely cast a UserRole to a database compatible role string
 * This is needed because sometimes the TypeScript types and database types can get out of sync
 * especially when new roles are added
 */
export const castRoleForDB = (role: UserRole): string => {
  // First check if it's one of the traditional roles that we know works
  const traditionalRoles = ['admin', 'employee', 'provider', 'customer', 'user', 'manager'];
  if (role === null || traditionalRoles.includes(role as string)) {
    return role as string;
  }
  
  // For newer roles like 'referral_partner', we need to ensure they're properly handled
  // by converting them to strings for the database operations
  return String(role);
};

/**
 * Safely check if a role is valid for database operations
 */
export const isValidDatabaseRole = (role: string): boolean => {
  // Update this list if the database enum changes
  const validRoles = ['admin', 'employee', 'provider', 'customer', 'user', 'manager', 'referral_partner'];
  return validRoles.includes(role);
};
