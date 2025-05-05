
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

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
    console.log(`Creating new user with email: ${email} and metadata:`, metadata);
    
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

    console.log(`User created successfully with ID: ${data.user.id}`);

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
