
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Essential CORS headers
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
    
    let bodyText;
    try {
      // Clone and read the request body as text for debugging
      const clonedReq = req.clone();
      bodyText = await clonedReq.text();
      console.log("📄 Raw request body:", bodyText);
    } catch (e) {
      console.error("❌ Error reading raw body:", e);
    }
    
    // Parse the JSON body from the original request
    let formData: ContactFormData;
    try {
      if (!bodyText) {
        formData = await req.json();
      } else {
        formData = JSON.parse(bodyText);
      }
      
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
          receivedBody: bodyText || "could not read body" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // STEP 1: Focus on sending emails first
    console.log("📧 Attempting to send emails...");
    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY environment variable not found");
      }
      console.log("✅ Resend API key found");
      
      const resend = new Resend(resendApiKey);
      
      // Get the recipient emails from environment variables
      const recipient1 = Deno.env.get("alexa@pazproperty.pt") || "alexa@pazproperty.pt";
      const recipient2 = Deno.env.get("yoann@pazproperty.pt") || "yoann@pazproperty.pt";
      const recipients = [recipient1, recipient2];
      
      console.log("📤 Sending email to:", recipients);
      
      // Email template to company
      const html = `
        <h1>Novo contacto do website</h1>
        <p><strong>Nome:</strong> ${formData.nome}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Telefone:</strong> ${formData.telefone || "Não fornecido"}</p>
        <p><strong>Tipo:</strong> ${formData.tipo === 'proprietario' ? 'Proprietário' : 'Inquilino'}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${formData.mensagem.replace(/\n/g, "<br>")}</p>
      `;
      
      // Send email to company
      const emailResponse = await resend.emails.send({
        from: "PAZ Property <onboarding@resend.dev>", // Using default Resend domain for testing
        to: recipients,
        subject: "Novo formulário de contacto do website",
        html: html,
      });
      
      console.log("✅ Company email sent, response:", emailResponse);
      
      // Send confirmation to customer
      const confirmationResponse = await resend.emails.send({
        from: "PAZ Property <onboarding@resend.dev>", // Using default Resend domain for testing
        to: [formData.email],
        subject: "Recebemos a sua mensagem - PAZ Property",
        html: `
          <h1>Obrigado pelo seu contacto, ${formData.nome}!</h1>
          <p>Recebemos a sua mensagem e entraremos em contacto consigo em breve.</p>
          <p>Cumprimentos,<br>Equipa PAZ Property</p>
        `,
      });
      
      console.log("✅ Confirmation email sent, response:", confirmationResponse);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Emails sent successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (emailError: any) {
      console.error("❌ Error sending emails:", emailError);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: emailError.message || "Unknown email error"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

  } catch (error: any) {
    console.error("❌ General error in edge function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
