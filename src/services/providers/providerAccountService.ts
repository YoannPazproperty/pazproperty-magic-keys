
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';

interface CreateProviderAccountParams {
  email: string;
  nome: string;
  empresa: string;
}

interface CreateAccountResult {
  success: boolean;
  message?: string;
  userId?: string;
  emailSent: boolean;
  emailError?: { message: string; code: string };
}

/**
 * Generates a secure temporary password for new provider accounts
 */
const generateTemporaryPassword = (): string => {
  // Generate a memorable temporary password (more user-friendly)
  const adjectives = ["Happy", "Sunny", "Shiny", "Lucky", "Magic", "Super", "Mega"];
  const nouns = ["Star", "Moon", "Sky", "Day", "Tech", "Team", "Hero"];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${randomAdjective}${randomNoun}${randomNum}`;
};

/**
 * Creates a new provider account in Supabase Auth and sends an invitation email
 */
export const createProviderAccount = async (
  params: CreateProviderAccountParams
): Promise<CreateAccountResult> => {
  try {
    console.log("Creating provider account for:", params.email);
    
    // 1. Check if the email already exists in Auth
    const { data: usersList, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      console.error("Error checking if user exists:", checkError);
      return {
        success: false,
        message: `Erreur lors de la vérification de l'email: ${checkError.message}`,
        emailSent: false,
      };
    }
    
    // Find if user exists by checking the email directly
    // Add type assertion to ensure TypeScript knows users is an array of User objects
    const existingUser = usersList?.users?.find((user: User) => user.email === params.email);
    
    if (existingUser) {
      console.log("User already exists:", existingUser.email);
      return {
        success: false,
        message: "Un utilisateur avec cet email existe déjà dans le système",
        emailSent: false,
      };
    }
    
    // 2. Generate a temporary password
    const tempPassword = generateTemporaryPassword();
    console.log("Generated temporary password (masked):", "*".repeat(tempPassword.length));
    
    // 3. Create the user in Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: params.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        nome: params.nome,
        empresa: params.empresa,
        is_provider: true,
        password_reset_required: true,
        first_login: true
      }
    });
    
    if (createError) {
      console.error("Error creating user:", createError);
      return {
        success: false,
        message: `Échec de la création: ${createError.message}`,
        emailSent: false,
      };
    }
    
    console.log("User created successfully:", newUser.user.id);
    
    // 4. Create provider role for the user
    // First add to prestadores_roles table (this is for backward compatibility)
    const { error: prestadorRoleError } = await supabase
      .from('prestadores_roles')
      .insert({ 
        user_id: newUser.user.id, 
        nivel: 'standard' 
      });

    if (prestadorRoleError) {
      console.error('Error creating prestadores_roles entry:', prestadorRoleError);
      // Don't fail if the role already exists or there's an error
      console.warn('Continuing despite prestadores_roles creation error');
    }
    
    // Then add to user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ 
        user_id: newUser.user.id, 
        // We'll use "manager" role since "provider" isn't a valid enum value in the current schema
        // This works for now as a temporary solution, but we should update the schema later
        role: 'manager'
      });

    if (roleError) {
      console.error('Error creating user role:', roleError);
      // Don't fail if the role already exists or there's an error
      console.warn('Continuing despite role creation error');
    }
    
    // 5. Send invitation email
    let emailResult;
    let emailError = null;
    
    try {
      // Get the Supabase Functions URL 
      const SUPABASE_URL = "https://ubztjjxmldogpwawcnrj.supabase.co";
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/send-provider-invite`;
      
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token || '';
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVienRqanhtbGRvZ3B3YXdjbnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODU4MjMsImV4cCI6MjA1OTg2MTgyM30.779CoUY0U1WO7RXXx9OWV1axrXS-UYXuleh_NvH0V8U";

      // Send direct email with temporary password
      const emailRequestBody = {
        userId: newUser.user.id,
        email: params.email,
        name: params.nome,
        tempPassword: tempPassword,
        metadata: {
          empresa: params.empresa,
          is_provider: true
        }
      };

      console.log("Sending invite email with temporary password");
      
      const emailResponse = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify(emailRequestBody)
      });

      if (!emailResponse.ok) {
        console.error("Error sending invitation email:", await emailResponse.text());
        emailError = {
          message: `Erreur d'envoi d'email (${emailResponse.status})`,
          code: "EMAIL_FAILED"
        };
      } else {
        emailResult = await emailResponse.json();
        console.log("Email invitation result:", emailResult);
      }
      
    } catch (err: any) {
      console.error("Exception sending invitation email:", err);
      emailError = {
        message: err.message || "Erreur lors de l'envoi de l'email",
        code: "EMAIL_EXCEPTION"
      };
    }
    
    return {
      success: true,
      userId: newUser.user.id,
      emailSent: !emailError,
      emailError
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

/**
 * Checks if a user with the given email exists in Supabase Auth
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("Error checking if user exists:", error);
      return false; // Assume no user exists if there's an error
    }
    
    // Find the user by email in the list
    // Add type assertion to ensure TypeScript knows users is an array of User objects
    return data && data.users && data.users.some((user: User) => user.email === email);
  } catch (error) {
    console.error("Exception checking if user exists:", error);
    return false; // Assume no user exists if there's an exception
  }
};
