
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

    console.log("Demande de réinitialisation pour:", email);
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
      message: "Si cette adresse existe dans notre système, vous recevrez un e-mail avec les instructions.",
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
