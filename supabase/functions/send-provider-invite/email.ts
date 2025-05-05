import { Resend } from 'npm:resend@2.0.0';
import { emailSignature } from './signature.ts';

const formatEmailWithSignature = (content: string) => `
  ${content}
  ${emailSignature}
`;

export const sendInvitationEmail = async (
  email: string,
  isNewUser: boolean,
  tempPassword?: string
) => {
  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const baseUrl = Deno.env.get("BASE_URL") || "https://pazproperty.pt";
    const loginUrl = `${baseUrl}/auth?provider=true`;
    const resetPasswordUrl = `${baseUrl}/auth/reset-password?provider=true`;

    if (isNewUser && tempPassword) {
      // Email pour un nouvel utilisateur avec mot de passe temporaire
      const { data, error } = await resend.emails.send({
        from: "PAZ Property <noreply@pazproperty.pt>",
        to: email,
        subject: "Suas credenciais de acesso - PAZ Property",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bem-vindo ao Extranet Técnica da PAZ Property!</h2>
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
            <p>Após o primeiro acesso, você será redirecionado para alterar sua senha.</p>
            <p>Se você tiver alguma dúvida, por favor entre em contato com a PAZ Property.</p>
            <p>Atenciosamente,<br>Equipe PAZ Property</p>
          </div>
        `
      });

      if (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
        throw error;
      }

      return data;
    } else {
      // Email pour un utilisateur existant
      const { data, error } = await resend.emails.send({
        from: "PAZ Property <noreply@pazproperty.pt>",
        to: email,
        subject: "Acesso ao Extranet Técnica - PAZ Property",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Acesso ao Extranet Técnica da PAZ Property</h2>
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
        `
      });

      if (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
        throw error;
      }

      return data;
    }
  } catch (error) {
    console.error("Exception lors de l'envoi de l'email:", error);
    throw error;
  }
};
