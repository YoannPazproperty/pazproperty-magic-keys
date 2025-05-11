
import { Session } from "@supabase/supabase-js";
import { UserRole } from "../types";

/**
 * Extract token expiration information from session
 */
export const getTokenExpiryTime = (session: Session | null): number | null => {
  if (!session?.expires_at) return null;
  return session.expires_at * 1000; // Convert to milliseconds
};

/**
 * Handle redirection based on user role and email
 */
export const handleRedirectionByRole = (
  role: UserRole, 
  email: string | null | undefined,
  navigate: (path: string) => void
): void => {
  // If email is @pazproperty.pt, always redirect to admin
  if (email?.endsWith('@pazproperty.pt')) {
    navigate("/admin");
    return;
  }

  // Otherwise check role for redirection
  if (role === 'provider') {
    navigate("/extranet-technique");
  } else {
    // Use dynamic import to avoid circular dependencies
    import('../roleService').then(({ resolveRedirectPathByRole }) => {
      const redirectPath = resolveRedirectPathByRole(role, email);
      navigate(redirectPath);
    });
  }
};
