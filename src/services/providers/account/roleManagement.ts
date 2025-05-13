import { supabase } from "@/integrations/supabase/client";
import { adminClient } from "@/integrations/supabase/adminClient";
import { UserRole } from "@/hooks/auth/types";
import { toast } from "sonner";

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
export const validateRoleForEmail = (email: string, role: UserRole): boolean => {
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
 * Uses adminClient (service_role) to bypass RLS for role creation
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
    
    // Use adminClient (service_role) to bypass RLS for the following operations
    
    // For backward compatibility, if role is provider, also add to prestadores_roles
    if (role === 'provider') {
      const { error: prestadorRoleError } = await adminClient
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
    
    // Add to user_roles table using adminClient to bypass RLS
    const { error: roleError } = await adminClient
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
