import { supabase } from "@/integrations/supabase/client";

/**
 * Handles user sign-in using email and password.
 * @param email User's email.
 * @param password User's password.
 */
export const signInWithPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    data,
    error,
    success: !error,
  };
};

/**
 * Initiates password reset by sending an email.
 * @param email User's email.
 */
export const resetUserPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  return {
    success: !error,
    error,
  };
};

/**
 * Signs out the current user.
 */
export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();

  return {
    success: !error,
    error,
  };
};

/**
 * Signs in using Google as an OAuth provider.
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return {
    data,
    error,
    success: !error,
  };
};