
import { toast } from "sonner";
import { Declaration, TechnicianReport, TechnicianReportResult, issueTypeToMondayMap, urgencyToMondayMap } from "../types";
import { getMondayConfig } from "../storageService";
import { createMondayItem, createTechnicianReport, getMondayBoardStatus } from "../mondayService";
import { updateDeclaration } from "./declarationStorage";

// Send declaration to external service (Monday.com)
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    // Get the Monday.com configuration
    const config = getMondayConfig();
    
    // Log the current configuration
    console.log("Monday.com configuration:", config);
    
    if (!config.apiKey) {
      console.error("Monday.com API key is not configured");
      toast.error("Clé API Monday.com non configurée", {
        description: "Veuillez configurer la clé API dans les paramètres"
      });
      return null;
    }
    
    if (!config.boardId) {
      console.error("Monday.com board ID is not configured");
      toast.error("ID du tableau Monday.com non configuré", {
        description: "Veuillez configurer l'ID du tableau dans les paramètres"
      });
      return null;
    }
    
    // Convert issue type and urgency to Monday.com values
    const mondayIssueType = issueTypeToMondayMap[declaration.issueType] || declaration.issueType;
    const mondayUrgency = urgencyToMondayMap[declaration.urgency] || declaration.urgency;
    
    const itemName = `${declaration.name} - ${declaration.property}`;
    
    // Create the item in Monday.com
    const itemId = await createMondayItem(
      itemName,
      {
        nome_do_cliente: declaration.name,
        email: declaration.email,
        telefone: declaration.phone,
        endereco: declaration.property,
        tipo_de_problema: mondayIssueType,
        descricao: declaration.description,
        urgencia: mondayUrgency,
        status: "Novo",
        nif: declaration.nif || "",
        id_declaracao: declaration.id,
        cidade: declaration.city || "",
        codigo_postal: declaration.postalCode || "",
        data_submissao: new Date(declaration.submittedAt).toLocaleString('pt-PT')
      }
    );
    
    if (itemId) {
      // Update declaration with Monday ID
      updateDeclaration(declaration.id, { mondayId: itemId });
      
      toast.success("Créé avec succès dans Monday.com", {
        description: `ID de l'élément: ${itemId}`
      });
      return itemId;
    }
    
    toast.error("Échec de la création dans Monday.com", {
      description: "Vérifiez les paramètres de l'API et réessayez"
    });
    return null;
  } catch (error) {
    console.error("Error creating Monday item:", error);
    toast.error("Erreur lors de la création dans Monday.com", {
      description: error instanceof Error ? error.message : "Une erreur s'est produite"
    });
    return null;
  }
};

// Send technician report to Monday.com
export const sendTechnicianReportToMonday = async (report: TechnicianReport): Promise<TechnicianReportResult> => {
  try {
    // Create a new item in the technician reports board
    const itemName = `Rapport #${report.interventionId} - ${report.clientName}`;
    
    // Map data fields to Monday.com column values
    const columnValues = {
      diagnóstico: report.diagnoseDescription,
      necessita_de_intervenção: report.needsIntervention ? "Sim" : "Não",
      valor_estimado: report.estimateAmount,
      trabalhos_a_realizar: report.workDescription,
      cliente: report.clientName,
      email: report.clientEmail,
      telefone: report.clientPhone,
      endereço: report.address,
      categoria_do_problema: issueTypeToMondayMap[report.problemCategory] || report.problemCategory,
      id_intervenção: report.interventionId.toString()
    };
    
    const itemId = await createTechnicianReport(itemName, columnValues);
    
    if (itemId) {
      return {
        success: true,
        message: "Rapport envoyé avec succès à Monday.com",
        mondayItemId: itemId
      };
    } else {
      return {
        success: false,
        message: "Échec de l'envoi du rapport à Monday.com"
      };
    }
  } catch (error) {
    console.error("Error sending technician report to Monday:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue lors de l'envoi du rapport"
    };
  }
};

// Get Monday board status (alias for getMondayBoardStatus)
export const getMonday5BoardStatus = getMondayBoardStatus;
