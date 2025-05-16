
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface NotificationPayload {
  providerEmail: string;
  providerName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  interventionType: string;
  freeTextMessage: string;
  mediaLinks: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Parse request body
    const payload: NotificationPayload = await req.json();
    console.log("Received notification payload:", {
      ...payload,
      providerEmail: payload.providerEmail.substring(0, 3) + "..." // Log only part of the email for privacy
    });
    
    // Validate required fields
    if (!payload.providerEmail || !payload.providerName) {
      throw new Error("Les champs 'providerEmail' et 'providerName' sont obligatoires");
    }
    
    // Generate media links HTML if provided
    let mediaLinksHtml = '';
    if (payload.mediaLinks && payload.mediaLinks.length > 0) {
      const linksHtml = payload.mediaLinks.map((link, index) => 
        `<li><a href="${link}" target="_blank">Media ${index + 1}</a></li>`
      ).join('');
      mediaLinksHtml = `<ul>${linksHtml}</ul>`;
    } else {
      mediaLinksHtml = "<p>Aucun media transmis</p>";
    }

    // Create email HTML content
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Nouvelle intervention assignée</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          background: #f9f9f9;
        }
        .header {
          background: #2c3e50;
          padding: 15px;
          color: white;
          text-align: center;
        }
        .content {
          padding: 20px;
          background: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        h1 {
          font-size: 24px;
          margin-bottom: 20px;
        }
        h2 {
          font-size: 20px;
          margin-top: 25px;
          color: #2c3e50;
        }
        p {
          margin-bottom: 15px;
        }
        .details {
          margin: 15px 0;
          padding-left: 20px;
        }
        .intervention-type {
          font-weight: bold;
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          border-left: 4px solid #2c3e50;
        }
        .message-box {
          background-color: #eff8ff;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
        }
        .footer {
          text-align: center;
          padding: 15px;
          font-size: 14px;
          color: #777;
        }
        ul {
          padding-left: 20px;
        }
        a {
          color: #3498db;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        @media only screen and (max-width: 480px) {
          body {
            padding: 10px;
          }
          .content {
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Pazproperty: Nouvelle Intervention</h1>
        </div>
        <div class="content">
          <p>Bonjour ${payload.providerName},</p>
          <p>Une nouvelle intervention vous a été assignée.</p>
          
          <h2>Détails du locataire :</h2>
          <div class="details">
            <p><strong>Nom :</strong> ${payload.customerName}</p>
            <p><strong>Téléphone :</strong> ${payload.customerPhone}</p>
            <p><strong>Email :</strong> ${payload.customerEmail}</p>
            <p><strong>Adresse :</strong> ${payload.customerAddress}</p>
          </div>
          
          <h2>Type d'intervention :</h2>
          <div class="intervention-type">
            ${payload.interventionType}
          </div>
          
          <h2>Message du client :</h2>
          <div class="message-box">
            ${payload.freeTextMessage || "Aucun message supplémentaire"}
          </div>
          
          <h2>Médias transmis :</h2>
          ${mediaLinksHtml}
          
          <p>Merci de prendre contact avec le locataire dans les plus brefs délais.</p>
          
          <p>Bien cordialement,<br>L'équipe Pazproperty.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Pazproperty. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Send email using Resend
    console.log(`Sending email to provider: ${payload.providerEmail}`);
    const { data, error: sendError } = await resend.emails.send({
      from: "Pazproperty <yoann@pazproperty.pt>",
      to: payload.providerEmail,
      subject: "✅ Nouvelle intervention assignée - Pazproperty",
      html: emailHtml
    });

    if (sendError) {
      console.error("Error sending email:", sendError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erreur lors de l'envoi du mail: ${sendError.message}` 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Email sent successfully:", data);
    return new Response(
      JSON.stringify({ 
        success: true, 
        error: null,
        data
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (err) {
    console.error("Error processing notification request:", err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : "Une erreur inconnue s'est produite" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
