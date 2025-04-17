
import { supabase } from '@/integrations/supabase/client';

/**
 * Fixes NULL confirmation_token values in the Supabase database
 * This is needed to resolve password reset issues
 */
export const fixConfirmationTokens = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(
      'https://ubztjjxmldogpwawcnrj.supabase.co/functions/v1/password-reset-fix',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`,
        },
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error fixing confirmation tokens:', data);
      return { 
        success: false, 
        message: data.error || 'Failed to fix confirmation tokens' 
      };
    }
    
    return { 
      success: true, 
      message: 'Confirmation tokens fixed successfully' 
    };
  } catch (error) {
    console.error('Unexpected error fixing confirmation tokens:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred' 
    };
  }
};

// Re-export all functionality from supabase auth
export { supabase } from '@/integrations/supabase/client';
