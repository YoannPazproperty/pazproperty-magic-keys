
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { Resend } from 'npm:resend@2.0.0';
import { getProviderData, getUserByEmail, updateUserMetadata, createUser, ensureUserRole } from './db/index.ts';
import { sendInvitationEmail } from './email.ts';

/**
 * Processes the provider invitation by handling user account management
 * and sending invitation emails
 */
export async function processProviderInvite(
  supabase: SupabaseClient,
  resend: Resend,
  providerId: string,
  publicSiteUrl: string
) {
  try {
    // Get provider info
    const provider = await getProviderData(supabase, providerId);
    console.log(`Provider found: ${provider.empresa}, Email: ${provider.email}`);

    // Check if email exists
    if (!provider.email) {
      console.error("Provider has no email");
      throw new Error('Provider email is missing');
    }

    // Check if user exists and handle account creation/update
    const existingUser = await getUserByEmail(supabase, provider.email);
    console.log("User check:", existingUser ? "User exists" : "User does not exist");
    
    let userId: string;
    let tempPassword: string | undefined;
    const isNewUser = !existingUser;
    
    // Generate temporary password only for new users - Generate an easier-to-remember password
    if (isNewUser) {
      // Generate a simpler and more memorable temporary password
      const adjectives = ["Happy", "Sunny", "Shiny", "Lucky", "Magic", "Super", "Mega"];
      const nouns = ["Star", "Moon", "Sky", "Day", "Tech", "Team", "Hero"];
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      const randomNum = Math.floor(Math.random() * 1000);
      tempPassword = `${randomAdjective}${randomNoun}${randomNum}`;
      console.log(`Generated memorable temporary password for new user (masked): ${tempPassword.slice(0, 2)}****`);
    }

    try {
      if (existingUser) {
        userId = existingUser.id;
        console.log(`Updating existing user metadata for user: ${userId}`);
        await updateUserMetadata(supabase, userId, {
          provider_id: providerId,
          nome: provider.nome_gerente,
          empresa: provider.empresa
        });
        console.log("User metadata updated successfully");
      } else {
        if (!tempPassword) {
          throw new Error('No temporary password generated for new user');
        }
        console.log(`Creating new user for email: ${provider.email}`);
        console.log("Using temporary password (masked):", "*".repeat(tempPassword?.length || 0));
        const newUser = await createUser(supabase, provider.email, tempPassword, {
          provider_id: providerId,
          nome: provider.nome_gerente,
          empresa: provider.empresa
        });
        userId = newUser.id;
        console.log(`New user created with ID: ${userId}`);
      }

      // Ensure user has prestadores_tecnicos role
      console.log(`Ensuring user ${userId} has prestadores_tecnicos role`);
      await ensureUserRole(supabase, userId, 'prestadores_tecnicos');
      console.log("prestadores_tecnicos role assigned successfully");

      // Send invitation email
      let emailResult = null;
      let emailError = null;
      let wasEmailSent = false;

      try {
        console.log("Sending invitation email");
        console.log("Email parameters:", {
          to: provider.email,
          name: provider.nome_gerente,
          isNewUser: isNewUser,
          hasPassword: !!tempPassword,
          publicSiteUrl
        });
        
        emailResult = await sendInvitationEmail(
          resend,
          provider.email,
          provider.nome_gerente,
          isNewUser,
          tempPassword,
          publicSiteUrl
        );
        wasEmailSent = true;
        console.log("Email sent successfully, result:", emailResult);
      } catch (emailErr: any) {
        console.error('Error sending invitation email:', emailErr);
        console.error('Error details:', emailErr.message);
        if (emailErr.response) console.error('API response:', emailErr.response);
        emailError = {
          message: emailErr.message || "Unknown email error",
          statusCode: emailErr.statusCode || 500
        };
      }

      return {
        success: true,
        message: wasEmailSent ? 'Invitation sent successfully' : 'User account created/updated but email could not be sent',
        isNewUser: isNewUser,
        emailSent: wasEmailSent,
        emailTemplate: isNewUser ? 'new_user' : 'existing_user',
        passwordGenerated: isNewUser && !!tempPassword,
        emailError: emailError ? {
          message: emailError.message,
          code: emailError.statusCode || 'UNKNOWN'
        } : null
      };
    } catch (accountError) {
      console.error('Error managing user account:', accountError);
      throw accountError;
    }
  } catch (providerError) {
    console.error('Error processing provider data:', providerError);
    throw providerError;
  }
}
