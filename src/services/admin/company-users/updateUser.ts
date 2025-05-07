
import { supabase } from "@/integrations/supabase/client";
import { CompanyUserResult, UpdateCompanyUserParams } from "./types";
import { isValidCompanyEmail } from "./validation";

/**
 * Met à jour un utilisateur d'entreprise existant
 */
export const updateCompanyUser = async (
  params: UpdateCompanyUserParams
): Promise<CompanyUserResult> => {
  try {
    console.log("Mise à jour d'un utilisateur d'entreprise:", params.email);
    
    // Vérifier que l'email est un email pazproperty.pt
    if (!isValidCompanyEmail(params.email)) {
      return {
        success: false,
        message: "Seuls les utilisateurs avec une adresse @pazproperty.pt peuvent être utilisés"
      };
    }

    // Mettre à jour l'entrée dans company_users
    const { error: updateError } = await supabase
      .from('company_users')
      .update({
        name: params.name,
        email: params.email,
        level: params.level,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', params.userId);
    
    if (updateError) {
      console.error("Erreur lors de la mise à jour dans company_users:", updateError);
      
      if (updateError.code === '23505') { // Violation de contrainte d'unicité
        return {
          success: false,
          message: "Un utilisateur avec cette adresse email existe déjà",
          error: "Email already exists"
        };
      }
      
      return {
        success: false,
        message: `Erreur lors de la mise à jour: ${updateError.message}`,
        error: updateError.message
      };
    }

    // Mettre à jour le rôle de l'utilisateur si nécessaire
    const { error: roleError } = await supabase
      .from('user_roles')
      .update({
        role: params.level
      })
      .eq('user_id', params.userId);

    if (roleError) {
      console.error("Erreur lors de la mise à jour du rôle:", roleError);
      // On ne renvoie pas d'erreur pour ne pas bloquer complètement la mise à jour
    }

    return {
      success: true,
      userId: params.userId,
      message: `L'utilisateur ${params.email} a été mis à jour avec succès`
    };
  } catch (error: any) {
    console.error("Exception lors de la mise à jour de l'utilisateur:", error);
    return {
      success: false,
      message: `Exception: ${error.message || "Erreur inconnue"}`,
      error: error.message
    };
  }
};
