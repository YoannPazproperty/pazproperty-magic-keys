import { useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { UserRole } from "./types";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  return {
    user,
    session,
    loading,
    error,
    userRole,
    setUser,
    setSession,
    setLoading,
    setError,
    setUserRole,
  };
};