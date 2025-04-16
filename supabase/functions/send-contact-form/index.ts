
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

// Initialiser le client Resend pour l'envoi d'emails
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Configuration de Supabase
const supabaseUrl = "https://ubztjjxmldogpwawcnrj.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
  mensagem: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: ContactFormData = await req.json();
    const { nome, email, telefone, tipo, mensagem } = formData;

    console.log("Received contact form submission:", formData);

    // Vérification de la clé Supabase
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    console.log("Supabase service key configured:", serviceKey ? `Yes (${serviceKey.substring(0, 5)}...)` : "No");
    
    // Sauvegarder les données dans la base de données
    console.log("Saving data to contactos_comerciais table...");
    
    try {
      const { data: insertData, error: insertError } = await supabase
        .from("contactos_comerciais")
        .insert([
          { nome, email, telefone, tipo, mensagem }
        ])
        .select(); // Ajouter .select() pour récupérer les données insérées
      
      if (insertError) {
        console.error("Error saving to database:", insertError);
        console.error("Error details:", insertError.details);
        console.error("Error hint:", insertError.hint);
        throw new Error(`Database error: ${insertError.message}`);
      }
      
      console.log("Data saved successfully!", insertData);
    } catch (dbError) {
      console.error("Exception during database operation:", dbError);
      throw new Error(`Database operation failed: ${dbError.message}`);
    }
    
    // Vérification de la clé API Resend
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log("Resend API Key configured:", apiKey ? `Yes (${apiKey.substring(0, 5)}...)` : "No");

    // Destinataires
    const recipients = ["alexa@pazproperty.pt", "yoann@pazproperty.pt"];
    console.log("Sending email to recipients:", recipients);
    
    // Send email to company staff
    console.log("Sending email to company staff...");
    const emailResponse = await resend.emails.send({
      from: "PAZ Property <yoann@pazproperty.pt>", 
      to: recipients,
      subject: "Novo formulário de contacto do website",
      html: `
        <h1>Novo contacto do website</h1>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone}</p>
        <p><strong>Tipo:</strong> ${tipo === 'proprietario' ? 'Proprietário' : 'Inquilino'}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${mensagem.replace(/\n/g, "<br>")}</p>
      `,
    });

    console.log("Email to company result:", emailResponse);

    // Send confirmation email to the customer
    console.log("Sending confirmation email to customer...");
    const confirmationResponse = await resend.emails.send({
      from: "PAZ Property <yoann@pazproperty.pt>",
      to: [email],
      subject: "Recebemos a sua mensagem - PAZ Property",
      html: `
        <h1>Obrigado pelo seu contacto, ${nome}!</h1>
        <p>Recebemos a sua mensagem e entraremos em contacto consigo em breve.</p>
        <p>Cumprimentos,<br>Equipa PAZ Property</p>
      `,
    });

    console.log("Confirmation email result:", confirmationResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Data saved and emails sent successfully",
        details: {
          companyEmail: emailResponse,
          confirmationEmail: confirmationResponse
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
  } catch (error: any) {
    console.error("Error in send-contact-form function:", error);
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
