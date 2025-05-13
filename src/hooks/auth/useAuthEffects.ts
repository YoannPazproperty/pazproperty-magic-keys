
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { UserRole } from "./types";

interface AuthEffectsProps {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setUserRole: (role: UserRole) => void;
}

export const useAuthEffects = ({
  setUser,
  setSession,
  setLoading,
  setError,
  setUserRole
}: AuthEffectsProps) => {
  // Authentication listener effect
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user || null);

        // Reset user role on signout
        if (event === 'SIGNED_OUT') {
          setUserRole(null);
        }
      }
    );

    // Check initial session on mount
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(session);
        setUser(session?.user || null);
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    // Call on mount
    checkSession();

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setLoading, setError, setUserRole]);
};
