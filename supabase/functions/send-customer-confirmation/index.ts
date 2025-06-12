import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@3.4.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const PAZ_LOGO_URL = 'https://ubztjjxmldogpwawcnrj.supabase.co/storage/v1/object/public/assets/PP%20Logo%20Principal.png';

// Définir les en-têtes CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Autorise toutes les origines
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeclarationData {
  customerName: string;
  customerEmail: string;
}

serve(async (req) => {
  // Gérer la requête "preflight" OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const resend = new Resend(RESEND_API_KEY);
  
  try {
    const { customerName, customerEmail }: DeclarationData = await req.json();

    if (!customerName || !customerEmail) {
      throw new Error("Customer name and email are required.");
    }
    
    const { data, error } = await resend.emails.send({
      from: "Pazproperty <geral@pazproperty.pt>",
      to: [customerEmail],
      subject: "A sua declaração foi recebida com sucesso!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <img src="${PAZ_LOGO_URL}" alt="Pazproperty Logo" style="max-width: 150px; margin-bottom: 20px;" />
          <h2>Olá ${customerName},</h2>
          <p>Recebemos a sua declaração e agradecemos o seu contacto.</p>
          <p>A nossa equipa já está a analisar o seu pedido e iremos atribuir um prestador de serviços para o ajudar o mais brevemente possível.</p>
          <p>Entraremos em contacto consigo em breve com mais detalhes.</p>
          <br>
          <p>Com os melhores cumprimentos,</p>
          <p><strong>A Equipa Pazproperty</strong></p>
        </div>
      `,
    });

    if (error) {
      console.error({ error });
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}) 