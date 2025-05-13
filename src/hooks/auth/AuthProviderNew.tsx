
import React, { createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";

import { useAuthState } from "./useAuthState";
import { useAuthMethods } from "./useAuthMethods";
import { useAuthEffects } from "./useAuthEffects";
import { UserRole, UserWithMetadata } from "./types";
import { fetchUserRole } from "./roleService";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userWithMetadata: UserWithMetadata | null;
  loading: boolean;
  error: Error | null;
  
  // Auth methods
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ user: User | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error: Error | null }>;
  getUserRole: (userId: string) => Promise<UserRole | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication state
  const { user, session, userWithMetadata, loading, error, setUser, setSession, setUserWithMetadata, setLoading, setError } = useAuthState();
  
  // Authentication methods
  const { signUp, signIn, signOut, resetPassword, updatePassword } = useAuthMethods({
    setUser,
    setSession,
    setUserWithMetadata,
    setLoading,
    setError
  });
  
  // Get user role function
  const getUserRole = async (userId: string): Promise<UserRole | null> => {
    return await fetchUserRole(userId);
  };
  
  // Authentication effect hooks
  useAuthEffects({
    setUser,
    setSession,
    setUserWithMetadata,
    setLoading,
    setError
  });
  
  // Context value to be provided
  const value = {
    user,
    session,
    userWithMetadata,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    getUserRole
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
