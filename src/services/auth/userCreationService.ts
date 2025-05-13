import { supabase } from '@/integrations/supabase/client';
import { adminClient } from '@/integrations/supabase/adminClient';
import { toast } from 'sonner';
import { UserRole } from '@/hooks/auth/types';

// Types pour le contexte de création d'utilisateur
export type UserCreationContext = 
  | 'employee_creation'
  | 'prestadores_creation'
  | 'crm_creation'
  | 'customer_creation'
  | 'claim_submission';

// Interface pour les données de création d'utilisateur
export interface UserCreationData {
  email: string;
  password: string;
  name?: string;
  company?: string;
  additionalMetadata?: Record<string, any>;
  selectedRole?: UserRole; // Utilisé uniquement pour 'employee_creation'
}

/**
 * Détermine le rôle à assigner en fonction du contexte de création
 */
export const determineUserRole = (
  context: UserCreationContext, 
  selectedRole?: UserRole
): UserRole => {
  switch (context) {
    case 'employee_creation':
      // Pour les employés, utiliser le rôle sélectionné ou 'user' par défaut
      return selectedRole || 'user';
    case 'prestadores_creation':
      return 'provider';
    case 'crm_creation':
      return 'customer'; // À remplacer par 'referral_partner' quand ce type sera disponible
    case 'customer_creation':
    case 'claim_submission':
    default:
      return 'customer';
  }
};

/**
 * Crée un utilisateur avec le bon rôle basé sur le contexte
 */
export const createUserWithContext = async (
  context: UserCreationContext,
  userData: UserCreationData
): Promise<{ success: boolean; userId?: string; message?: string; error?: any }> => {
  try {
    // Déterminer le rôle à assigner
    const userRoleToAssign = determineUserRole(context, userData.selectedRole);
    console.log(`Création d'un utilisateur dans le contexte: ${context}, rôle: ${userRoleToAssign}`);
    
    // Préparer les métadonnées utilisateur
    const userMetadata = {
      name: userData.name || '',
      company: userData.company || '',
      role: userRoleToAssign,
      ...userData.additionalMetadata,
      creation_context: context,
    };
    
    // Utiliser adminClient pour créer l'utilisateur (avec service_role pour contourner RLS)
    const { data, error } = await adminClient.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: userMetadata
    });
    
    if (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return {
        success: false,
        message: `Échec de création: ${error.message}`,
        error
      };
    }
    
    // Après création réussie dans Auth, créer l'entrée dans user_roles
    if (data.user) {
      const { error: roleError } = await adminClient
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: userRoleToAssign
        });
      
      if (roleError) {
        console.error('Erreur lors de la création du rôle utilisateur:', roleError);
      }
      
      console.log(`Utilisateur créé avec l'ID: ${data.user.id}, rôle: ${userRoleToAssign}`);
      
      // Actions supplémentaires spécifiques au contexte
      switch (context) {
        case 'prestadores_creation':
          // Si c'est un prestataire, ajouter à prestadores_roles aussi pour la compatibilité
          await adminClient.from('prestadores_roles')
            .insert({
              user_id: data.user.id,
              nivel: 'standard'
            });
          break;
          
        case 'employee_creation':
          // Si c'est un employé, ajouter à company_users
          if (userData.name) {
            await adminClient.from('company_users')
              .insert({
                user_id: data.user.id,
                name: userData.name,
                email: userData.email,
                level: userRoleToAssign === 'admin' ? 'admin' : 'user'
              });
          }
          break;
          
        default:
          // Pas d'actions supplémentaires pour les autres contextes
          break;
      }
      
      return {
        success: true,
        userId: data.user.id,
        message: `Utilisateur ${userData.email} créé avec succès avec le rôle ${userRoleToAssign}`
      };
    }
    
    return {
      success: false,
      message: 'Création réussie mais aucun utilisateur retourné'
    };
  } catch (error: any) {
    console.error('Exception lors de la création de l\'utilisateur:', error);
    return {
      success: false,
      message: `Exception: ${error.message || "Erreur inconnue"}`,
      error
    };
  }
};

/**
 * Envoie un email d'invitation en fonction du contexte de création
 */
export const sendContextualInvitation = async (
  userId: string,
  email: string,
  context: UserCreationContext,
  tempPassword?: string,
  additionalData?: Record<string, any>
): Promise<{ success: boolean; message?: string }> => {
  try {
    // Personnaliser l'invocation de la fonction edge en fonction du contexte
    let functionName = '';
    let functionData: Record<string, any> = { userId, email };
    
    switch (context) {
      case 'employee_creation':
        functionName = 'send-company-invite';
        functionData = {
          ...functionData,
          name: additionalData?.name || 'Employé',
          tempPassword: tempPassword || '',
        };
        break;
        
      case 'prestadores_creation':
        functionName = 'send-provider-invite';
        functionData = {
          ...functionData,
          name: additionalData?.name || 'Prestataire',
          tempPassword: tempPassword || '',
          metadata: {
            empresa: additionalData?.company || '',
            is_provider: true
          }
        };
        break;
        
      case 'crm_creation':
      case 'customer_creation':
        functionName = 'send-customer-invite';
        functionData = {
          ...functionData,
          name: additionalData?.name || 'Client',
        };
        break;
        
      default:
        // Pas d'invitation pour claim_submission et autres cas
        return {
          success: true,
          message: "Aucune invitation n'est nécessaire pour ce contexte"
        };
    }
    
    if (functionName) {
      const { error } = await supabase.functions.invoke(functionName, {
        body: functionData
      });
      
      if (error) {
        console.error(`Erreur lors de l'envoi de l'invitation (${context}):`, error);
        return {
          success: false,
          message: `Échec de l'envoi d'invitation: ${error.message}`
        };
      }
      
      return {
        success: true,
        message: "Invitation envoyée avec succès"
      };
    }
    
    return {
      success: true,
      message: "Aucune fonction d'invitation définie pour ce contexte"
    };
  } catch (error: any) {
    console.error('Exception lors de l\'envoi de l\'invitation:', error);
    return {
      success: false,
      message: `Exception: ${error.message || "Erreur inconnue"}`
    };
  }
};

/**
 * Encapsule tout le processus de création et d'invitation
 */
export const createUserWithInvitation = async (
  context: UserCreationContext,
  userData: UserCreationData
): Promise<{ success: boolean; userId?: string; message?: string; error?: any }> => {
  // 1. Créer l'utilisateur
  const createResult = await createUserWithContext(context, userData);
  
  // Afficher un toast pour la création
  if (createResult.success) {
    toast.success("Utilisateur créé avec succès", {
      description: `Le compte a été créé pour ${userData.email}`
    });
  } else {
    toast.error("Échec de la création du compte", {
      description: createResult.message
    });
    return createResult;
  }
  
  // 2. Envoyer l'invitation si la création a réussi
  if (createResult.success && createResult.userId) {
    const inviteResult = await sendContextualInvitation(
      createResult.userId,
      userData.email,
      context,
      userData.password,
      {
        name: userData.name,
        company: userData.company,
        ...userData.additionalMetadata
      }
    );
    
    // Afficher un toast pour l'invitation
    if (inviteResult.success) {
      toast.success("Invitation envoyée", {
        description: "Un email d'invitation a été envoyé à l'utilisateur"
      });
    } else {
      toast.warning("Utilisateur créé mais problème d'invitation", {
        description: inviteResult.message
      });
    }
    
    return {
      ...createResult,
      message: `${createResult.message}. ${inviteResult.message}`
    };
  }
  
  return createResult;
};
