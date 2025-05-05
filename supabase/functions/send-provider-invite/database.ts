
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

interface ProviderData {
  id: string;
  empresa: string;
  email: string;
  nome_gerente: string;
  telefone?: string;
  tipo_de_obras?: string;
}

/**
 * Gets provider data from the database
 */
export const getProviderData = async (supabase: SupabaseClient, providerId: string): Promise<ProviderData> => {
  try {
    const { data, error } = await supabase
      .from('prestadores_de_servicos')
      .select('id, empresa, email, nome_gerente, telefone, tipo_de_obras')
      .eq('id', providerId)
      .single();

    if (error) {
      console.error('Error getting provider data:', error);
      throw new Error(`Failed to retrieve provider: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }

    return data;
  } catch (error) {
    console.error('Exception getting provider data:', error);
    throw error;
  }
};

/**
 * Checks if a user with the given email exists
 */
export const getUserByEmail = async (supabase: SupabaseClient, email: string) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      filter: {
        email: email
      }
    });

    if (error) {
      console.error('Error checking user existence:', error);
      throw new Error(`Failed to check user: ${error.message}`);
    }

    return data.users.length > 0 ? data.users[0] : null;
  } catch (error) {
    console.error('Exception checking user:', error);
    throw error;
  }
};

/**
 * Updates user metadata
 */
export const updateUserMetadata = async (supabase: SupabaseClient, userId: string, metadata: Record<string, any>) => {
  try {
    // Make sure to preserve existing metadata and add specific provider metadata
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...metadata,
        is_provider: true, 
        password_reset_required: true,
        password_reset_at: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Error updating user metadata:', error);
      throw new Error(`Failed to update user metadata: ${error.message}`);
    }

    return data.user;
  } catch (error) {
    console.error('Exception updating user metadata:', error);
    throw error;
  }
};

/**
 * Creates a new user
 */
export const createUser = async (supabase: SupabaseClient, email: string, password: string, metadata: Record<string, any>) => {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        ...metadata,
        is_provider: true,
        first_login: true,
        password_reset_required: true,
        password_reset_at: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    // Create provider role for the user
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ 
        user_id: data.user.id, 
        role: 'provider'
      });

    if (roleError) {
      console.error('Error creating provider role:', roleError);
      // Don't fail if the role already exists
      if (roleError.code !== '23505') { // Error code for unique constraint violation
        throw new Error(`Failed to create provider role: ${roleError.message}`);
      }
    }

    return data.user;
  } catch (error) {
    console.error('Exception creating user:', error);
    throw error;
  }
};

/**
 * Ensures the user has the specified role
 */
export const ensureUserRole = async (supabase: SupabaseClient, userId: string, role: string) => {
  try {
    // First check for existing role in user_roles table
    const { data: existingRoleInUserRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('id, role')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (roleError) {
      console.error('Error checking user_roles:', roleError);
    }
    
    // If no role in user_roles, create it
    if (!existingRoleInUserRoles) {
      console.log(`Creating provider role in user_roles for user ${userId}`);
      const { error: insertRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'provider'
        });
        
      if (insertRoleError) {
        console.error('Error creating role in user_roles:', insertRoleError);
        if (insertRoleError.code !== '23505') { // Skip unique constraint errors
          throw new Error(`Failed to create role in user_roles: ${insertRoleError.message}`);
        }
      }
    }
    
    // Also check for an existing prestadores_roles entry
    const { data: existingRole, error: selectError } = await supabase
      .from('prestadores_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking existing provider role:', selectError);
    }

    if (existingRole) {
      // Update the existing role entry
      const { error: updateError } = await supabase
        .from('prestadores_roles')
        .update({ nivel: role })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating provider role:', updateError);
        throw new Error(`Failed to update provider role: ${updateError.message}`);
      }
    } else {
      // Create a new role entry
      const { error: insertError } = await supabase
        .from('prestadores_roles')
        .insert({
          user_id: userId,
          nivel: role
        });

      if (insertError) {
        console.error('Error assigning provider role:', insertError);
        throw new Error(`Failed to assign provider role: ${insertError.message}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Exception ensuring user role:', error);
    throw error;
  }
};
