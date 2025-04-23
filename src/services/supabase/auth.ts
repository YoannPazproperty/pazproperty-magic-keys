import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

/**
 * Alternative password reset method that works even when Supabase email services fail
 * This will generate a direct password reset link that can be used
 */
export const generatePasswordResetLink = async (email: string): Promise<{ 
  success: boolean; 
  message: string;
  resetLink?: string;
}> => {
  try {
    // Vérifier que l'email est valide
    if (!email || !email.includes('@')) {
      return { 
        success: false, 
        message: "Veuillez fournir une adresse e-mail valide" 
      };
    }

    console.log("Génération d'un lien de réinitialisation pour:", email);
    const supabaseUrl = 'https://ubztjjxmldogpwawcnrj.supabase.co';
    
    // Générer un token de réinitialisation directement via l'API Supabase
    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-reset-link`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      }
    );

    const data = await response.json();
    console.log("Réponse de la fonction generate-reset-link:", data);
    
    if (!response.ok) {
      console.error('Erreur lors de la génération du lien de réinitialisation:', data);
      
      // Si l'email n'existe pas, nous retournons quand même un succès pour des raisons de sécurité
      if (response.status === 404) {
        return { 
          success: true, 
          message: "Si cette adresse existe dans notre système, vous recevrez les instructions de réinitialisation." 
        };
      }
      
      return { 
        success: false, 
        message: data.error || 'Échec de la génération du lien de réinitialisation' 
      };
    }
    
    return { 
      success: true, 
      message: "Lien de réinitialisation généré avec succès. Vérifiez votre boîte de réception pour les instructions.",
      resetLink: data.resetLink // Pour la démonstration
    };
  } catch (error) {
    console.error('Erreur inattendue lors de la génération du lien:', error);
    return { 
      success: false, 
      message: 'Une erreur inattendue est survenue' 
    };
  }
};

/**
 * Sets a new password for an administrator
 * This function bypasses the email verification step that might be failing
 */
export const setAdminPassword = async (email: string, newPassword: string): Promise<{ 
  success: boolean; 
  message: string;
}> => {
  try {
    if (!email || !email.includes('@') || !newPassword || newPassword.length < 8) {
      return { 
        success: false, 
        message: "L'email ou le mot de passe fourni est invalide" 
      };
    }

    console.log("Tentative de définition de mot de passe pour:", email);
    const supabaseUrl = 'https://ubztjjxmldogpwawcnrj.supabase.co';
    
    // Appeler notre fonction Edge pour définir directement le mot de passe
    const response = await fetch(
      `${supabaseUrl}/functions/v1/set-admin-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password: newPassword,
          adminKey: 'supadmin2025' // Clé de sécurité simple
        })
      }
    );

    const data = await response.json();
    console.log("Réponse de set-admin-password:", data);
    
    if (!response.ok) {
      console.error('Erreur lors de la définition du mot de passe:', data);
      return { 
        success: false, 
        message: data.error || 'Échec de la définition du mot de passe' 
      };
    }
    
    toast.success("Mot de passe mis à jour avec succès");
    
    return { 
      success: true, 
      message: "Mot de passe administrateur défini avec succès" 
    };
  } catch (error) {
    console.error('Erreur inattendue lors de la définition du mot de passe:', error);
    return { 
      success: false, 
      message: 'Une erreur inattendue est survenue' 
    };
  }
};

// Re-export all functionality from supabase auth
export { supabase } from '@/integrations/supabase/client';
