
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

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
  console.log("🚀 Edge function 'send-contact-form' called with method:", req.method);
  
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
    // Get and log the raw request body for debugging
    const clonedReq = req.clone();
    try {
      const bodyText = await clonedReq.text();
      console.log("📄 Raw request body:", bodyText);
    } catch (e) {
      console.error("❌ Error reading raw body:", e);
    }

    // Parse the request body
    let formData: ContactFormData;
    try {
      formData = await req.json();
      console.log("📝 Form data received:", formData);
      
      // Validate required fields
      if (!formData.nome || !formData.email || !formData.mensagem || !formData.tipo) {
        throw new Error("Missing required fields");
      }
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: `Invalid request body: ${parseError.message}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create responses object to track results
    const results = {
      emailSent: false,
      emailError: null as string | null,
      databaseSaved: false,
      databaseError: null as string | null
    };

    // STEP 1: Send emails
    console.log("📧 STEP 1: Attempting to send emails...");
    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY environment variable not found");
      }
      
      const resend = new Resend(resendApiKey);
      
      // Recipients - these are stored as secrets in Supabase
      const recipient1 = Deno.env.get("alexa@pazproperty.pt") || "alexa@pazproperty.pt";
      const recipient2 = Deno.env.get("yoann@pazproperty.pt") || "yoann@pazproperty.pt";
      const recipients = [recipient1, recipient2];
      
      console.log("📤 Sending email to:", recipients);
      
      // Send email to company
      const emailResponse = await resend.emails.send({
        from: "PAZ Property <no-reply@resend.dev>",  // Using Resend's domain
        to: recipients,
        subject: "Novo formulário de contacto do website",
        html: `
          <h1>Novo contacto do website</h1>
          <p><strong>Nome:</strong> ${formData.nome}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Telefone:</strong> ${formData.telefone || "Não fornecido"}</p>
          <p><strong>Tipo:</strong> ${formData.tipo === 'proprietario' ? 'Proprietário' : 'Inquilino'}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${formData.mensagem.replace(/\n/g, "<br>")}</p>
        `,
      });
      console.log("✅ Company email result:", emailResponse);
      
      // Send confirmation to customer
      const confirmationResponse = await resend.emails.send({
        from: "PAZ Property <no-reply@resend.dev>",  // Using Resend's domain
        to: [formData.email],
        subject: "Recebemos a sua mensagem - PAZ Property",
        html: `
          <h1>Obrigado pelo seu contacto, ${formData.nome}!</h1>
          <p>Recebemos a sua mensagem e entraremos em contacto consigo em breve.</p>
          <p>Cumprimentos,<br>Equipa PAZ Property</p>
        `,
      });
      console.log("✅ Confirmation email result:", confirmationResponse);
      
      results.emailSent = true;
    } catch (emailError: any) {
      console.error("❌ Error sending emails:", emailError);
      results.emailError = emailError.message || "Unknown email error";
    }
    
    // STEP 2: Save to database (independent from email sending)
    console.log("💾 STEP 2: Attempting to save to database...");
    try {
      const supabaseUrl = "https://ubztjjxmldogpwawcnrj.supabase.co";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!supabaseKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable not found");
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      console.log("🔌 Supabase client created");
      
      const { data, error } = await supabase
        .from("contactos_comerciais")
        .insert([{ 
          nome: formData.nome, 
          email: formData.email, 
          telefone: formData.telefone || null, 
          tipo: formData.tipo, 
          mensagem: formData.mensagem 
        }]);
      
      if (error) {
        throw error;
      }
      
      console.log("✅ Data saved to Supabase successfully");
      results.databaseSaved = true;
    } catch (dbError: any) {
      console.error("❌ Error saving to database:", dbError);
      results.databaseError = dbError.message || "Unknown database error";
    }

    // Return results based on what succeeded
    if (results.emailSent || results.databaseSaved) {
      // At least one operation succeeded
      return new Response(
        JSON.stringify({
          success: true,
          partialSuccess: !(results.emailSent && results.databaseSaved),
          email: {
            success: results.emailSent,
            error: results.emailError
          },
          database: {
            success: results.databaseSaved,
            error: results.databaseError
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      // Both operations failed
      return new Response(
        JSON.stringify({
          success: false,
          email: {
            success: false,
            error: results.emailError
          },
          database: {
            success: false,
            error: results.databaseError
          }
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
