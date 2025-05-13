
import { supabase } from '@/integrations/supabase/client';

/**
 * Fixes NULL confirmation_token values in the Supabase database
 * This is needed to resolve password reset issues
 */
export const fixConfirmationTokens = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // First get the session to extract the access token using the current API
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token || '';
    
    if (!accessToken) {
      console.log('Tentative de réparation sans session active');
      // Essayons sans token d'authentification
    }
    
    const supabaseUrl = 'https://ubztjjxmldogpwawcnrj.supabase.co';
    
    const response = await fetch(
      `${supabaseUrl}/functions/v1/password-reset-fix`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        },
      }
    );

    if (response.status === 500) {
      console.error('Erreur serveur lors de la réparation des tokens:', await response.text());
      return { 
        success: false, 
        message: 'Le serveur a rencontré une erreur interne lors de la réparation' 
      };
    }

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erreur lors de la réparation des tokens:', data);
      return { 
        success: false, 
        message: data.error || 'Échec de la réparation des tokens' 
      };
    }
    
    console.log('Résultat de la réparation:', data);
    
    return { 
      success: true, 
      message: data.message || 'Tokens de confirmation réparés avec succès' 
    };
  } catch (error) {
    console.error('Erreur inattendue lors de la réparation des tokens:', error);
    return { 
      success: false, 
      message: 'Une erreur inattendue est survenue lors de la tentative de réparation' 
    };
  }
};
