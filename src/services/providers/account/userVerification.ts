
import { supabase } from "@/integrations/supabase/client";
import { adminClient } from "@/integrations/supabase/adminClient";

/**
 * Checks if a user with the given email exists in Supabase Auth
 * Uses a direct query on the users table
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false; // utilisateur non trouvé
      }
      throw error; // autre erreur
    }

    return !!data; // utilisateur trouvé
  } catch (error) {
    console.error("Exception checking if user exists:", error);
    return false; // Assume no user exists if there's an exception
  }
};
