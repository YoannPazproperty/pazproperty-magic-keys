
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';

/**
 * Checks if a user with the given email exists in Supabase Auth
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("Error checking if user exists:", error);
      return false; // Assume no user exists if there's an error
    }
    
    // Find the user by email in the list
    return data && data.users && data.users.some((user: User) => user.email === email);
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
        // We'll use "manager" role since "provider" isn't a valid enum value in the current schema
        // This works for now as a temporary solution, but we should update the schema later
        role: 'manager'
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
 * Creates a user in Supabase Auth
 */
export const createAuthUser = async (
  email: string, 
  password: string, 
  metadata: Record<string, any>
) => {
  return supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: metadata
  });
};
