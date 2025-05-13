
import { Session } from "@supabase/supabase-js";
import { UserRole } from "../types";

/**
 * Calcule le temps d'expiration du token à partir d'une session
 */
export const getTokenExpiryTime = (session: Session | null): number | null => {
  if (!session || !session.expires_at) return null;
  
  // Si expires_at est un timestamp en secondes (format Unix)
  return session.expires_at * 1000; // Convertir en millisecondes
};

/**
 * Gère la redirection en fonction du rôle utilisateur
 */
export const handleRedirectionByRole = (
  role: UserRole, 
  email: string | undefined, 
  navigate: (path: string) => void
): void => {
  // Si l'email se termine par @pazproperty.pt, toujours rediriger vers /admin
  if (email?.endsWith('@pazproperty.pt')) {
    navigate('/admin');
    return;
  }
  
  // Redirection basée sur le rôle
  switch (role) {
    case 'admin':
      navigate('/admin');
      break;
    case 'provider':
      navigate('/extranet-technique');
      break;
    case 'customer':
      navigate('/area-cliente');
      break;
    case 'referral_partner':
      navigate('/referral-portal');
      break;
    case 'user':
    default:
      navigate('/');
      break;
  }
};

/**
 * Vérifie si la session est sur le point d'expirer
 */
export const isSessionExpiringSoon = (expiresAt: number | null, warningThresholdMs = 5 * 60 * 1000): boolean => {
  if (!expiresAt) return false;
  
  const timeRemaining = expiresAt - Date.now();
  return timeRemaining > 0 && timeRemaining < warningThresholdMs;
};
