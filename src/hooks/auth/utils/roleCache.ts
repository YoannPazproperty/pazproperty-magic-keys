
import { UserRole } from "../types";

const ROLE_CACHE_KEY = 'user_role_cache';
const ROLE_CACHE_EXPIRY = 'user_role_cache_expiry';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes en millisecondes

/**
 * Stocke le rôle utilisateur en cache
 */
export const cacheUserRole = (role: UserRole): void => {
  try {
    if (role) {
      localStorage.setItem(ROLE_CACHE_KEY, String(role));
      localStorage.setItem(ROLE_CACHE_EXPIRY, String(Date.now() + CACHE_DURATION));
    } else {
      localStorage.removeItem(ROLE_CACHE_KEY);
      localStorage.removeItem(ROLE_CACHE_EXPIRY);
    }
  } catch (err) {
    console.error("Erreur lors de la mise en cache du rôle:", err);
  }
};

/**
 * Récupère le rôle utilisateur depuis le cache s'il est encore valide
 */
export const getCachedRole = (): UserRole | null => {
  try {
    const expiry = localStorage.getItem(ROLE_CACHE_EXPIRY);
    if (!expiry || Number(expiry) < Date.now()) {
      // Cache expiré ou inexistant
      localStorage.removeItem(ROLE_CACHE_KEY);
      localStorage.removeItem(ROLE_CACHE_EXPIRY);
      return null;
    }
    
    const role = localStorage.getItem(ROLE_CACHE_KEY);
    return role as UserRole;
  } catch (err) {
    console.error("Erreur lors de la récupération du rôle en cache:", err);
    return null;
  }
};

/**
 * Efface le rôle utilisateur du cache
 */
export const clearCachedRole = (): void => {
  try {
    localStorage.removeItem(ROLE_CACHE_KEY);
    localStorage.removeItem(ROLE_CACHE_EXPIRY);
  } catch (err) {
    console.error("Erreur lors de la suppression du cache de rôle:", err);
  }
};

// Alias pour clearCachedRole pour la rétrocompatibilité
export const clearRoleCache = clearCachedRole;

