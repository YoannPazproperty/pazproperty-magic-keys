
import { generateTemporaryPassword } from './passwordGenerator';
import { checkUserExists, createUserRole, createAuthUser, ensureUserWithRole } from './userManagement';
import { sendProviderInviteEmail } from './emailService';
import { CreateProviderAccountParams, CreateAccountResult } from './types';

/**
 * Creates a new provider account in Supabase Auth and sends an invitation email
 */
export const createProviderAccount = async (
  params: CreateProviderAccountParams
): Promise<CreateAccountResult> => {
  try {
    console.log("Creating provider account for:", params.email);
    
    // Generate a temporary password (we'll need it whether the user exists or not)
    const tempPassword = generateTemporaryPassword();
    console.log("Generated temporary password (masked):", "*".repeat(tempPassword.length));
    
    // Try to ensure the user has the provider role, creating them if they don't exist
    const ensureResult = await ensureUserWithRole(
      params.email,
      tempPassword,
      {
        nome: params.nome,
        empresa: params.empresa,
        is_provider: true,
        password_reset_required: true,
        first_login: true
      },
      "provider"
    );
    
    if (!ensureResult.success) {
      console.error("Failed to ensure user role:", ensureResult.message);
      return {
        success: false,
        message: ensureResult.message || "Échec lors de la création ou mise à jour de l'utilisateur",
        emailSent: false
      };
    }
    
    const userId = ensureResult.userId;
    if (!userId) {
      console.error("No user ID returned from ensureUserWithRole");
      return {
        success: false,
        message: "Erreur interne: Aucun ID utilisateur retourné",
        emailSent: false
      };
    }
    
    console.log(`User ${ensureResult.message?.includes("maintenant") ? "updated with" : "created with"} ID:`, userId);
    
    // Send invitation email with temporary password
    // Only send if this is a new user or we've reset their password
    const shouldSendEmail = !ensureResult.message?.includes("maintenant");
    
    if (shouldSendEmail) {
      console.log("Sending invitation email to new or password-reset user");
      const emailResult = await sendProviderInviteEmail(
        userId,
        params.email,
        params.nome,
        tempPassword,
        {
          empresa: params.empresa,
          is_provider: true
        }
      );
      
      return {
        success: true,
        userId: userId,
        emailSent: emailResult.success,
        emailError: emailResult.emailError,
        message: ensureResult.message
      };
    } else {
      console.log("User already exists with proper role, no email needed");
      return {
        success: true,
        userId: userId,
        emailSent: false,
        message: "L'utilisateur dispose déjà du rôle prestataire et son mot de passe n'a pas été modifié"
      };
    }

  } catch (error: any) {
    console.error("General exception in createProviderAccount:", error);
    return {
      success: false,
      message: `Exception: ${error.message || "Erreur inconnue"}`,
      emailSent: false
    };
  }
};

// Re-export utility functions
export { checkUserExists } from './userManagement';
