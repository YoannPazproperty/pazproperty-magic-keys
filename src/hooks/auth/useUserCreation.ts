
import { useState } from 'react';
import { 
  UserCreationContext, 
  UserCreationData, 
  createUserWithInvitation
} from '@/services/auth/userCreationService';

export const useUserCreation = (defaultContext?: UserCreationContext) => {
  const [isCreating, setIsCreating] = useState(false);
  const [context, setContext] = useState<UserCreationContext>(defaultContext || 'customer_creation');
  const [error, setError] = useState<string | null>(null);
  
  const createUser = async (userData: UserCreationData) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const result = await createUserWithInvitation(context, userData);
      
      if (!result.success) {
        setError(result.message || 'Erreur lors de la création de l\'utilisateur');
        return { success: false, error: result.error, message: result.message };
      }
      
      return { 
        success: true, 
        userId: result.userId,
        message: result.message
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Une erreur inattendue est survenue';
      setError(errorMessage);
      return { success: false, error: err, message: errorMessage };
    } finally {
      setIsCreating(false);
    }
  };
  
  return {
    context,
    setContext,
    createUser,
    isCreating,
    error,
    clearError: () => setError(null)
  };
};
