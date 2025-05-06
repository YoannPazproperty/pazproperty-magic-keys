
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CompanyUserLevel = 'admin' | 'user';

export interface CreateCompanyUserParams {
  email: string;
  password: string;
  name: string;
  level: CompanyUserLevel;
}

export interface CompanyUserResult {
  success: boolean;
  message?: string;
  userId?: string;
  error?: any;
  emailSent?: boolean;
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
      return {
        success: false,
        message: `Erreur: ${error.message || "Erreur inconnue"}`,
        error
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
      return {
        success: false,
        message: `L'utilisateur a été créé dans Auth mais pas dans company_users: ${companyUserError.message}`,
        userId: data.user.id,
        error: companyUserError
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
      error: emailError
    };
  } catch (error: any) {
    console.error("Exception lors de la création de l'utilisateur:", error);
    return {
      success: false,
      message: `Exception: ${error.message || "Erreur inconnue"}`,
      error
    };
  }
};

/**
 * Récupère la liste des utilisateurs d'entreprise
 */
export const getCompanyUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('company_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      return { success: false, error };
    }
    
    return { 
      success: true, 
      users: data 
    };
  } catch (error: any) {
    console.error("Exception lors de la récupération des utilisateurs:", error);
    return { 
      success: false, 
      message: `Exception: ${error.message || "Erreur inconnue"}` 
    };
  }
};
