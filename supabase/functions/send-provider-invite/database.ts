
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { ProviderData } from './types.ts';

export async function getProviderData(supabase: any, providerId: string): Promise<ProviderData> {
  console.log(`Fetching provider data for ID: ${providerId}`);
  
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
    console.error('No provider data returned');
    throw new Error('Provider not found');
  }

  console.log('Provider data retrieved successfully:', {
    id: provider.id,
    empresa: provider.empresa,
    email: provider.email,
    nome_gerente: provider.nome_gerente
  });
  
  return provider;
}

export async function getUserByEmail(supabase: any, email: string) {
  console.log(`Checking if user exists with email: ${email}`);
  
  try {
    const { data: existingUsers, error: userCheckError } = await supabase.auth.admin
      .listUsers({
        filter: {
          email: email
        }
      });

    if (userCheckError) {
      console.error('Error checking existing users:', userCheckError);
      throw userCheckError;
    }

    if (existingUsers?.users?.length > 0) {
      console.log(`User found with email ${email}, user ID:`, existingUsers.users[0].id);
      return existingUsers.users[0];
    }
    
    console.log(`No user found with email ${email}`);
    return null;
  } catch (error) {
    console.error('Exception when checking for user by email:', error);
    throw error;
  }
}

export async function updateUserMetadata(supabase: any, userId: string, metadata: any) {
  console.log(`Updating metadata for user ${userId}:`, metadata);
  
  try {
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: metadata }
    );

    if (updateError) {
      console.error('Error updating user metadata:', updateError);
      throw new Error(`Error updating user metadata: ${updateError.message}`);
    }

    console.log('User metadata updated successfully:', updateData);
    return updateData;
  } catch (error) {
    console.error('Exception when updating user metadata:', error);
    throw error;
  }
}

export async function createUser(supabase: any, email: string, password: string, metadata: any) {
  console.log(`Creating new user with email ${email}`);
  
  try {
    // Ajouter le flag first_login aux métadonnées
    const userMetadata = {
      ...metadata,
      first_login: true
    };
    
    const { data: authData, error: createUserError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: userMetadata
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      throw new Error(`Error creating user: ${createUserError.message}`);
    }

    if (!authData || !authData.user) {
      console.error('No user data returned after creation');
      throw new Error('Failed to create user account');
    }

    console.log('User created successfully with ID:', authData.user.id);
    return authData.user;
  } catch (error) {
    console.error('Exception when creating user:', error);
    throw error;
  }
}

export async function ensureUserRole(supabase: any, userId: string, role: string) {
  console.log(`Ensuring user ${userId} has role: ${role}`);
  
  try {
    // First check if the user already has the specified role
    const { data: existingRoles, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role);

    if (roleCheckError) {
      console.error('Error checking existing roles:', roleCheckError);
      throw new Error(`Error checking user roles: ${roleCheckError.message}`);
    }
    
    // If user already has the role, log it and return
    if (existingRoles && existingRoles.length > 0) {
      console.log(`User ${userId} already has role ${role}, no action needed`);
      return;
    }

    console.log(`Role ${role} not found for user ${userId}, adding it`);
    
    // Add the role if it doesn't exist
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
    
    console.log(`Role ${role} added successfully for user ${userId}`);
  } catch (error) {
    console.error('Exception when ensuring user role:', error);
    throw error;
  }
}
