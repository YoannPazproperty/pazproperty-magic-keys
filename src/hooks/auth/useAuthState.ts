
import { useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { UserWithMetadata, UserRole } from "./types";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userWithMetadata, setUserWithMetadata] = useState<UserWithMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);

  return {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    userRole,
    setUserRole,
    tokenExpiresAt,
    setTokenExpiresAt,
    userWithMetadata,
    setUserWithMetadata,
    error,
    setError
  };
};
