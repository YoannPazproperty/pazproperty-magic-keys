import React, { createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useAuthState } from "./useAuthState";
import { useAuthMethods } from "./useAuthMethods";
import { useAuthEffects } from "./useAuthEffects";
import { UserRole } from "./types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  getUserRole: () => Promise<UserRole>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, session, loading, error, setUser, setSession, setLoading, setError, setUserRole } = useAuthState();
  const { signIn, signOut, getUserRole } = useAuthMethods({ setLoading, setUserRole, user });

  useAuthEffects({ setUser, setSession, setLoading, setError, setUserRole });

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signIn: async (email, password) => {
      const result = await signIn(email, password);
      return { user, error: result.error ? new Error(result.error) : null };
    },
    signOut,
    getUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};