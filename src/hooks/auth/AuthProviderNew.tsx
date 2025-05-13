
import React, { createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";

import { useAuthState } from "./useAuthState";
import { useAuthMethods } from "./useAuthMethods";
import { useAuthEffects } from "./useAuthEffects";
import { UserRole } from "./types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userWithMetadata: any | null;
  loading: boolean;
  error: Error | null;
  
  // Auth methods
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ user: User | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error: Error | null }>;
  getUserRole: () => Promise<UserRole>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication state
  const { 
    user, 
    session, 
    loading, 
    error, 
    setUser, 
    setSession, 
    setLoading, 
    setError,
    setUserRole
  } = useAuthState();
  
  // Pour la rétrocompatibilité, définir userWithMetadata
  const userWithMetadata = user ? { ...user, metadata: user.user_metadata } : null;
  
  // Authentication methods
  const { signIn, resetPassword, signOut, signInWithGoogle, getUserRole } = useAuthMethods({
    setLoading,
    setUserRole,
    user
  });
  
  // Mock functions for signUp and updatePassword that we'll implement later
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    return { user: null, error: null };
  };
  
  const updatePassword = async (newPassword: string) => {
    return { success: false, error: null };
  };
  
  // Authentication effect hooks
  useAuthEffects({
    setUser,
    setSession,
    setLoading,
    setError,
    setUserRole
  });
  
  // Context value to be provided
  const value: AuthContextType = {
    user,
    session,
    userWithMetadata,
    loading,
    error: error ? new Error(error.message) : null,
    signUp,
    signIn: async (email, password) => {
      const result = await signIn(email, password);
      return { user: user, error: result.error ? new Error(result.error) : null };
    },
    signOut,
    resetPassword: async (email) => {
      const result = await resetPassword(email);
      return { success: !!result.success, error: result.error ? new Error(result.error) : null };
    },
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
