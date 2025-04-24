
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { ProviderData } from './types.ts';

export async function getProviderData(supabase: any, providerId: string): Promise<ProviderData> {
  const { data: provider, error: providerError } = await supabase
    .from('prestadores_de_servicos')
    .select('*')
    .eq('id', providerId)
    .single();

  if (providerError) {
    console.error('Provider query error:', providerError);
    throw new Error(`Provider not found: ${providerError.message}`);
  }

  if (!provider) {
    throw new Error('Provider not found');
  }

  return provider;
}

export async function getUserByEmail(supabase: any, email: string) {
  const { data: existingUsers, error: userCheckError } = await supabase.auth.admin
    .listUsers({
      filter: {
        email: email
      }
    });

  if (userCheckError) {
    console.error('Error checking existing users:', userCheckError);
  }

  return existingUsers?.users?.[0] || null;
}

export async function updateUserMetadata(supabase: any, userId: string, metadata: any) {
  const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
    userId,
    { user_metadata: metadata }
  );

  if (updateError) {
    console.error('Error updating user metadata:', updateError);
    throw new Error(`Error updating user metadata: ${updateError.message}`);
  }

  return updateData;
}

export async function createUser(supabase: any, email: string, password: string, metadata: any) {
  const { data: authData, error: createUserError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: metadata
  });

  if (createUserError) {
    console.error('Error creating user:', createUserError);
    throw new Error(`Error creating user: ${createUserError.message}`);
  }

  if (!authData || !authData.user) {
    throw new Error('Failed to create user account');
  }

  return authData.user;
}

export async function ensureUserRole(supabase: any, userId: string, role: string) {
  // Check if role already exists
  const { data: existingRole, error: roleCheckError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .eq('role', role)
    .single();

  if (roleCheckError && roleCheckError.code !== 'PGRST116') {
    console.error('Error checking existing role:', roleCheckError);
  }

  // Add role if it doesn't exist
  if (!existingRole) {
    console.log('Adding manager role to user');
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role
      });

    if (roleError) {
      console.error('Error setting user role:', roleError);
      throw new Error(`Error setting user role: ${roleError.message}`);
    }
  }
}
