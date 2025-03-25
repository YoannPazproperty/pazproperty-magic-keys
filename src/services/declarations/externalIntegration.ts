import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";
import { createMondayItem } from "../monday/declarationBoard";
import { createTechnicianReport } from "../monday";
import { getMondayConfig } from "../monday/mondayConfig";

// Send declaration to Monday.com
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    console.log("Sending declaration to Monday.com:", declaration);
    
    // Get the configured group ID for Eventos
    const { eventosGroupId } = getMondayConfig();
    console.log("Using Eventos group ID:", eventosGroupId || "Not configured (will use default group)");
    
    // Format the data for Monday.com according to the correspondence table
    // The format must match exactly the column types in Monday.com
    const formattedValues: Record<string, any> = {
      // TEXT fields
      "text_mknxg830": declaration.name,             // Nome do Inquilino
      "text_mknx4pjn": declaration.property,         // Endereço
      "text_mknxe74j": declaration.city || "",       // Cidade
      "text_mknxq2zr": declaration.postalCode || "", // Código Postal
      "text_mknxny1h": declaration.issueType,        // Tipo de problema
      "text_mknxj2e7": declaration.description,      // Descrição
      "text_mkpbmd7q": declaration.id,               // ID Declaração
      
      // EMAIL field
      "email_mknxfg3r": declaration.email,           // E-mail
      
      // PHONE field
      "phone_mknyw109": declaration.phone,           // Telefone
      
      // NUMERIC field
      "numeric_mknx2s4b": declaration.nif || "",     // NIF
      
      // DATE field
      "date4": new Date().toISOString().split('T')[0], // Data de submissão
      
      // STATUS field (dropdown)
      "status": { "label": "Nouveau" },              // Status
      
      // DROPDOWN field
      "dropdown_mkpbfgd4": { "label": declaration.urgency }, // Urgência
      
      // LINK field (for uploads)
      "link_mknx8vyw": declaration.mediaFiles && declaration.mediaFiles.length > 0 
        ? declaration.mediaFiles[0] 
        : "",  // Upload do Inquilino
    };
    
    // Log the formatted values
    console.log("Monday.com formatted values:", JSON.stringify(formattedValues, null, 2));
    
    // Send to Monday.com with the Eventos group ID if configured
    const itemId = await createMondayItem(
      `Ocorrência: ${declaration.name} - ${declaration.issueType}`, 
      formattedValues,
      eventosGroupId // Use "topics" as defined in mondayConfig.ts
    );
    
    console.log("Monday.com item created with ID:", itemId);
    return itemId;
  } catch (error) {
    console.error("Error sending declaration to external service:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return null;
  }
};

// Send technician report to Monday.com
export const sendTechnicianReportToMonday = async (
  report: TechnicianReport
): Promise<TechnicianReportResult> => {
  try {
    console.log("Sending technician report to Monday.com:", report);
    
    // Format the data for Monday.com technician board
    // Note: These IDs would need to be updated with the correct ones from your technician board
    const formattedValues: Record<string, any> = {
      // Text columns
      "text6": report.clientName, // Cliente
      "text4": report.address, // Endereço
      "text8": report.diagnoseDescription, // Diagnóstico
      "text1": report.workDescription || "", // Trabalhos a realizar
      "text": report.interventionId.toString(), // ID Intervenção
      
      // Email column
      "email": report.clientEmail,
      
      // Phone column
      "phone": report.clientPhone,
      
      // Number column
      "numbers8": report.estimateAmount || "0",
      
      // Status/dropdown columns - use the correct format with label
      "dropdown5": { "label": report.problemCategory },
      "dropdown": { "label": report.needsIntervention ? "Sim" : "Não" }
    };
    
    // Log the column values before sending
    console.log("Column values for technician report:", formattedValues);
    
    // Create item in the technician board
    const itemId = await createTechnicianReport(
      `Relatório: ${report.clientName} - ${report.problemCategory}`,
      formattedValues
    );
    
    if (itemId) {
      console.log("Technician report created in Monday.com with ID:", itemId);
      return {
        success: true,
        message: "Relatório enviado com sucesso para Monday.com",
        mondayItemId: itemId
      };
    } else {
      console.error("Failed to create technician report in Monday.com");
      return {
        success: false,
        message: "Erro ao enviar relatório para Monday.com"
      };
    }
  } catch (error) {
    console.error("Error sending technician report to Monday.com:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
};
