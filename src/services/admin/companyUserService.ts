
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CompanyUserLevel = 'admin' | 'user';

export interface CompanyUserParams {
  email: string;
  name: string;
  level: CompanyUserLevel;
}

export interface CreateCompanyUserParams extends CompanyUserParams {
  password: string;
}

export interface UpdateCompanyUserParams extends CompanyUserParams {
  userId: string;
}

export interface CompanyUser {
  id: string;
  user_id: string;
  email: string;
  name: string;
  level: CompanyUserLevel;
  created_at: string;
}

export interface CompanyUserResult {
  success: boolean;
  message?: string;
  userId?: string;
  error?: any;
  emailSent?: boolean;
}

// Interface pour la réponse de getCompanyUsers
export interface GetCompanyUsersResult {
  success: boolean;
  users?: CompanyUser[];
  error?: any;
  message?: string; // Ajout de message dans l'interface
}

/**
 * Vérifie si l'utilisateur a une adresse email pazproperty.pt
 */
export const isValidCompanyEmail = (email: string): boolean => {
  return email.endsWith('@pazproperty.pt');
}

/**
 * Génère un mot de passe temporaire pour les nouveaux utilisateurs
 */
export const generateTemporaryPassword = (): string => {
  const adjectives = ["Happy", "Sunny", "Shiny", "Lucky", "Magic", "Super", "Mega"];
  const nouns = ["Star", "Moon", "Sky", "Day", "Tech", "Team", "Hero"];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${randomAdjective}${randomNoun}${randomNum}`;
}

/**
 * Crée un nouvel utilisateur d'entreprise (avec adresse @pazproperty.pt)
 */
export const createCompanyUser = async (
  params: CreateCompanyUserParams
): Promise<CompanyUserResult> => {
  try {
    console.log("Création d'un utilisateur d'entreprise:", params.email);
    
    // Vérifier que l'email est un email pazproperty.pt
    if (!isValidCompanyEmail(params.email)) {
      return {
        success: false,
        message: "Seuls les utilisateurs avec une adresse @pazproperty.pt peuvent être créés"
      };
    }

    // Vérifier que le mot de passe est assez fort
    if (params.password.length < 8) {
      return {
        success: false,
        message: "Le mot de passe doit comporter au moins 8 caractères"
      };
    }

    // Créer l'utilisateur via l'edge function qui utilise le rôle service
    const { data, error } = await supabase.functions.invoke("create-company-user", {
      body: {
        email: params.email,
        password: params.password,
        metadata: {
          name: params.name,
          adminType: params.level,
          is_admin: true
        }
      }
    });

    if (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      
      // Traiter spécifiquement l'erreur d'utilisateur existant
      if (error.message && error.message.includes('non-2xx status code')) {
        return {
          success: false,
          message: "Un utilisateur avec cette adresse email existe déjà",
          error: "User already exists"
        };
      }
      
      return {
        success: false,
        message: `Erreur: ${error.message || "Erreur inconnue"}`,
        error: error.message
      };
    }

    // Après création dans Auth, créer l'entrée dans company_users
    const { error: companyUserError } = await supabase
      .from('company_users')
      .insert({
        user_id: data.user.id,
        name: params.name,
        email: params.email,
        level: params.level
      });
    
    if (companyUserError) {
      console.error("Erreur lors de la création dans company_users:", companyUserError);
      
      if (companyUserError.code === '23505') { // Violation de contrainte d'unicité
        return {
          success: false,
          message: "Un utilisateur avec cette adresse email existe déjà dans la base de données",
          userId: data.user.id,
          error: "Email already exists in company_users"
        };
      }
      
      return {
        success: false,
        message: `L'utilisateur a été créé dans Auth mais pas dans company_users: ${companyUserError.message}`,
        userId: data.user.id,
        error: companyUserError.message
      };
    }

    // Envoyer l'email d'invitation
    const { error: emailError } = await supabase.functions.invoke("send-company-invite", {
      body: {
        email: params.email,
        name: params.name,
        userId: data.user.id,
        tempPassword: params.password
      }
    });

    return {
      success: true,
      userId: data.user.id,
      message: `L'utilisateur ${params.email} a été créé avec succès avec le niveau ${params.level}`,
      emailSent: !emailError,
      error: emailError?.message
    };
  } catch (error: any) {
    console.error("Exception lors de la création de l'utilisateur:", error);
    return {
      success: false,
      message: `Exception: ${error.message || "Erreur inconnue"}`,
      error: error.message
    };
  }
};

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
      return { success: false, error };
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
