
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
        // Check if the body is empty
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
      
      // Log all available environment variables (be careful not to expose sensitive info)
      const envKeys = Object.keys(Deno.env.toObject());
      console.log("Available environment variables:", envKeys);
      
      return new Response(
        JSON.stringify({ success: false, error: "Email configuration error: RESEND_API_KEY not found", availableKeys: envKeys }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    console.log("✅ Resend API key found, first 4 chars:", resendApiKey.substring(0, 4));
    
    try {
      // Test Resend API key validity by getting account info
      console.log("🔑 Testing Resend API key validity...");
      
      // Initialize Resend
      const resend = new Resend(resendApiKey);
      
      // Get recipient emails
      const recipient1 = Deno.env.get("alexa@pazproperty.pt") || "alexa@pazproperty.pt";
      const recipient2 = Deno.env.get("yoann@pazproperty.pt") || "yoann@pazproperty.pt";
      
      // Debug information
      console.log("📧 Environment variables for recipients:");
      console.log("alexa@pazproperty.pt env var:", Deno.env.get("alexa@pazproperty.pt"));
      console.log("yoann@pazproperty.pt env var:", Deno.env.get("yoann@pazproperty.pt"));
      
      const recipients = [recipient1, recipient2];
      
      console.log("📧 Sending email to recipients:", recipients);
      
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
        
        // Send test email to verify API key
        const testEmailParams = {
          from: "onboarding@resend.dev",
          to: ["delivered@resend.dev"],
          subject: "Test email from PAZ Property",
          html: "<p>This is a test email to verify API key.</p>",
        };
        
        console.log("📤 Sending test email with params:", JSON.stringify(testEmailParams));
        const testResponse = await resend.emails.send(testEmailParams);
        console.log("✅ Test email sent, response:", testResponse);
        
        // Now send the actual emails
        
        // Send email to company with fixed sender address
        const emailParams = {
          from: "onboarding@resend.dev",
          to: recipients,
          subject: "Nouveau formulaire de contact du site web",
          html: html,
          reply_to: formData.email,
        };
        
        console.log("📤 Sending company email with params:", JSON.stringify(emailParams));
        const emailResponse = await resend.emails.send(emailParams);
        
        console.log("✅ Email to company sent, response:", emailResponse);
        
        // Send confirmation to customer with fixed sender address
        const confirmationParams = {
          from: "onboarding@resend.dev",
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
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Emails sent successfully",
            testEmail: testResponse,
            companyEmail: emailResponse,
            confirmationEmail: confirmationResponse
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } catch (emailError: any) {
        console.error("❌ Email sending error:", emailError);
        
        // Log detailed error information
        console.error("Error details:", JSON.stringify(emailError));
        console.error("Error name:", emailError.name);
        console.error("Error message:", emailError.message);
        console.error("Error code:", emailError.code);
        console.error("Error reason:", emailError.reason);
        
        return new Response(
          JSON.stringify({
            success: false,
            error: emailError.message || "Unknown error",
            errorCode: emailError.code || "unknown",
            errorName: emailError.name || "Unknown",
            errorReason: emailError.reason || "Unknown",
            details: JSON.stringify(emailError)
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    } catch (resendError: any) {
      console.error("❌ Resend initialization error:", resendError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to initialize Resend",
          details: resendError.message
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
