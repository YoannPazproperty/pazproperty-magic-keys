
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { UserRole } from "@/hooks/auth/types";

/**
 * Checks if a user with the given email exists in Supabase Auth
 * Uses public API instead of admin API to avoid permission issues
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    console.log("Checking if user exists:", email);
    
    // Use signIn with throwOnError: false to check if user exists
    // This is a workaround since we don't have admin API access
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false  // Don't create the user, just check if it exists
      }
    });
    
    if (error) {
      // If error code is 400, the user might not exist
      if (error.status === 400 && error.message.includes("Email not confirmed")) {
        console.log("User exists but email not confirmed");
        return true;
      }
      
      if (error.status === 400 && error.message.includes("Email link invalid")) {
        console.log("User might not exist");
        return false;
      }
      
      console.error("Error checking if user exists:", error);
      return false;
    }
    
    return true; // If no error, the user exists
  } catch (error) {
    console.error("Exception checking if user exists:", error);
    return false; // Assume no user exists if there's an exception
  }
};

/**
 * Creates a user role in the user_roles table
 */
export const createUserRole = async (userId: string): Promise<boolean> => {
  try {
    // First add to prestadores_roles table (this is for backward compatibility)
    const { error: prestadorRoleError } = await supabase
      .from('prestadores_roles')
      .insert({ 
        user_id: userId, 
        nivel: 'standard' 
      });

    if (prestadorRoleError) {
      console.error('Error creating prestadores_roles entry:', prestadorRoleError);
      // Don't fail if the role already exists or there's an error
      console.warn('Continuing despite prestadores_roles creation error');
    }
    
    // Then add to user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'provider'
      });

    if (roleError) {
      console.error('Error creating user role:', roleError);
      // Don't fail if the role already exists or there's an error
      console.warn('Continuing despite role creation error');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception creating user role:', error);
    return false;
  }
};

/**
 * Creates a user in Supabase Auth using the edge function
 * instead of direct admin API which requires special permissions
 */
export const createAuthUser = async (
  email: string, 
  password: string, 
  metadata: Record<string, any>
) => {
  try {
    console.log(`Creating user via edge function for ${email}`);
    
    // Call the edge function to create the user instead of using admin API directly
    const { data, error } = await supabase.functions.invoke("create-provider-user", {
      body: {
        email,
        password,
        metadata: {
          ...metadata,
          is_provider: true,
          password_reset_required: true,
          first_login: true
        }
      }
    });
    
    if (error) {
      console.error("Error from create-provider-user function:", error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error("Exception creating auth user:", error);
    return { error };
  }
};
