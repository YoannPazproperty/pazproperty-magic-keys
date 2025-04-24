
import { Resend } from 'npm:resend@2.0.0';

export async function sendInvitationEmail(
  resend: Resend,
  to: string,
  nome: string,
  isNewUser: boolean,
  tempPassword?: string,
  siteUrl?: string
) {
  const publicSiteUrl = siteUrl || 'https://pazproperty.pt';
  
  let emailHtml: string;
  
  if (!isNewUser) {
    emailHtml = `
      <h1>Bem-vindo ao Extranet Técnica da PAZ Property</h1>
      <p>Olá ${nome},</p>
      <p>Sua empresa foi adicionada como prestador de serviços na PAZ Property.</p>
      <p>Você pode acessar o Extranet Técnica com o email que já está registrado no sistema.</p>
      <p>Por favor, acesse <a href="${publicSiteUrl}/extranet-technique">aqui</a> e faça login.</p>
      <p>Se você esqueceu sua senha, pode usar a opção "Esqueci minha senha" na página de login.</p>
      <p>Atenciosamente,<br>Equipe PAZ Property</p>
    `;
  } else {
    emailHtml = `
      <h1>Bem-vindo ao Extranet Técnica da PAZ Property</h1>
      <p>Olá ${nome},</p>
      <p>A sua conta foi criada no Extranet Técnica da PAZ Property.</p>
      <p>Aqui estão suas credenciais de acesso:</p>
      <ul>
        <li>Email: ${to}</li>
        <li>Senha temporária: ${tempPassword}</li>
      </ul>
      <p>Por favor, acesse <a href="${publicSiteUrl}/extranet-technique">aqui</a> e faça login com essas credenciais.</p>
      <p>Por razões de segurança, recomendamos que você altere sua senha após o primeiro acesso.</p>
      <p>Atenciosamente,<br>Equipe PAZ Property</p>
    `;
  }

  try {
    const { data: emailData, error: sendError } = await resend.emails.send({
      from: 'PAZ Property <contact@pazproperty.pt>',
      to: [to],
      subject: 'Acesso ao Extranet Técnica - PAZ Property',
      html: emailHtml,
    });

    if (sendError) {
      console.error('Error sending email:', sendError);
      throw sendError;
    }

    console.log('Email sent successfully', emailData);
    return emailData;
  } catch (emailError) {
    console.error('Exception when sending email:', emailError);
    throw emailError;
  }
}
