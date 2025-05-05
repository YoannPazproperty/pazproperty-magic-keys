
import { Session, User } from "@supabase/supabase-js";

export type UserRole = "admin" | "manager" | "provider" | "prestadores_tecnicos" | "user" | null;

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    success: boolean;
  }>;
  signInWithGoogle: () => Promise<{
    error: any | null;
    success: boolean;
  }>;
  signOut: () => Promise<{
    error: any | null;
    success: boolean;
  }>;
  resetPassword: (email: string) => Promise<{
    error: any | null;
    success: boolean;
    message?: string;
  }>;
  getUserRole: () => Promise<UserRole>;
}
