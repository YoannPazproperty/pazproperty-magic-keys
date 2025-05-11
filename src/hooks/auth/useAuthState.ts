
import { useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { UserRole } from "./types";

/**
 * Custom hook for managing authentication state
 */
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [roleLoading, setRoleLoading] = useState(false);
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
    roleLoading,
    setRoleLoading,
    tokenExpiresAt,
    setTokenExpiresAt,
  };
};
