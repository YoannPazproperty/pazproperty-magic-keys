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
    // Si c'est un rôle de prestataire, utiliser la nouvelle table prestadores_roles
    if (role === 'prestadores_externos') {
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('prestadores_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (roleCheckError && roleCheckError.code !== 'PGRST116') {
        console.error('Error checking existing prestador role:', roleCheckError);
        throw new Error(`Error checking prestador role: ${roleCheckError.message}`);
      }
      
      if (!existingRole) {
        console.log(`Adding prestador role for user ${userId}`);
        const { error: insertError } = await supabase
          .from('prestadores_roles')
          .insert({
            user_id: userId,
            nivel: 'standard'  // Niveau d'accès par défaut
          });

        if (insertError) {
          console.error('Error setting prestador role:', insertError);
          throw new Error(`Error setting prestador role: ${insertError.message}`);
        }
      } else {
        console.log(`User ${userId} already has prestador role, no action needed`);
      }
      return;
    }
    
    // Sinon, utiliser la table user_roles existante pour les rôles internes
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (roleCheckError && roleCheckError.code !== 'PGRST116') {
      console.error('Error checking existing user role:', roleCheckError);
      throw new Error(`Error checking user role: ${roleCheckError.message}`);
    }

    if (existingRole) {
      // Si le rôle est différent, le mettre à jour
      if (existingRole.role !== role) {
        console.log(`Updating role from ${existingRole.role} to ${role} for user ${userId}`);
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: role })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating user role:', updateError);
          throw new Error(`Error updating user role: ${updateError.message}`);
        }
      } else {
        console.log(`User ${userId} already has role ${role}, no action needed`);
      }
    } else {
      // Si aucun rôle n'existe, en créer un nouveau
      console.log(`Adding role ${role} for user ${userId}`);
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (insertError) {
        console.error('Error setting user role:', insertError);
        throw new Error(`Error setting user role: ${insertError.message}`);
      }
    }
    
    console.log(`Role ${role} handled successfully for user ${userId}`);
  } catch (error) {
    console.error('Exception when ensuring user role:', error);
    throw error;
  }
}
