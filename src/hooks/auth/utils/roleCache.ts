
import { UserRole } from "../types";

// Constants for role cache
const USER_ROLE_KEY = "paz_user_role";
const ROLE_CACHE_EXPIRY_KEY = "paz_role_cache_expiry";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Store the user role in local storage with expiry
 */
export const cacheUserRole = (role: UserRole): void => {
  try {
    if (!role) return;
    
    localStorage.setItem(USER_ROLE_KEY, role);
    localStorage.setItem(ROLE_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
  } catch (err) {
    // Silently fail if localStorage is unavailable
  }
};

/**
 * Get cached role from local storage, returns null if expired or not found
 */
export const getCachedRole = (): UserRole | null => {
  try {
    const expiryStr = localStorage.getItem(ROLE_CACHE_EXPIRY_KEY);
    if (!expiryStr) return null;
    
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) {
      // Clear expired cache
      clearRoleCache();
      return null;
    }
    
    return localStorage.getItem(USER_ROLE_KEY) as UserRole;
  } catch (err) {
    return null;
  }
};

/**
 * Clear the role cache from local storage
 */
export const clearRoleCache = (): void => {
  try {
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(ROLE_CACHE_EXPIRY_KEY);
  } catch (err) {
    // Silently fail if localStorage is unavailable
  }
};
