
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "./types";
import { getInitialSession } from "./utils/initialSession";
import { handleAuthStateChange } from "./utils/authStateHandlers";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole;
  tokenExpiresAt: number | null;
  signOut: () => Promise<void>;
  getUserRole: () => Promise<UserRole>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const navigate = useNavigate();

  // Initialiser la session
  useEffect(() => {
    getInitialSession(setLoading, setUser, setSession, setUserRole, setTokenExpiresAt);
  }, []);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event);
      if (session) {
        setUser(session.user);
        setSession(session);
        handleAuthStateChange(event, session.user.id, session.user.email, setUserRole, navigate);
      } else {
        setUser(null);
        setSession(null);
        setUserRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Méthode de déconnexion
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Méthode pour récupérer le rôle d'utilisateur - ajoutons cette fonction pour résoudre l'erreur
  const getUserRole = async (): Promise<UserRole> => {
    // Si nous avons déjà un rôle, nous le retournons
    if (userRole) return userRole;

    // Sinon, nous essayons de le récupérer via roleService
    if (user?.id) {
      try {
        // Importer de manière dynamique pour éviter les dépendances circulaires
        const { fetchUserRole } = await import('./roleService');
        const role = await fetchUserRole(user.id);
        setUserRole(role);
        return role;
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    }
    
    return null;
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    tokenExpiresAt,
    signOut,
    getUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
