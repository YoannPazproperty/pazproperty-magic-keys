
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
  telefone: string;
  tipo: string;
  mensagem: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Edge function 'send-contact-form' called with method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    if (req.method !== "POST") {
      throw new Error(`Method ${req.method} not supported`);
    }

    // Parse the request body
    let formData: ContactFormData;
    try {
      formData = await req.json();
      console.log("Form data received:", formData);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      throw new Error("Invalid request body: " + parseError.message);
    }

    // Initialize Resend for email sending
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable not found");
    }
    const resend = new Resend(resendApiKey);
    
    // Initialize Supabase client
    const supabaseUrl = "https://ubztjjxmldogpwawcnrj.supabase.co";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable not found");
    }

    // Create responses object to track results
    const results = {
      emailSent: false,
      companyEmailId: null,
      confirmationEmailId: null,
      databaseSaved: false,
      databaseData: null
    };

    // STEP 1: Send emails
    console.log("STEP 1: Sending emails...");
    try {
      // Recipients
      const recipients = ["alexa@pazproperty.pt", "yoann@pazproperty.pt"];
      console.log("Sending email to:", recipients);
      
      // Send email to company
      const emailResponse = await resend.emails.send({
        from: "PAZ Property <yoann@pazproperty.pt>", 
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
      console.log("Company email result:", emailResponse);
      results.companyEmailId = emailResponse.id;
      
      // Send confirmation to customer
      const confirmationResponse = await resend.emails.send({
        from: "PAZ Property <yoann@pazproperty.pt>",
        to: [formData.email],
        subject: "Recebemos a sua mensagem - PAZ Property",
        html: `
          <h1>Obrigado pelo seu contacto, ${formData.nome}!</h1>
          <p>Recebemos a sua mensagem e entraremos em contacto consigo em breve.</p>
          <p>Cumprimentos,<br>Equipa PAZ Property</p>
        `,
      });
      console.log("Confirmation email result:", confirmationResponse);
      results.confirmationEmailId = confirmationResponse.id;
      results.emailSent = true;
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Continue execution to try database save
    }
    
    // STEP 2: Save to database
    console.log("STEP 2: Saving to database...");
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from("contactos_comerciais")
        .insert([{ 
          nome: formData.nome, 
          email: formData.email, 
          telefone: formData.telefone, 
          tipo: formData.tipo, 
          mensagem: formData.mensagem 
        }])
        .select();
      
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      console.log("Data saved to Supabase:", data);
      results.databaseSaved = true;
      results.databaseData = data;
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      // Continue to return response even if database save fails
    }

    // Return results
    return new Response(
      JSON.stringify({ 
        success: results.emailSent || results.databaseSaved, // Success if either operation worked
        email: {
          success: results.emailSent,
          companyEmailId: results.companyEmailId,
          confirmationEmailId: results.confirmationEmailId
        },
        database: {
          success: results.databaseSaved,
          data: results.databaseData
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("General error in edge function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
