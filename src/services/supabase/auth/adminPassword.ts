
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
