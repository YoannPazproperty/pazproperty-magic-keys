
import { supabase } from "../../../integrations/supabase/client";
import { CompanyUserResult } from "./types";

/**
 * Archive (supprime) un utilisateur d'entreprise
 */
export const archiveCompanyUser = async (userId: string): Promise<CompanyUserResult> => {
  try {
    console.log("Archivage d'un utilisateur d'entreprise:", userId);
    
    // Utiliser la fonction SQL pour archiver l'utilisateur
    const { data, error } = await supabase.rpc(
      'archive_company_user',
      { user_id_param: userId }
    );
    
    if (error) {
      console.error("Erreur lors de l'archivage de l'utilisateur:", error);
      return {
        success: false,
        message: `Erreur lors de l'archivage: ${error.message}`,
        error: error.message
      };
    }

    if (!data) {
      return {
        success: false,
        message: "Utilisateur non trouvé ou déjà archivé"
      };
    }

    return {
      success: true,
      message: "L'utilisateur a été archivé avec succès"
    };
  } catch (error: any) {
    console.error("Exception lors de l'archivage de l'utilisateur:", error);
    return {
      success: false,
      message: `Exception: ${error.message || "Erreur inconnue"}`,
      error: error.message
    };
  }
};
