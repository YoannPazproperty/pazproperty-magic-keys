
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

// Initialiser le client Resend pour l'envoi d'emails
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Configuration des en-têtes CORS - ESSENTIEL pour résoudre le problème CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
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
    
    // ÉTAPE 1: Envoi d'emails (prioritaire)
    console.log("ÉTAPE 1: Envoi d'emails...");
    
    // Destinataires
    const recipients = ["alexa@pazproperty.pt", "yoann@pazproperty.pt"];
    console.log("Envoi d'email aux destinataires:", recipients);
    
    let emailStatus = { success: false, companyEmail: null, confirmationEmail: null };
    
    try {
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
      
      emailStatus = { 
        success: true, 
        companyEmail: emailResponse, 
        confirmationEmail: confirmationResponse 
      };
    } catch (emailError) {
      console.error("ERREUR lors de l'envoi des emails:", emailError);
      // On continue malgré l'erreur d'email pour essayer d'écrire dans la base de données
    }
    
    // ÉTAPE 2: Sauvegarde dans Supabase (si les emails sont envoyés avec succès)
    console.log("ÉTAPE 2: Tentative d'écriture dans Supabase...");
    let dbStatus = { success: false, data: null };

    try {
      // Configuration de Supabase
      const supabaseUrl = "https://ubztjjxmldogpwawcnrj.supabase.co";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      
      console.log("Connexion à Supabase avec URL:", supabaseUrl);
      console.log("Clé service disponible:", supabaseKey ? "Oui (masquée)" : "Non");
      
      if (!supabaseKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY non configurée");
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Insertion dans la table contactos_comerciais
      const { data, error } = await supabase
        .from("contactos_comerciais")
        .insert([{ 
          nome, 
          email, 
          telefone, 
          tipo, 
          mensagem 
        }])
        .select();
      
      if (error) {
        console.error("Erreur Supabase lors de l'insertion:", error);
        throw error;
      }
      
      console.log("Données sauvegardées avec succès dans Supabase:", data);
      dbStatus = { success: true, data };
    } catch (dbError) {
      console.error("ERREUR lors de l'écriture dans Supabase:", dbError);
      // On continue même si la sauvegarde a échoué car l'envoi d'email est prioritaire
    }

    // Renvoyer le statut global
    return new Response(
      JSON.stringify({ 
        success: emailStatus.success, // Le formulaire est considéré comme un succès si les emails sont envoyés
        email: emailStatus,
        database: dbStatus,
        message: "Traitement terminé"
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
    console.error("Erreur générale dans la fonction send-contact-form:", error);
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
