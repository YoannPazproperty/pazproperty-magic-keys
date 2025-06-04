
import { supabase } from "../../integrations/supabase/client";
import type { CreateUserOptions, UserWithMetadata } from "../../hooks/auth/types";

export interface CreateUserResult {
  success: boolean;
  message?: string;
  userId?: string;
  error?: any;
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
