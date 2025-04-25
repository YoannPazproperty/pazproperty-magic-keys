
import { Resend } from 'npm:resend@2.0.0';
import { emailSignature } from './signature.ts';

const formatEmailWithSignature = (content: string) => `
  ${content}
  ${emailSignature}
`;

export async function sendInvitationEmail(
  resend: Resend,
  to: string,
  nome: string,
  isNewUser: boolean,
  tempPassword?: string,
  siteUrl?: string
) {
  console.log(`Preparing invitation email for ${to}, isNewUser: ${isNewUser}`);
  
  // Corriger l'URL du site en supprimant le slash final s'il existe
  const publicSiteUrl = (siteUrl || 'https://pazproperty.pt').replace(/\/$/, '');
  
  // URLs spécifiques pour les différents cas
  const loginUrl = `${publicSiteUrl}/extranet-technique-login`;
  const resetUrl = `${publicSiteUrl}/auth?provider=true&tab=forgot-password&email=${encodeURIComponent(to)}&force_reset=true`;
  
  console.log(`Using login URL for provider: ${loginUrl}`);
  
  let emailHtml: string;
  let emailSubject: string;
  
  if (!isNewUser) {
    console.log("Generating email for existing provider");
    emailSubject = "Acesso ao Extranet Técnica - PAZ Property";
    emailHtml = formatEmailWithSignature(`
      <h1>Bem-vindo ao Extranet Técnica da PAZ Property</h1>
      <p>Olá ${nome},</p>
      <p>Sua empresa foi adicionada como prestador de serviços na PAZ Property.</p>
      <p>Você pode acessar o Extranet Técnica com o email que já está registrado no sistema.</p>
      <p>Se você esqueceu sua senha, por favor <a href="${resetUrl}">clique aqui para redefini-la</a>.</p>
      <p><strong>Importante:</strong> Após clicar no link, você será redirecionado para uma página onde você deverá definir uma nova senha. Esta etapa é obrigatória para garantir a segurança da sua conta.</p>
      <p>Caso você se lembre da sua senha, pode <a href="${loginUrl}">fazer login diretamente aqui</a>.</p>
      <p>Atenciosamente,<br>Equipe PAZ Property</p>
    `);
  } else {
    console.log("Generating email for new provider with temp password");
    emailSubject = "Suas credenciais de acesso - PAZ Property";
    emailHtml = formatEmailWithSignature(`
      <h1>Bem-vindo ao Extranet Técnica da PAZ Property</h1>
      <p>Olá ${nome},</p>
      <p>A sua conta foi criada no Extranet Técnica da PAZ Property.</p>
      <p>Aqui estão suas credenciais de acesso:</p>
      <ul>
        <li>Email: ${to}</li>
        <li>Senha temporária: ${tempPassword}</li>
      </ul>
      <p>Por favor, acesse <a href="${loginUrl}">aqui</a> e faça login com essas credenciais.</p>
      <p><strong>Importante:</strong> Na primeira conexão, você será convidado a definir uma nova senha pessoal. Esta etapa é obrigatória para garantir a segurança da sua conta.</p>
      <p>Por razões de segurança, recomendamos que você não compartilhe suas credenciais com terceiros.</p>
      <p>Atenciosamente,<br>Equipe PAZ Property</p>
    `);
  }

  try {
    console.log("Sending email via Resend to:", to);
    console.log("From address: PAZ Property <contact@pazproperty.pt>");
    console.log("Email subject:", emailSubject);
    console.log("Login URL in email:", loginUrl);
    
    const { data: emailData, error: sendError } = await resend.emails.send({
      from: 'PAZ Property <contact@pazproperty.pt>',
      to: [to],
      subject: emailSubject,
      html: emailHtml,
    });

    if (sendError) {
      console.error('Error sending email via Resend API:', sendError);
      throw sendError;
    }

    console.log('Email sent successfully with ID:', emailData?.id);
    return emailData;
  } catch (emailError) {
    console.error('Exception when sending email:', emailError);
    console.error('Error details:', JSON.stringify(emailError, null, 2));
    throw emailError;
  }
}
