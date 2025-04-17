
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
    console.log("📥 Request received, processing...");
    
    let formData: ContactFormData;
    
    try {
      // Log request headers for debugging
      console.log("📋 Request headers:", Object.fromEntries(req.headers.entries()));
      
      // Check content type
      const contentType = req.headers.get("content-type");
      console.log("📝 Content-Type:", contentType);
      
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Invalid Content-Type:", contentType);
        throw new Error(`Expected application/json but got ${contentType}`);
      }
      
      // Get raw body for debugging
      const rawBody = await req.text();
      console.log("📄 Raw request body:", rawBody);
      
      // Try parsing the JSON
      try {
        // Vérifier si le corps est vide
        if (!rawBody || rawBody.trim() === "") {
          throw new Error("Request body is empty");
        }
        formData = JSON.parse(rawBody);
      } catch (jsonError) {
        console.error("❌ JSON parse error:", jsonError);
        throw new Error(`Invalid JSON format: ${jsonError.message}`);
      }
      
      console.log("📝 Parsed form data:", formData);
      
      // Basic validation
      if (!formData || !formData.nome || !formData.email || !formData.mensagem) {
        console.error("❌ Required fields missing:", formData);
        throw new Error("Required fields missing: name, email or message");
      }
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid request format: ${parseError.message}`,
          headers: Object.fromEntries(req.headers.entries())
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
        JSON.stringify({ success: false, error: "Email configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    console.log("✅ Resend API key found");
    
    // Initialize Resend
    const resend = new Resend(resendApiKey);
    
    // Get recipient emails
    const recipient1 = Deno.env.get("alexa@pazproperty.pt") || "alexa@pazproperty.pt";
    const recipient2 = Deno.env.get("yoann@pazproperty.pt") || "yoann@pazproperty.pt";
    const recipients = [recipient1, recipient2];
    
    console.log("📧 Sending email to:", recipients);
    
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
      console.log("📧 Attempting to send email to company...");
      
      // Send email to company
      const emailResponse = await resend.emails.send({
        from: "PAZ Property <onboarding@resend.dev>",
        to: recipients,
        subject: "Nouveau formulaire de contact du site web",
        html: html,
        reply_to: formData.email,
      });
      
      console.log("✅ Email to company sent, response:", emailResponse);
      
      console.log("📧 Attempting to send confirmation to customer...");
      
      // Send confirmation to customer
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
      console.error("❌ Email sending error:", emailError);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: emailError.message || "Unknown error",
          details: JSON.stringify(emailError)
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("❌ General error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error",
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
