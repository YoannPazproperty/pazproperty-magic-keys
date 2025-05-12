
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

/**
 * Ensures the user has the specified role
 * This function should be called with the admin client (service role)
 * to avoid RLS issues when inserting roles
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
