
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*, Authorization, X-Client-Info, Content-Type",
};

interface ContactFormData {
  nome: string;
  email: string;
  telefone: string | null;
  tipo: string;
  mensagem: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🚀 Edge function 'send-contact-form' started, method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("✅ Handling CORS preflight request");
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  if (req.method !== "POST") {
    console.error(`❌ Method ${req.method} not supported`);
    return new Response(
      JSON.stringify({ success: false, error: `Method ${req.method} not supported` }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    console.log("📥 Request received, attempting to parse body...");
    
    const bodyText = await req.text();
    console.log("📄 Raw request body:", bodyText);
    
    let formData: ContactFormData;
    try {
      formData = JSON.parse(bodyText);
      console.log("📝 Form data parsed:", formData);
      
      // Basic validation
      if (!formData.nome || !formData.email || !formData.mensagem) {
        throw new Error("Missing required fields");
      }
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid request body: ${parseError.message}`,
          receivedBody: bodyText 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Get the Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("❌ RESEND_API_KEY environment variable not found");
      return new Response(
        JSON.stringify({ success: false, error: "Missing Resend API key" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    console.log("✅ Resend API key found");
    
    // Initialize Resend
    const resend = new Resend(resendApiKey);
    
    // Get recipient emails from environment variables
    const recipient1 = Deno.env.get("alexa@pazproperty.pt") || "alexa@pazproperty.pt";
    const recipient2 = Deno.env.get("yoann@pazproperty.pt") || "yoann@pazproperty.pt";
    const recipients = [recipient1, recipient2];
    
    console.log("📧 Attempting to send email to:", recipients);
    
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
      // Send email to company
      console.log("🔄 Sending email to company...");
      
      // Use onboarding@resend.dev as sender for testing
      const emailResponse = await resend.emails.send({
        from: "PAZ Property <onboarding@resend.dev>",
        to: recipients,
        subject: "Nouveau formulaire de contact du site web",
        html: html,
        reply_to: formData.email,
      });
      
      console.log("✅ Company email response:", JSON.stringify(emailResponse));
      
      // Send confirmation to customer
      console.log("🔄 Sending confirmation to customer...");
      const confirmationResponse = await resend.emails.send({
        from: "PAZ Property <onboarding@resend.dev>",
        to: [formData.email],
        subject: "Nous avons bien reçu votre message - PAZ Property",
        html: `
          <h1>Merci pour votre message, ${formData.nome} !</h1>
          <p>Nous avons bien reçu votre message et nous vous recontacterons bientôt.</p>
          <p>Cordialement,<br>L'équipe PAZ Property</p>
        `,
      });
      
      console.log("✅ Customer confirmation email response:", JSON.stringify(confirmationResponse));
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Emails envoyés avec succès",
          companyEmailResponse: emailResponse,
          customerEmailResponse: confirmationResponse
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (emailError: any) {
      console.error("❌ Erreur lors de l'envoi des emails:", emailError);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: emailError.message || "Erreur inconnue",
          details: JSON.stringify(emailError)
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("❌ Erreur générale dans la fonction edge:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Erreur inconnue",
        stack: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
