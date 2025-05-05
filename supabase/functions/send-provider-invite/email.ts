
import { Resend } from 'npm:resend@2.0.0';
import { emailSignature } from './signature.ts';

const formatEmailWithSignature = (content: string) => `
  ${content}
  ${emailSignature}
`;

export const sendInvitationEmail = async (
  resend: Resend,
  email: string,
  name: string,
  isNewUser: boolean,
  tempPassword?: string,
  baseUrl?: string
) => {
  try {
    const siteUrl = baseUrl || Deno.env.get("PUBLIC_SITE_URL") || "https://pazproperty.pt";
    const loginUrl = `${siteUrl}/auth?provider=true`;
    const resetPasswordUrl = `${siteUrl}/auth/reset-password?provider=true`;

    console.log("Email preparation:", {
      isNewUser,
      hasTempPassword: !!tempPassword,
      siteUrl,
      loginUrl,
      resetPasswordUrl
    });

    if (isNewUser && tempPassword) {
      // Email for a new user with temporary password
      console.log("Using NEW USER template with temporary password");
      const { data, error } = await resend.emails.send({
        from: "PAZ Property <noreply@pazproperty.pt>",
        to: email,
        subject: "Suas credenciais de acesso - PAZ Property",
        html: formatEmailWithSignature(`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bem-vindo ao Extranet Técnica da PAZ Property!</h2>
            <p>Olá ${name},</p>
            <p>Você foi convidado para acessar o Extranet Técnica da PAZ Property.</p>
            <p>Suas credenciais de acesso são:</p>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Senha temporária:</strong> ${tempPassword}</li>
            </ul>
            <p>Por favor, acesse o sistema através do link abaixo e altere sua senha no primeiro acesso:</p>
            <p><a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar o Extranet Técnica</a></p>
            <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
            <p>${loginUrl}</p>
            <p><strong>Importante:</strong> Você precisará alterar sua senha no primeiro acesso.</p>
            <p>Se você tiver alguma dúvida, por favor entre em contato com a PAZ Property.</p>
            <p>Atenciosamente,<br>Equipe PAZ Property</p>
          </div>
        `)
      });

      if (error) {
        console.error("Erro ao enviar o email de convite (novo usuário):", error);
        throw error;
      }

      return data;
    } else {
      // Email for an existing user
      console.log("Using EXISTING USER template without password");
      const { data, error } = await resend.emails.send({
        from: "PAZ Property <noreply@pazproperty.pt>",
        to: email,
        subject: "Acesso ao Extranet Técnica - PAZ Property",
        html: formatEmailWithSignature(`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Acesso ao Extranet Técnica da PAZ Property</h2>
            <p>Olá ${name},</p>
            <p>Você foi adicionado como prestador de serviços no Extranet Técnica da PAZ Property.</p>
            <p>Para acessar o sistema, clique no link abaixo:</p>
            <p><a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar o Extranet Técnica</a></p>
            <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
            <p>${loginUrl}</p>
            <p>Se você esqueceu sua senha, você pode redefini-la através do link abaixo:</p>
            <p><a href="${resetPasswordUrl}" style="color: #4CAF50;">Redefinir senha</a></p>
            <p>Se você tiver alguma dúvida, por favor entre em contato com a PAZ Property.</p>
            <p>Atenciosamente,<br>Equipe PAZ Property</p>
          </div>
        `)
      });

      if (error) {
        console.error("Erro ao enviar o email de convite (usuário existente):", error);
        throw error;
      }

      return data;
    }
  } catch (error) {
    console.error("Exceção ao enviar o email:", error);
    throw error;
  }
};
