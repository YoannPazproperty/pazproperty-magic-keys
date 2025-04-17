
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*, Authorization, X-Client-Info, Content-Type",
};

// Types definition
interface ContactFormData {
  nome: string;
  email: string;
  telefone: string | null;
  tipo: string;
  mensagem: string;
}

interface ProcessResult {
  success: boolean;
  error?: string;
  details?: any;
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
      // Parse and validate request body
      const rawBody = await req.text();
      console.log("📄 Raw request body:", rawBody);
      
      if (!rawBody || rawBody.trim() === "") {
        throw new Error("Request body is empty");
      }
      
      formData = JSON.parse(rawBody);
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
          error: `Invalid request format: ${parseError.message}`
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Process functions independently to avoid one failure affecting the other
    const emailResult = await sendEmails(formData);
    const dbResult = await saveToDatabase(formData);
    
    // Determine overall result
    const overallSuccess = emailResult.success || dbResult.success;
    
    // Generate detailed response
    return new Response(
      JSON.stringify({
        success: overallSuccess,
        email: emailResult,
        database: dbResult,
        message: overallSuccess 
          ? "Formulário processado com sucesso" 
          : "Falha ao processar formulário"
      }),
      {
        status: overallSuccess ? 200 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ General error:", error);
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

// Email sending function (isolated)
async function sendEmails(formData: ContactFormData): Promise<ProcessResult> {
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

// Database function (isolated)
async function saveToDatabase(formData: ContactFormData): Promise<ProcessResult> {
  console.log("💾 Starting database save process...");
  
  try {
    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Supabase credentials missing");
      return {
        success: false,
        error: "Database configuration error: Supabase credentials missing"
      };
    }
    
    console.log("✅ Supabase credentials found");
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Prepare data for insertion
    const contactData = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      tipo: formData.tipo,
      mensagem: formData.mensagem,
    };
    
    console.log("📝 Saving contact to database:", contactData);
    
    // Insert into database
    const { data, error } = await supabase
      .from("contactos_comerciais")
      .insert(contactData)
      .select();
    
    if (error) {
      console.error("❌ Database insertion error:", error);
      return {
        success: false,
        error: "Failed to save contact to database",
        details: error
      };
    }
    
    console.log("✅ Contact saved to database:", data);
    return {
      success: true,
      details: data
    };
  } catch (dbError: any) {
    console.error("❌ Database error:", dbError);
    return {
      success: false,
      error: "Database error",
      details: dbError.message
    };
  }
}

serve(handler);
