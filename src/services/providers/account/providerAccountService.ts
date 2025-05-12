
import { generateTemporaryPassword } from './passwordGenerator';
import { checkUserExists, createUserRole, createAuthUser } from './userManagement';
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
    
    // 1. Check if the email already exists in Auth
    const userExists = await checkUserExists(params.email);
    
    if (userExists) {
      console.log("User already exists:", params.email);
      return {
        success: false,
        message: "Un utilisateur avec cet email existe déjà dans le système",
        emailSent: false,
      };
    }
    
    // 2. Generate a temporary password
    const tempPassword = generateTemporaryPassword();
    console.log("Generated temporary password (masked):", "*".repeat(tempPassword.length));
    
    // 3. Create the user in Auth using the edge function
    const { data: authResult, error: createError } = await createAuthUser(
      params.email,
      tempPassword,
      {
        nome: params.nome,
        empresa: params.empresa,
        is_provider: true,
        password_reset_required: true,
        first_login: true
      },
      "provider"  // Ajout de l'argument role manquant
    );
    
    if (createError) {
      console.error("Error creating user:", createError);
      return {
        success: false,
        message: `Échec de la création: ${createError.message || 'Erreur inconnue'}`,
        emailSent: false,
      };
    }
    
    if (!authResult || !authResult.user) {
      console.error("No user data returned from createAuthUser");
      return {
        success: false,
        message: "Échec de la création: Aucune donnée utilisateur retournée",
        emailSent: false,
      };
    }
    
    const userId = authResult.user.id;
    console.log("User created successfully:", userId);
    
    // 4. Create provider role for the user
    const roleCreated = await createUserRole(userId, "provider", true);
    
    if (!roleCreated) {
      console.warn("Failed to create role, but continuing with account creation");
    }
    
    // 5. Send invitation email
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
      emailError: emailResult.emailError
    };

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
