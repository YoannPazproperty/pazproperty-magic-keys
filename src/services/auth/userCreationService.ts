
import { supabase } from "../../integrations/supabase/client";
import type { CreateUserOptions, UserWithMetadata } from "../../hooks/auth/types";

export interface CreateUserResult {
  success: boolean;
  message?: string;
  userId?: string;
  error?: any;
}

export type UserCreationContext = 'customer_creation' | 'employee_creation' | 'provider_creation';

export interface UserCreationData {
  email: string;
  password: string;
  name?: string;
  role?: string;
  metadata?: Record<string, any>;
}

export const createUser = async (options: CreateUserOptions): Promise<CreateUserResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: options.email,
      password: options.password,
      options: {
        data: {
          role: options.role || 'user',
          ...options.metadata
        }
      }
    });

    if (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: error.message,
        error
      };
    }

    if (data.user) {
      return {
        success: true,
        message: 'Utilisateur créé avec succès',
        userId: data.user.id
      };
    }

    return {
      success: false,
      message: 'Erreur inconnue lors de la création de l\'utilisateur'
    };
  } catch (error) {
    console.error('Exception creating user:', error);
    return {
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error
    };
  }
};

export const createUserWithInvitation = async (
  context: UserCreationContext,
  userData: UserCreationData
): Promise<CreateUserResult> => {
  console.log(`Creating user with context: ${context}`, userData);
  
  try {
    const result = await createUser({
      email: userData.email,
      password: userData.password,
      role: userData.role,
      metadata: userData.metadata
    });

    return result;
  } catch (error) {
    console.error('Exception creating user with invitation:', error);
    return {
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur avec invitation',
      error
    };
  }
};
