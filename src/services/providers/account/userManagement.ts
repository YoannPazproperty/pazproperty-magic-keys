
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { UserRole } from "@/hooks/auth/types";
import { toast } from "sonner";

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

/**
 * Creates a user role in the user_roles table
 * Requires admin privileges
 */
export const createUserRole = async (userId: string): Promise<boolean> => {
  try {
    // Verify that the current user has admin role
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error("Vous devez être connecté pour créer un rôle utilisateur");
    }
    
    const { data: currentUserRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.user.id)
      .single();

    if (currentUserRole?.role !== 'admin') {
      throw new Error("Seuls les admins peuvent créer des rôles utilisateur");
    }
    
    // First add to prestadores_roles table (this is for backward compatibility)
    const { error: prestadorRoleError } = await supabase
      .from('prestadores_roles')
      .insert({ 
        user_id: userId, 
        nivel: 'standard' 
      });

    if (prestadorRoleError) {
      // Don't fail if the role already exists or there's a unique constraint error
      if (prestadorRoleError.code !== '23505') {
        throw new Error(`Erreur lors de la création du rôle prestataire: ${prestadorRoleError.message}`);
      }
    }
    
    // Then add to user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'provider' as UserRole
      });

    if (roleError) {
      // Don't fail if the role already exists due to a unique constraint error
      if (roleError.code !== '23505') {
        throw new Error(`Erreur lors de la création du rôle utilisateur: ${roleError.message}`);
      }
    }
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    toast.error("Erreur de création du rôle", { description: errorMessage });
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
