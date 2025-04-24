
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
        email: provider.email
      })

    if (userCheckError) {
      console.error('Error checking existing users:', userCheckError)
    } else if (existingUsers && existingUsers.users && existingUsers.users.length > 0) {
      console.log('User already exists with this email')
      
      // We can either update the existing user or inform that the user already exists
      // For now, let's just continue and update their role if needed
    }

    // Create temporary password
    const tempPassword = crypto.randomUUID().split('-')[0]

    console.log('Creating or updating user account')
    
    // Create Supabase user or update if exists
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

    console.log(`User created/updated with ID: ${authData.user.id}`)

    // Check if role already exists for this user
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', authData.user.id)
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
          user_id: authData.user.id,
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
    
    // Send email with credentials
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'PAZ Property <onboarding@resend.dev>',
      to: [provider.email],
      subject: 'Acesso ao Extranet Técnica - PAZ Property',
      html: `
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
      `,
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      throw new Error(`Error sending email: ${emailError}`)
    }

    console.log('Email sent successfully', emailData)

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-provider-invite function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
