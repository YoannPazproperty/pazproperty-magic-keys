
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: ContactFormData = await req.json();
    const { nome, email, telefone, mensagem } = formData;

    console.log("Received contact form submission:", formData);

    // Vérification de la clé API Resend
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log("Resend API Key configured:", apiKey ? `Yes (${apiKey.substring(0, 5)}...)` : "No");

    // Destinataires
    const recipients = ["alexa@pazproperty.pt", "yoann@pazproperty.pt"];
    console.log("Sending email to recipients:", recipients);
    
    // Send email to company staff
    console.log("Sending email to company staff...");
    const emailResponse = await resend.emails.send({
      from: "PAZ Property <onboarding@resend.dev>", 
      to: recipients,
      subject: "Novo formulário de contacto do website",
      html: `
        <h1>Novo contacto do website</h1>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${mensagem.replace(/\n/g, "<br>")}</p>
      `,
    });

    console.log("Email to company result:", emailResponse);

    // Send confirmation email to the customer
    console.log("Sending confirmation email to customer...");
    const confirmationResponse = await resend.emails.send({
      from: "PAZ Property <onboarding@resend.dev>",
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
        message: "Emails sent successfully",
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
    console.error("Error sending emails:", error);
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
