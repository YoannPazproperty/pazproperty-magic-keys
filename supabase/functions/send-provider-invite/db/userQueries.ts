
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

/**
 * Checks if a user with the given email exists
 */
export const getUserByEmail = async (supabase: SupabaseClient, email: string) => {
  try {
    console.log(`Checking if user with email ${email} exists in auth.users`);
    const { data, error } = await supabase.auth.admin.listUsers({
      filter: {
        email: email
      }
    });

    if (error) {
      console.error('Error checking user existence:', error);
      throw new Error(`Failed to check user: ${error.message}`);
    }

    if (data.users.length > 0) {
      console.log(`User found in auth.users with ID: ${data.users[0].id}`);
      return data.users[0];
    } else {
      console.log(`No user found in auth.users with email: ${email}`);
      return null;
    }
  } catch (error) {
    console.error('Exception checking user:', error);
    throw error;
  }
};
