
import { useAuth as useAuthHook } from "./auth";

// This file is now just a re-export to maintain backward compatibility
// while we transition to the new auth implementation
export const useAuth = useAuthHook;

// Re-export the AuthProvider as well for backward compatibility
export { AuthProvider } from "./auth";
