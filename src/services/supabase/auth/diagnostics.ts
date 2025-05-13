
import { supabase } from '@/integrations/supabase/client';

/**
 * Test login with credentials - for debugging purposes
 */
export const testLogin = async (email: string, password: string): Promise<{
  success: boolean;
  message: string;
  error?: any;
  userData?: any;
}> => {
  try {
    console.log(`Tentative de connexion de test pour ${email}`);
    
    // Vérifier si l'utilisateur existe avant de tenter la connexion
    console.log("Vérification de l'existence de l'utilisateur dans la base de données");
    const { data: userList, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();
    
    if (userError) {
      console.error("Erreur lors de la recherche de l'utilisateur:", userError);
    }
    
    console.log("Résultat de la recherche d'utilisateur:", userList ? "Utilisateur trouvé" : "Utilisateur non trouvé");
    
    // Tenter la connexion
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Échec de la connexion de test:", error);
      
      // Récupérer des informations supplémentaires pour le diagnostic
      const diagnosticInfo = {
        errorCode: error.status,
        errorName: error.name,
        errorMessage: error.message,
        userExists: !!userList,
        userEmail: userList?.email
      };
      
      console.log("Informations de diagnostic:", diagnosticInfo);
      
      return {
        success: false,
        message: `Échec de la connexion: ${error.message}`,
        error,
        userData: diagnosticInfo
      };
    }
    
    console.log("Connexion de test réussie", data);
    return {
      success: true,
      message: "Connexion de test réussie",
      userData: {
        id: data.user?.id,
        email: data.user?.email,
        lastSignInAt: data.user?.last_sign_in_at
      }
    };
  } catch (err) {
    console.error("Erreur inattendue lors de la connexion de test:", err);
    return {
      success: false,
      message: `Erreur inattendue: ${err instanceof Error ? err.message : String(err)}`,
      error: err
    };
  }
};
