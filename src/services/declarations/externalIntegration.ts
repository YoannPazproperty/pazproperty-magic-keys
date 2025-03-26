
import { Declaration } from "../types";
import { createMondayItem } from "../monday/declarationBoard";
import { getMondayConfig } from "../monday/mondayConfig";
import { issueTypeToMondayMap, urgencyToMondayMap } from "../types";

export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    console.log("Sending declaration to Monday.com:", declaration);
    
    const { eventosGroupId } = getMondayConfig();
    
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
      "link_mknx8vyw": declaration.mediaFiles && declaration.mediaFiles.length > 0 
        ? { "url": declaration.mediaFiles[0] } 
        : { "url": "" }
    };
    
    console.log("Formatted Monday.com values:", JSON.stringify(formattedValues, null, 2));
    
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
