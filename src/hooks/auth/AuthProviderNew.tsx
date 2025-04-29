
import { createContext, useContext } from "react";
import { AuthContextType } from "./types";
import { useAuthState } from "./useAuthState";
import { useAuthEffects } from "./useAuthEffects";
import { useAuthMethods } from "./useAuthMethods";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    userRole,
    setUserRole,
  } = useAuthState();

  useAuthEffects({
    setUser,
    setSession,
    setLoading,
    setUserRole,
  });

  const {
    signIn,
    resetPassword,
    signOut,
    signInWithGoogle,
    getUserRole,
  } = useAuthMethods({
    setLoading,
    setUserRole,
    user,
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        getUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Create and export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
