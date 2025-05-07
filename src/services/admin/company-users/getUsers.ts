
import { supabase } from "@/integrations/supabase/client";
import { GetCompanyUsersResult, CompanyUser, CompanyUserLevel } from "./types";

/**
 * Récupère la liste des utilisateurs d'entreprise
 */
export const getCompanyUsers = async (): Promise<GetCompanyUsersResult> => {
  try {
    const { data, error } = await supabase
      .from('company_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      return { 
        success: false, 
        error,
        message: `Erreur: ${error.message || "Erreur inconnue"}`
      };
    }
    
    // Mapper les résultats pour garantir que level est de type CompanyUserLevel
    const typedUsers: CompanyUser[] = data.map(user => ({
      id: user.id,
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      level: user.level as CompanyUserLevel,
      created_at: user.created_at
    }));
    
    return { 
      success: true, 
      users: typedUsers 
    };
  } catch (error: any) {
    console.error("Exception lors de la récupération des utilisateurs:", error);
    return { 
      success: false, 
      message: `Exception: ${error.message || "Erreur inconnue"}`,
      error
    };
  }
};

/**
 * Récupère les détails d'un utilisateur spécifique
 */
export const getCompanyUser = async (userId: string): Promise<{ success: boolean, user?: CompanyUser, error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return { success: false, error };
    }
    
    // Cast du level pour assurer la compatibilité avec CompanyUserLevel
    const typedUser: CompanyUser = {
      id: data.id,
      user_id: data.user_id,
      email: data.email,
      name: data.name,
      level: data.level as CompanyUserLevel,
      created_at: data.created_at
    };
    
    return { 
      success: true, 
      user: typedUser 
    };
  } catch (error: any) {
    console.error("Exception lors de la récupération de l'utilisateur:", error);
    return { 
      success: false, 
      error: error.message
    };
  }
};

/**
 * Vérifie si un utilisateur avec l'email spécifié existe déjà
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const { data, count, error } = await supabase
      .from('company_users')
      .select('id', { count: 'exact' })
      .eq('email', email)
      .limit(1);
      
    if (error) {
      console.error("Erreur lors de la vérification de l'existence de l'utilisateur:", error);
      return false;
    }
    
    return !!count && count > 0;
  } catch (error: any) {
    console.error("Exception lors de la vérification de l'utilisateur:", error);
    return false;
  }
};
