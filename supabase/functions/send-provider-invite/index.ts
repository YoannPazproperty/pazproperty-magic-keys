
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize clients with environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://pazproperty.pt'

    // Check if required environment variables are set
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set')
      throw new Error('Email service configuration is missing')
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set')
      throw new Error('Database configuration is missing')
    }

    const resend = new Resend(resendApiKey)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { providerId } = await req.json()

    if (!providerId) {
      throw new Error('Provider ID is required')
    }

    console.log(`Processing invitation for provider ID: ${providerId}`)

    // Get provider info
    const { data: provider, error: providerError } = await supabase
      .from('prestadores_de_servicos')
      .select('*')
      .eq('id', providerId)
      .single()

    if (providerError) {
      console.error('Provider query error:', providerError)
      throw new Error(`Provider not found: ${providerError.message}`)
    }

    if (!provider) {
      throw new Error('Provider not found')
    }

    console.log(`Provider found: ${provider.empresa}, Email: ${provider.email}`)

    // Check if email exists
    if (!provider.email) {
      throw new Error('Provider email is missing')
    }

    // Check if user already exists
    const { data: existingUsers, error: userCheckError } = await supabase.auth.admin
      .listUsers({
        filter: {
          email: provider.email
        }
      })

    if (userCheckError) {
      console.error('Error checking existing users:', userCheckError)
    } 
    
    let userId: string | undefined;
    
    if (existingUsers && existingUsers.users && existingUsers.users.length > 0) {
      console.log('User already exists with this email')
      // Store the existing user ID for updating
      userId = existingUsers.users[0].id;
      // We'll update their role if needed, but we won't reset their password
    }

    // Create temporary password only for new users
    const tempPassword = crypto.randomUUID().split('-')[0]
    
    console.log('Creating or updating user account')

    try {
      // If user exists, update their metadata
      if (userId) {
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          {
            user_metadata: {
              provider_id: providerId,
              nome: provider.nome_gerente,
              empresa: provider.empresa
            }
          }
        )
        
        if (updateError) {
          console.error('Error updating user metadata:', updateError)
          throw new Error(`Error updating user metadata: ${updateError.message}`)
        }
        
        console.log(`User metadata updated for ID: ${userId}`)
      } else {
        // Create new user if doesn't exist
        const { data: authData, error: createUserError } = await supabase.auth.admin.createUser({
          email: provider.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            provider_id: providerId,
            nome: provider.nome_gerente,
            empresa: provider.empresa
          }
        })
        
        if (createUserError) {
          console.error('Error creating user:', createUserError)
          throw new Error(`Error creating user: ${createUserError.message}`)
        }
        
        if (!authData || !authData.user) {
          throw new Error('Failed to create user account')
        }
        
        userId = authData.user.id
        console.log(`New user created with ID: ${userId}`)
      }
    } catch (error) {
      console.error('Error managing user account:', error)
      throw error
    }

    if (!userId) {
      throw new Error('Failed to obtain user ID')
    }
    
    // Check if role already exists for this user
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'manager')
      .single()

    if (roleCheckError && roleCheckError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing role:', roleCheckError)
    }

    // Add user role as 'manager' if it doesn't exist already
    if (!existingRole) {
      console.log('Adding manager role to user')
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'manager'
        })

      if (roleError) {
        console.error('Error setting user role:', roleError)
        throw new Error(`Error setting user role: ${roleError.message}`)
      }
    } else {
      console.log('User already has manager role')
    }

    console.log('Sending invitation email')
    
    // Only send password reset email for new users, existing users keep their password
    let emailHtml;
    
    if (existingUsers && existingUsers.users && existingUsers.users.length > 0) {
      // For existing users, don't include the temporary password
      emailHtml = `
        <h1>Bem-vindo ao Extranet Técnica da PAZ Property</h1>
        <p>Olá ${provider.nome_gerente},</p>
        <p>Sua empresa foi adicionada como prestador de serviços na PAZ Property.</p>
        <p>Você pode acessar o Extranet Técnica com o email que já está registrado no sistema.</p>
        <p>Por favor, acesse <a href="${publicSiteUrl}/extranet-technique">aqui</a> e faça login.</p>
        <p>Se você esqueceu sua senha, pode usar a opção "Esqueci minha senha" na página de login.</p>
        <p>Atenciosamente,<br>Equipe PAZ Property</p>
      `
    } else {
      // For new users, include the temporary password
      emailHtml = `
        <h1>Bem-vindo ao Extranet Técnica da PAZ Property</h1>
        <p>Olá ${provider.nome_gerente},</p>
        <p>A sua conta foi criada no Extranet Técnica da PAZ Property.</p>
        <p>Aqui estão suas credenciais de acesso:</p>
        <ul>
          <li>Email: ${provider.email}</li>
          <li>Senha temporária: ${tempPassword}</li>
        </ul>
        <p>Por favor, acesse <a href="${publicSiteUrl}/extranet-technique">aqui</a> e faça login com essas credenciais.</p>
        <p>Por razões de segurança, recomendamos que você altere sua senha após o primeiro acesso.</p>
        <p>Atenciosamente,<br>Equipe PAZ Property</p>
      `
    }
    
    let emailResult = null;
    let emailError = null;
    let wasEmailSent = false;
    
    try {
      // Send email with credentials
      const { data: emailData, error: sendError } = await resend.emails.send({
        from: 'PAZ Property <onboarding@resend.dev>',
        to: [provider.email],
        subject: 'Acesso ao Extranet Técnica - PAZ Property',
        html: emailHtml,
      });

      if (sendError) {
        console.error('Error sending email:', sendError);
        emailError = sendError;
      } else {
        console.log('Email sent successfully', emailData);
        emailResult = emailData;
        wasEmailSent = true;
      }
    } catch (emailSendError) {
      console.error('Exception when sending email:', emailSendError);
      emailError = {
        message: emailSendError.message || "Unknown email error",
        statusCode: emailSendError.statusCode || 500
      };
    }

    // Return success even if email sending fails
    // This way the user account is still created/updated
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: wasEmailSent ? 'Invitation sent successfully' : 'User account created/updated but email could not be sent',
        isNewUser: !(existingUsers && existingUsers.users && existingUsers.users.length > 0),
        emailSent: wasEmailSent,
        emailError: emailError ? {
          message: emailError.message,
          code: emailError.statusCode || 'UNKNOWN'
        } : null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-provider-invite function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unknown error occurred',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200  // Return 200 even with errors, to avoid CORS issues
      }
    )
  }
})
