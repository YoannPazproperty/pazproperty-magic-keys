
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteProviderRequest {
  providerId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { providerId } = await req.json() as InviteProviderRequest

    // Get provider info
    const { data: provider, error: providerError } = await supabase
      .from('prestadores_de_servicos')
      .select('*')
      .eq('id', providerId)
      .single()

    if (providerError || !provider) {
      throw new Error('Provider not found')
    }

    // Create temporary password
    const tempPassword = crypto.randomUUID().split('-')[0]

    // Create Supabase user
    const { data: authData, error: createUserError } = await supabase.auth.admin.createUser({
      email: provider.email,
      password: tempPassword,
      email_confirm: true
    })

    if (createUserError) {
      throw new Error(`Error creating user: ${createUserError.message}`)
    }

    // Add user role as 'manager'
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'manager'
      })

    if (roleError) {
      throw new Error(`Error setting user role: ${roleError.message}`)
    }

    // Send email with credentials
    const { error: emailError } = await resend.emails.send({
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
        <p>Por favor, acesse <a href="${Deno.env.get('PUBLIC_SITE_URL')}/extranet-technique">aqui</a> e faça login com essas credenciais.</p>
        <p>Por razões de segurança, recomendamos que você altere sua senha após o primeiro acesso.</p>
        <p>Atenciosamente,<br>Equipe PAZ Property</p>
      `,
    })

    if (emailError) {
      throw new Error(`Error sending email: ${emailError}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
