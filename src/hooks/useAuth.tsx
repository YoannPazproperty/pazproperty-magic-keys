
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { UserRole } from './auth/types';
import { fetchUserRole } from './auth/roleService';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null; success: boolean }>;
  signOut: () => Promise<{ error: any | null; success: boolean }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null; success: boolean }>;
  resetPassword: (email: string) => Promise<{ error: any | null; success: boolean }>;
  getUserRole: () => Promise<UserRole>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      setLoading(false);
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      return {
        error,
        success: !error
      };
    } catch (err) {
      return {
        error: err,
        success: false
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return {
        error,
        success: !error
      };
    } catch (err) {
      return {
        error: err,
        success: false
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return {
        error,
        success: !error
      };
    } catch (err) {
      return {
        error: err,
        success: false
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return {
        error,
        success: !error
      };
    } catch (err) {
      return {
        error: err,
        success: false
      };
    }
  };

  const getUserRole = useCallback(async (): Promise<UserRole> => {
    if (!user) return null;

    try {
      return await fetchUserRole(user.id);
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      getUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
