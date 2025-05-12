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
 * Checks if a user has a specific role
 * @param userId The user ID to check
 * @param role The role to check for
 * @returns Boolean indicating if the user has the role
 */
export const checkUserHasRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception checking user role:', error);
    return false;
  }
};

/**
 * Validates if the requested role is appropriate for the email domain
 * Company emails (@pazproperty.pt) can be admin or user
 * Other emails can only be provider or customer
 */
const validateRoleForEmail = (email: string, role: UserRole): boolean => {
  const isCompanyEmail = email.toLowerCase().endsWith('@pazproperty.pt');
  
  // Company emails can only be admin or user
  if (isCompanyEmail) {
    return role === 'admin' || role === 'user';
  }
  
  // Other emails can only be provider or customer
  return role === 'provider' || role === 'customer';
};

/**
 * Creates a user role in the user_roles table
 * Requires appropriate permissions based on context
 */
export const createUserRole = async (
  userId: string, 
  role: UserRole, 
  skipPermissionCheck: boolean = false
): Promise<boolean> => {
  try {
    // If not skipping permission check, verify that the current user has admin role
    if (!skipPermissionCheck) {
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
    }

    // Check if the user already has this role
    const hasRole = await checkUserHasRole(userId, role);
    if (hasRole) {
      // User already has this role, no need to add it again
      return true;
    }
    
    // For backward compatibility, if role is provider, also add to prestadores_roles
    if (role === 'provider') {
      const { error: prestadorRoleError } = await supabase
        .from('prestadores_roles')
        .insert({ 
          user_id: userId, 
          nivel: 'standard' 
        });

      if (prestadorRoleError) {
        // Don't fail if the role already exists due to a unique constraint error
        if (prestadorRoleError.code !== '23505') {
          throw new Error(`Erreur lors de la création du rôle prestataire: ${prestadorRoleError.message}`);
        }
      }
    }
    
    // Add to user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role
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
 * and assigns the appropriate role based on context
 */
export const createAuthUser = async (
  email: string, 
  password: string, 
  metadata: Record<string, any>,
  role: UserRole
) => {
  try {
    // Validate that the requested role is appropriate for the email
    if (!validateRoleForEmail(email, role)) {
      return { 
        error: {
          message: `Le rôle ${role} n'est pas autorisé pour cette adresse email (${email})`
        }
      };
    }
    
    // First check if the user already exists
    const userExists = await checkUserExists(email);
    
    if (userExists) {
      return { 
        error: {
          message: `Un utilisateur avec cette adresse email (${email}) existe déjà`
        }
      };
    }
    
    // Call the edge function to create the user
    const { data, error } = await supabase.functions.invoke("create-provider-user", {
      body: {
        email,
        password,
        metadata: {
          ...metadata,
          role: role,
          password_reset_required: true,
          first_login: true
        }
      }
    });
    
    if (error) {
      console.error("Error from create-provider-user function:", error);
      return { error };
    }
    
    if (data?.user?.id) {
      // Assign the appropriate role to the newly created user
      await createUserRole(data.user.id, role, true);
    }
    
    return { data };
  } catch (error) {
    console.error("Exception creating auth user:", error);
    return { error };
  }
};

/**
 * Ensures a user has the appropriate role, creating the user if they don't exist
 * @param email User email 
 * @param password Password (only used if a new user is created)
 * @param metadata User metadata
 * @param role Role to assign
 * @returns Result object with success or error
 */
export const ensureUserWithRole = async (
  email: string,
  password: string,
  metadata: Record<string, any>,
  role: UserRole
): Promise<{ success: boolean; message?: string; userId?: string }> => {
  try {
    // Validate that the requested role is appropriate for the email
    if (!validateRoleForEmail(email, role)) {
      return { 
        success: false,
        message: `Le rôle ${role} n'est pas autorisé pour cette adresse email (${email})`
      };
    }

    // First check if the user exists
    const { data: userList } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (userList?.id) {
      // User exists, add the role if they don't have it
      const hasRole = await checkUserHasRole(userList.id, role);
      
      if (!hasRole) {
        const roleCreated = await createUserRole(userList.id, role, true);
        
        if (!roleCreated) {
          return {
            success: false,
            message: `Échec de l'attribution du rôle ${role} à l'utilisateur existant`
          };
        }
      }
      
      return {
        success: true,
        message: `L'utilisateur dispose maintenant du rôle ${role}`,
        userId: userList.id
      };
    } else {
      // User doesn't exist, create them
      const { data, error } = await createAuthUser(email, password, metadata, role);
      
      if (error) {
        return {
          success: false,
          message: error.message || "Échec de la création de l'utilisateur"
        };
      }
      
      return {
        success: true,
        message: "Utilisateur créé avec succès",
        userId: data?.user?.id
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return {
      success: false,
      message: `Exception lors de l'attribution du rôle: ${errorMessage}`
    };
  }
};
