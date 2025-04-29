
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
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadata
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
        first_login: true // Mark that this is the user's first login
      }
    });

    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
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
    // First check for an existing prestadores_roles entry
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
