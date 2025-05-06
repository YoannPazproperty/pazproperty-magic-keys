
import { supabase } from "@/integrations/supabase/client";

export type AdminUserLevel = 'admin' | 'user';

export interface CreateAdminUserParams {
  email: string;
  password: string;
  name: string;
  level: AdminUserLevel;
}

export interface AdminUserResult {
  success: boolean;
  message?: string;
  userId?: string;
  error?: any;
}

/**
 * Vérifie si l'utilisateur est un email pazproperty.pt valide
 */
export const isValidPazPropertyEmail = (email: string): boolean => {
  return email.endsWith('@pazproperty.pt');
}

/**
 * Crée un nouvel utilisateur administrateur
 */
export const createAdminUser = async (
  params: CreateAdminUserParams
): Promise<AdminUserResult> => {
  try {
    // Vérifier que l'email est un email pazproperty.pt
    if (!isValidPazPropertyEmail(params.email)) {
      return {
        success: false,
        message: "Seuls les utilisateurs avec une adresse @pazproperty.pt peuvent être créés comme administrateurs"
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
    const { data, error } = await supabase.functions.invoke("create-provider-user", {
      body: {
        email: params.email,
        password: params.password,
        isAdmin: true,
        metadata: {
          name: params.name,
          adminType: params.level,
          is_admin: true
        }
      }
    });

    if (error) {
      console.error("Erreur lors de la création de l'utilisateur admin:", error);
      return {
        success: false,
        message: `Erreur: ${error.message || "Erreur inconnue"}`,
        error
      };
    }

    return {
      success: true,
      userId: data.user.id,
      message: `L'utilisateur ${params.email} a été créé avec succès avec le niveau ${params.level}`
    };
  } catch (error: any) {
    console.error("Exception lors de la création de l'utilisateur admin:", error);
    return {
      success: false,
      message: `Exception: ${error.message || "Erreur inconnue"}`,
      error
    };
  }
};

/**
 * Récupère la liste des utilisateurs administrateurs
 */
export const getAdminUsers = async () => {
  try {
    // Récupérer tous les utilisateurs avec un rôle admin ou user et un email @pazproperty.pt
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role, created_at')
      .in('role', ['admin', 'user']);
    
    if (rolesError) {
      console.error("Erreur lors de la récupération des rôles:", rolesError);
      return { success: false, error: rolesError };
    }
    
    // Si aucun utilisateur trouvé
    if (!roles || roles.length === 0) {
      return { success: true, users: [] };
    }
    
    // Récupérer les infos des utilisateurs depuis auth.users via la fonction admin
    const userIds = roles.map(role => role.user_id);
    
    // Nous devons utiliser une fonction Edge pour récupérer les infos utilisateurs
    // Cette implémentation est simplifiée, en pratique on devrait créer une fonction Edge
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .in('id', userIds);
    
    if (usersError) {
      console.error("Erreur lors de la récupération des utilisateurs:", usersError);
      return { success: false, error: usersError };
    }
    
    // Combiner les données des rôles et des utilisateurs
    const adminUsers = roles.map(role => {
      // Fix: TypeScript error by adding type checking and default values
      const userData = usersData?.find(user => user.id === role.user_id) || { email: 'Email inconnu', full_name: 'Nom inconnu' };
      
      return {
        id: role.user_id,
        email: userData.email || 'Email inconnu',
        name: userData.full_name || 'Nom inconnu',
        level: role.role,
        createdAt: role.created_at
      };
    }).filter(user => user.email.endsWith('@pazproperty.pt'));
    
    return { 
      success: true, 
      users: adminUsers
    };
  } catch (error: any) {
    console.error("Exception lors de la récupération des utilisateurs admin:", error);
    return { 
      success: false, 
      message: `Exception: ${error.message || "Erreur inconnue"}` 
    };
  }
};
