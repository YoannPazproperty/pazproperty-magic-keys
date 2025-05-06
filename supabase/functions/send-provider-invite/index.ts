import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { Resend } from 'npm:resend@2.0.0';
import { corsHeaders } from './cors.ts';

Deno.serve(async (req) => {
  console.log("=== START: Provider invite processing ===");
  console.log("Request URL:", req.url);
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Initialize clients with environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://pazproperty.pt';

    // Log environment variable status (not their values for security)
    console.log("Environment check:", { 
      hasResendKey: !!resendApiKey, 
      hasSupabaseUrl: !!supabaseUrl, 
      hasServiceKey: !!supabaseServiceKey,
      publicSiteUrl
    });

    // Check if required environment variables are set
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('Email service configuration is missing');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
      throw new Error('Database configuration is missing');
    }

    const resend = new Resend(resendApiKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Request body received:", {
        ...body,
        tempPassword: body.tempPassword ? "***MASKED***" : undefined
      });
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      throw new Error("Invalid request body format");
    }
    
    // Handle different invitation methods
    let result;
    
    // If we have a direct userId, email and password, send direct invitation
    if (body.userId && body.email && body.tempPassword) {
      console.log(`Processing direct invitation for user ID: ${body.userId}`);
      result = await sendDirectInvitation(resend, body, publicSiteUrl);
    } 
    // Otherwise use the original providerId based flow
    else if (body.providerId) {
      console.log(`Processing provider invitation for provider ID: ${body.providerId}`);
      result = await processProviderInvite(supabase, resend, body.providerId, publicSiteUrl);
    }
    else {
      throw new Error('Invalid request parameters - Either providerId OR userId+email+tempPassword must be provided');
    }
    
    console.log("Sending successful response:", result);
    console.log("=== END: Provider invite processing ===");
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error: any) {
    console.error('Error in send-provider-invite function:', error);
    console.error('Error stack:', error.stack);
    console.log("=== END: Provider invite processing with error ===");
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unknown error occurred',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 even with errors, to avoid CORS issues
      }
    );
  }
});

/**
 * Sends a direct invitation to a provider with their temporary password
 */
