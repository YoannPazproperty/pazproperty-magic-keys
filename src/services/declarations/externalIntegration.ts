import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";
import { createMondayItem } from "../monday/declarationBoard";
import { createTechnicianReport } from "../monday/technicianBoard";
import { getMondayConfig } from "../monday/mondayConfig";
import { issueTypeToMondayMap, urgencyToMondayMap } from "../types";

export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    console.log("Sending declaration to Monday.com:", declaration);
    console.log("Media files:", declaration.mediaFiles);
    
    const { eventosGroupId } = getMondayConfig();
    
    // Construire l'URL absolue pour le fichier média
    const mediaUrl = declaration.mediaFiles && declaration.mediaFiles.length > 0
      ? `${window.location.origin}${declaration.mediaFiles[0]}`
      : "";
    
    console.log("Media URL:", mediaUrl);
    
    // Mappage précis des valeurs selon le tableau de correspondance
    const formattedValues: Record<string, any> = {
      // Champ Texte: Nom du locataire
      "text_mknxg830": { 
        "text": declaration.name 
      },
      
      // Champ Texte: Adresse
      "text_mknx4pjn": { 
        "text": declaration.property 
      },
      
      // Champ Texte: Ville
      "text_mknxe74j": { 
        "text": declaration.city || "" 
      },
      
      // Champ Texte: Code Postal
      "text_mknxq2zr": { 
        "text": declaration.postalCode || "" 
      },
      
      // Champ Texte: Type de problème (avec mapping)
      "text_mknxny1h": { 
        "text": issueTypeToMondayMap[declaration.issueType] || declaration.issueType 
      },
      
      // Champ Texte: Description
      "text_mknxj2e7": { 
        "text": declaration.description 
      },
      
      // Champ Texte: ID Déclaration
      "text_mkpbmd7q": { 
        "text": declaration.id 
      },
      
      // Champ Email
      "email_mknxfg3r": { 
        "email": declaration.email 
      },
      
      // Champ Téléphone
      "phone_mknyw109": { 
        "phone": declaration.phone 
      },
      
      // Champ Numérique: NIF
      "numeric_mknx2s4b": { 
        "number": declaration.nif ? parseInt(declaration.nif, 10) : 0 
      },
      
      // Champ Date: Date de soumission
      "date4": { 
        "date": new Date().toISOString().split('T')[0] 
      },
      
      // Champ Statut
      "status": { 
        "label": "Nouveau" 
      },
      
      // Champ Dropdown: Urgence (avec mapping)
      "dropdown_mkpbfgd4": { 
        "label": urgencyToMondayMap[declaration.urgency] || "Média" 
      },
      
      // Champ Lien: Fichiers média
      "link_mknx8vyw": mediaUrl ? { "url": mediaUrl } : { "url": "" }
    };
    
    console.log("Formatted Monday.com values:", JSON.stringify(formattedValues, null, 2));
    console.log("Link field value:", formattedValues["link_mknx8vyw"]);
    
    const itemId = await createMondayItem(
      `Ocorrência: ${declaration.name} - ${declaration.issueType}`, 
      formattedValues,
      eventosGroupId
    );
    
    console.log("Monday.com item created with ID:", itemId);
    return itemId;
  } catch (error) {
    console.error("Error sending declaration to external service:", error);
    return null;
  }
};

// Nouvelle fonction pour envoyer les rapports de techniciens vers Monday.com
export const sendTechnicianReportToMonday = async (
  report: TechnicianReport
): Promise<TechnicianReportResult> => {
  try {
    console.log("Sending technician report to Monday.com:", report);
    
    // Préparation des valeurs formatées pour le tableau Monday des techniciens
    const formattedValues: Record<string, any> = {
      // Colonnes nécessaires au technicien
      "Cliente": report.clientName,
      "Email": report.clientEmail,
      "Telefone": report.clientPhone,
      "Endereço": report.address,
      "Categoria do problema": report.problemCategory,
      "Diagnóstico": report.diagnoseDescription,
      "Necessita de intervenção": report.needsIntervention ? "Sim" : "Não",
      "Trabalhos a realizar": report.workDescription || "",
      "Valor estimado": report.estimateAmount || "0",
      "ID Intervenção": String(report.interventionId)
    };
    
    console.log("Formatted Monday.com technician values:", JSON.stringify(formattedValues, null, 2));
    
    // Création de l'élément sur le tableau Monday des techniciens
    const itemId = await createTechnicianReport(
      `Relatório: ${report.clientName} - ${report.problemCategory}`,
      formattedValues
    );
    
    if (itemId) {
      console.log("Monday.com technician report created with ID:", itemId);
      return {
        success: true,
        message: "Rapport envoyé avec succès",
        mondayItemId: itemId
      };
    } else {
      return {
        success: false,
        message: "Erreur lors de la création de l'élément dans Monday.com"
      };
    }
  } catch (error) {
    console.error("Error sending technician report to Monday.com:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue"
    };
  }
};
