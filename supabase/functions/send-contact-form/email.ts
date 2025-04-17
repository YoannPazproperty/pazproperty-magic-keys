
import { Resend } from "npm:resend@2.0.0";
import { ContactFormData, ProcessResult } from "./types.ts";

// Email sending function
export async function sendEmails(formData: ContactFormData): Promise<ProcessResult> {
  console.log("📧 Starting email sending process...");
  
  try {
    // Get the Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("❌ RESEND_API_KEY environment variable not found");
      return {
        success: false,
        error: "Email configuration error: RESEND_API_KEY not found"
      };
    }
    
    console.log("✅ Resend API key found");
    
    // Initialize Resend
    const resend = new Resend(resendApiKey);
    
    // Recipients
    const recipient1 = "alexa@pazproperty.pt";
    const recipient2 = "yoann@pazproperty.pt";
    console.log("📧 Recipients:", [recipient1, recipient2]);
    
    // Email template to company
    const html = `
      <h1>Nouveau contact via le site web</h1>
      <p><strong>Nom :</strong> ${formData.nome}</p>
      <p><strong>Email :</strong> ${formData.email}</p>
      <p><strong>Téléphone :</strong> ${formData.telefone || "Non fourni"}</p>
      <p><strong>Type :</strong> ${formData.tipo === 'proprietario' ? 'Propriétaire' : 'Locataire'}</p>
      <p><strong>Message :</strong></p>
      <p>${formData.mensagem.replace(/\n/g, "<br>")}</p>
    `;
    
    try {
      // Send company email
      const emailParams = {
        from: "contact@pazproperty.pt",
        to: [recipient1, recipient2],
        subject: "Nouveau formulaire de contact du site web",
        html: html,
        reply_to: formData.email,
      };
      
      console.log("📤 Sending company email with params:", JSON.stringify(emailParams));
      const emailResponse = await resend.emails.send(emailParams);
      console.log("✅ Email to company sent, response:", emailResponse);
      
      // Send confirmation to customer
      const confirmationParams = {
        from: "contact@pazproperty.pt",
        to: [formData.email],
        subject: "Nous avons bien reçu votre message - PAZ Property",
        html: `
          <h1>Merci pour votre message, ${formData.nome} !</h1>
          <p>Nous avons bien reçu votre message et nous vous recontacterons bientôt.</p>
          <p>Cordialement,<br>L'équipe PAZ Property</p>
        `,
      };
      
      console.log("📤 Sending confirmation email with params:", JSON.stringify(confirmationParams));
      const confirmationResponse = await resend.emails.send(confirmationParams);
      console.log("✅ Confirmation email sent, response:", confirmationResponse);
      
      return {
        success: true,
        details: {
          companyEmail: emailResponse,
          confirmationEmail: confirmationResponse
        }
      };
    } catch (emailError: any) {
      console.error("❌ Email sending error:", emailError);
      
      // Try with fallback sender if needed
      try {
        console.log("⚠️ Attempting to use default Resend sender address as fallback");
        
        // Fallback for company email
        const fallbackEmailParams = {
          from: "onboarding@resend.dev",
          to: [recipient1, recipient2],
          subject: "Nouveau formulaire de contact du site web",
          html: html,
          reply_to: formData.email,
        };
        
        console.log("📤 Sending fallback company email");
        const fallbackResponse = await resend.emails.send(fallbackEmailParams);
        console.log("✅ Fallback email to company sent, response:", fallbackResponse);
        
        // Fallback for confirmation
        const fallbackConfirmationParams = {
          from: "onboarding@resend.dev",
          to: [formData.email],
          subject: "Nous avons bien reçu votre message - PAZ Property",
          html: `
            <h1>Merci pour votre message, ${formData.nome} !</h1>
            <p>Nous avons bien reçu votre message et nous vous recontacterons bientôt.</p>
            <p>Cordialement,<br>L'équipe PAZ Property</p>
          `,
        };
        
        const fallbackConfirmationResponse = await resend.emails.send(fallbackConfirmationParams);
        console.log("✅ Fallback confirmation email sent");
        
        return {
          success: true,
          details: {
            fallback: true,
            companyEmail: fallbackResponse,
            confirmationEmail: fallbackConfirmationResponse
          }
        };
      } catch (fallbackError: any) {
        console.error("❌ Fallback email sending error:", fallbackError);
        return {
          success: false,
          error: "Failed to send emails even with fallback",
          details: {
            originalError: emailError.message,
            fallbackError: fallbackError.message
          }
        };
      }
    }
  } catch (resendError: any) {
    console.error("❌ Resend initialization error:", resendError);
    return {
      success: false,
      error: "Failed to initialize Resend",
      details: resendError.message
    };
  }
}