async function sendDirectInvitation(
  resend: any,
  params: {
    userId: string,
    email: string,
    name: string,
    tempPassword: string,
    metadata?: Record<string, any>
  },
  baseUrl = "https://pazproperty.pt"
) {
  try {
    console.log(`Sending direct invitation to: ${params.email}`);
    const loginUrl = `${baseUrl}/auth?provider=true`;
    
    // Format email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bem-vindo ao Extranet Técnica da PAZ Property!</h2>
        <p>Olá ${params.name},</p>
        <p>Você foi convidado para acessar o Extranet Técnica da PAZ Property.</p>
        <p>Suas credenciais de acesso são:</p>
        <ul>
          <li><strong>Email:</strong> ${params.email}</li>
          <li><strong>Senha temporária:</strong> ${params.tempPassword}</li>
        </ul>
        <p>Por favor, acesse o sistema através do link abaixo e altere sua senha no primeiro acesso:</p>
        <p>
          <a href="${loginUrl}" 
             style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
             Acessar o Extranet Técnica
          </a>
        </p>
        <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
        <p>${loginUrl}</p>
        <p><strong>Importante:</strong> Você precisará alterar sua senha no primeiro acesso.</p>
        <p>Se você tiver alguma dúvida, por favor entre em contato com a PAZ Property.</p>
        <p>Atenciosamente,<br>Equipe PAZ Property</p>
      </div>
    `;

    // Send email
    const emailResult = await resend.emails.send({
      from: "PAZ Property <noreply@pazproperty.pt>",
      to: params.email,
      subject: "Suas credenciais de acesso - PAZ Property",
      html: emailHtml
    });
    
    console.log("Email sent successfully:", emailResult);
    
    return {
      success: true,
      message: "Invitation sent successfully",
      emailSent: true,
      isNewUser: true
    };
    
  } catch (error: any) {
    console.error('Error sending direct invitation email:', error);
    return { 
      success: false, 
      emailSent: false,
      emailError: {
        message: error.message || "Erro ao enviar email de convite",
        code: error.statusCode || "UNKNOWN"
      }
    };
  }
}

/**
 * Original provider invite flow - processes invitation using provider ID
 */
async function processProviderInvite(
  supabase: any,
  resend: any,
  providerId: string,
  publicSiteUrl: string
) {
  try {
    // Get provider info from the database
    const { data: provider, error: providerError } = await supabase
      .from('prestadores_de_servicos')
      .select('*')
      .eq('id', providerId)
      .single();
      
    if (providerError || !provider) {
      console.error("Error fetching provider:", providerError);
      throw new Error('Provider not found');
    }
    
    console.log(`Provider found: ${provider.empresa}, Email: ${provider.email}`);

    // Check if email exists
    if (!provider.email) {
      console.error("Provider has no email");
      throw new Error('Provider email is missing');
    }

    // Check if user already exists
    const { data: existingUsers, error: userError } = await supabase.auth.admin.listUsers({
      filter: `email eq '${provider.email}'`,
    });
    
    if (userError) {
      console.error("Error checking existing users:", userError);
      throw new Error('Failed to check if user exists');
    }
    
    const existingUser = existingUsers?.users?.length > 0 ? existingUsers.users[0] : null;
    console.log("User check:", existingUser ? "User exists" : "User does not exist");
    
    let userId: string;
    let tempPassword: string | undefined;
    const isNewUser = !existingUser;
    
    // Generate temporary password for new users
    if (isNewUser) {
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
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...existingUser.user_metadata,
            provider_id: providerId,
            nome: provider.nome_gerente,
            empresa: provider.empresa,
            is_provider: true
          }
        });
        
        if (updateError) {
          console.error("Error updating user metadata:", updateError);
          throw new Error(`Failed to update user metadata: ${updateError.message}`);
        }
        
        console.log("User metadata updated successfully");
      } else {
        if (!tempPassword) {
          throw new Error('No temporary password generated for new user');
        }
        
        console.log(`Creating new user for email: ${provider.email}`);
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: provider.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            provider_id: providerId,
            nome: provider.nome_gerente,
            empresa: provider.empresa,
            is_provider: true,
            first_login: true,
            password_reset_required: true
          }
        });
        
        if (createError) {
          console.error('Error creating user:', createError);
          throw new Error(`Failed to create user: ${createError.message}`);
        }
        
        userId = newUser.user.id;
        console.log(`New user created with ID: ${userId}`);
      }

      // Ensure user has provider role
      console.log(`Ensuring user ${userId} has provider role`);
      
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select()
        .eq('user_id', userId)
        .eq('role', 'provider');
        
      if (!existingRoles || existingRoles.length === 0) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: userId, 
            role: 'provider' 
          });

        if (roleError) {
          console.error('Error creating provider role:', roleError);
          // Don't fail if there's an error
          console.warn('Continuing despite role creation error');
        } else {
          console.log("Provider role assigned successfully");
        }
      } else {
        console.log("Provider role already exists");
      }

      // Send invitation email
      let emailResult = null;
      let emailError = null;
      let wasEmailSent = false;

      try {
        console.log("Sending invitation email");
        const siteUrl = publicSiteUrl || "https://pazproperty.pt";
        const loginUrl = `${siteUrl}/auth?provider=true`;
        
        let emailHtml;
        if (isNewUser && tempPassword) {
          // Email for new user with temporary password
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Bem-vindo ao Extranet Técnica da PAZ Property!</h2>
              <p>Olá ${provider.nome_gerente},</p>
              <p>Você foi convidado para acessar o Extranet Técnica da PAZ Property.</p>
              <p>Suas credenciais de acesso são:</p>
              <ul>
                <li><strong>Email:</strong> ${provider.email}</li>
                <li><strong>Senha temporária:</strong> ${tempPassword}</li>
              </ul>
              <p>Por favor, acesse o sistema através do link abaixo e altere sua senha no primeiro acesso:</p>
              <p>
                <a href="${loginUrl}" 
                   style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                   Acessar o Extranet Técnica
                </a>
              </p>
              <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
              <p>${loginUrl}</p>
              <p><strong>Importante:</strong> Você precisará alterar sua senha no primeiro acesso.</p>
              <p>Se você tiver alguma dúvida, por favor entre em contato com a PAZ Property.</p>
              <p>Atenciosamente,<br>Equipe PAZ Property</p>
            </div>
          `;
        } else {
          // Email for existing user
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Acesso ao Extranet Técnica da PAZ Property</h2>
              <p>Olá ${provider.nome_gerente},</p>
              <p>Você foi adicionado como prestador de serviços no Extranet Técnica da PAZ Property.</p>
              <p>Para acessar o sistema, clique no link abaixo:</p>
              <p>
                <a href="${loginUrl}" 
                   style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                   Acessar o Extranet Técnica
                </a>
              </p>
              <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
              <p>${loginUrl}</p>
              <p>Se você esqueceu sua senha, você pode redefini-la ao acessar o sistema.</p>
              <p>Se você tiver alguma dúvida, por favor entre em contato com a PAZ Property.</p>
              <p>Atenciosamente,<br>Equipe PAZ Property</p>
            </div>
          `;
        }

        emailResult = await resend.emails.send({
          from: "PAZ Property <noreply@pazproperty.pt>",
          to: provider.email,
          subject: isNewUser ? "Suas credenciais de acesso - PAZ Property" : "Acesso ao Extranet Técnica - PAZ Property",
          html: emailHtml
        });
        
        wasEmailSent = true;
        console.log("Email sent successfully, result:", emailResult);
        
      } catch (emailErr: any) {
        console.error('Error sending invitation email:', emailErr);
        console.error('Error details:', emailErr.message);
        if (emailErr.response) console.error('API response:', emailErr.response);
        
        emailError = {
          message: emailErr.message || "Unknown email error",
          code: emailErr.statusCode || "UNKNOWN"
        };
      }

      return {
        success: true,
        message: wasEmailSent 
          ? 'Invitation sent successfully' 
          : 'User account created/updated but email could not be sent',
        isNewUser: isNewUser,
        emailSent: wasEmailSent,
        emailTemplate: isNewUser ? 'new_user' : 'existing_user',
        passwordGenerated: isNewUser && !!tempPassword,
        emailError: emailError
      };
      
    } catch (accountError: any) {
      console.error('Error managing user account:', accountError);
      throw accountError;
    }
    
  } catch (providerError: any) {
    console.error('Error processing provider data:', providerError);
    throw providerError;
  }
}
