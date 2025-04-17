
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { handleOptionsRequest } from "./requests.ts";
import { sendEmails } from "./email.ts";
import { saveToDatabase } from "./database.ts";
import { logRequest, logProcessResults } from "./logging.ts";

// Types definition
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
    return handleOptionsRequest();
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
      formData = await logRequest(req);
      
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
    
    // Log detailed results
    logProcessResults(emailResult, dbResult);
    
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

serve(handler);
