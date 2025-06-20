
import { supabase } from "@/integrations/supabase/client";
import { CompanyUserResult, CreateCompanyUserParams, CompanyUserLevel } from "./types";
import { isValidCompanyEmail } from "./validation";

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

    // Vérifier d'abord si l'utilisateur existe déjà dans la table company_users
    const { data: existingUser, error: checkError } = await supabase
      .from('company_users')
      .select('id, email')
      .eq('email', params.email)
      .maybeSingle();

    if (existingUser) {
      console.log("L'utilisateur existe déjà dans la table company_users:", existingUser);
      return {
        success: false,
        message: "Un utilisateur avec cette adresse email existe déjà",
        error: "User already exists in company_users"
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
      
      // Vérifier si l'erreur contient des informations sur un utilisateur existant
      if (error.message && (
          error.message.includes('non-2xx status code') ||
          error.message.includes('Edge Function returned a non-2xx')
      )) {
        // Essayer de récupérer l'utilisateur existant dans auth.users via un appel à la fonction edge
        try {
          const { data: checkUserData } = await supabase.functions.invoke("check-user-exists", {
            body: { email: params.email }
          });
          
          if (checkUserData && checkUserData.exists) {
            return {
              success: false,
              message: "Un compte avec cette adresse email existe déjà dans l'authentification Supabase",
              error: "User already exists in auth.users"
            };
          }
        } catch (checkErr) {
          console.error("Erreur lors de la vérification de l'utilisateur:", checkErr);
        }
        
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
