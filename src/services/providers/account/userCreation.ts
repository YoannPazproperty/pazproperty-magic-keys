
import { supabase } from "@/integrations/supabase/client";
import { adminClient } from "@/integrations/supabase/adminClient";
import { UserRole } from "@/hooks/auth/types";
import { validateRoleForEmail } from "./roleManagement";
import { checkUserExists } from "./userVerification";

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
    
    return { data };
  } catch (error) {
    console.error("Exception creating auth user:", error);
    return { error };
  }
};
