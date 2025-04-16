
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

// Initialiser le client Resend pour l'envoi d'emails
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Configuration de Supabase
const supabaseUrl = "https://ubztjjxmldogpwawcnrj.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration des en-têtes CORS - ESSENTIEL pour résoudre le problème CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
  console.log("Fonction send-contact-form appelée avec la méthode:", req.method);
  
  // Gestion des requêtes OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    console.log("Requête CORS preflight reçue, renvoi des en-têtes CORS");
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Vérifier que la méthode est POST
    if (req.method !== "POST") {
      console.error(`Méthode non supportée: ${req.method}`);
      return new Response(
        JSON.stringify({ error: `Méthode ${req.method} non supportée` }),
        {
          status: 405,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    const formData: ContactFormData = await req.json();
    const { nome, email, telefone, tipo, mensagem } = formData;

    console.log("Données du formulaire reçues:", formData);

    // Vérification de la clé Supabase
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    console.log("Clé service Supabase configurée:", serviceKey ? `Oui (${serviceKey.substring(0, 5)}...)` : "Non");
    
    if (!serviceKey) {
      console.error("ERREUR: Clé Supabase Service Role non configurée");
      throw new Error("Configuration Supabase incomplète: SUPABASE_SERVICE_ROLE_KEY manquante");
    }
    
    // Sauvegarder les données dans la base de données
    console.log("Sauvegarde des données dans la table contactos_comerciais...");
    
    try {
      const { data: insertData, error: insertError } = await supabase
        .from("contactos_comerciais")
        .insert([
          { nome, email, telefone, tipo, mensagem }
        ])
        .select(); // Ajouter .select() pour récupérer les données insérées
      
      if (insertError) {
        console.error("Erreur lors de la sauvegarde dans la base de données:", insertError);
        console.error("Détails de l'erreur:", insertError.details);
        console.error("Indice d'erreur:", insertError.hint);
        throw new Error(`Erreur de base de données: ${insertError.message}`);
      }
      
      console.log("Données sauvegardées avec succès!", insertData);
    } catch (dbError) {
      console.error("Exception lors de l'opération sur la base de données:", dbError);
      throw new Error(`Échec de l'opération sur la base de données: ${dbError.message}`);
    }
    
    // Vérification de la clé API Resend
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log("Clé API Resend configurée:", apiKey ? `Oui (${apiKey.substring(0, 5)}...)` : "Non");

    if (!apiKey) {
      console.error("ERREUR: Clé API Resend non configurée");
      throw new Error("Configuration d'envoi d'email incomplète: RESEND_API_KEY manquante");
    }

    // Destinataires
    const recipients = ["alexa@pazproperty.pt", "yoann@pazproperty.pt"];
    console.log("Envoi d'email aux destinataires:", recipients);
    
    // Send email to company staff
    console.log("Envoi d'email au personnel de l'entreprise...");
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

    console.log("Résultat de l'email à l'entreprise:", emailResponse);

    // Send confirmation email to the customer
    console.log("Envoi d'email de confirmation au client...");
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

    console.log("Résultat de l'email de confirmation:", confirmationResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Données sauvegardées et emails envoyés avec succès",
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
    console.error("Erreur dans la fonction send-contact-form:", error);
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
