
import { adminClient } from "@/integrations/supabase/adminClient";
import { UserRole } from "@/hooks/auth/types";
import { checkUserHasRole, createUserRole } from "./roleManagement";
import { createAuthUser } from "./userCreation";

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
    if (!role) {
      return { 
        success: false,
        message: `Un rôle doit être spécifié`
      };
    }

    // First check if the user exists - use adminClient to ensure we can access user data
    const { data: existingUser } = await adminClient
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (existingUser?.id) {
      // User exists, add the role if they don't have it
      console.log(`Utilisateur existant trouvé avec l'ID: ${existingUser.id}`);
      const hasRole = await checkUserHasRole(existingUser.id, role);
      
      if (!hasRole) {
        console.log(`Attribution du rôle ${role} à l'utilisateur existant`);
        const roleCreated = await createUserRole(existingUser.id, role, true);
        
        if (!roleCreated) {
          return {
            success: false,
            message: `Échec de l'attribution du rôle ${role} à l'utilisateur existant`
          };
        }
      } else {
        console.log(`L'utilisateur a déjà le rôle ${role}`);
      }
      
      return {
        success: true,
        message: `L'utilisateur dispose maintenant du rôle ${role}`,
        userId: existingUser.id
      };
    } else {
      // User doesn't exist, create them
      console.log(`Aucun utilisateur existant trouvé pour ${email}, création d'un nouveau compte`);
      const { data, error } = await createAuthUser(email, password, metadata, role);
      
      if (error) {
        return {
          success: false,
          message: error.message || "Échec de la création de l'utilisateur"
        };
      }
      
      // If user was created successfully, ensure they have the role
      if (data?.user?.id) {
        await createUserRole(data.user.id, role, true);
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
