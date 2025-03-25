
import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";
import { createMondayItem, createTechnicianReport } from "../monday";

// Send declaration to Monday.com
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    console.log("Sending declaration to Monday.com:", declaration);
    
    // Format the data for Monday.com using the exact column IDs from the correspondence table
    const formattedValues = {
      "text_mknxg830": declaration.name,              // Nome do Inquilino
      "email_mknxfg3r": declaration.email,            // E-mail
      "phone_mknyw109": declaration.phone,            // Telefone
      "numeric_mknx2s4b": declaration.nif || "",      // NIF
      "text_mknx4pjn": declaration.property,          // Endereço 
      "text_mknxe74j": declaration.city || "",        // Cidade
      "text_mknxq2zr": declaration.postalCode || "",  // Código Postal
      "text_mknxny1h": declaration.issueType,         // Tipo de problema
      "text_mknxj2e7": declaration.description,       // Descrição
      "dropdown_mkpbfgd4": { "label": declaration.urgency }, // Urgência
      "status": { "label": "Nouveau" },               // Status
      "text_mkpbmd7q": declaration.id,                // ID Declaração
      "date4": new Date().toISOString().split('T')[0], // Data de submissão
      "link_mknx8vyw": declaration.mediaFiles || []    // Upload do Inquilino
    };
    
    // Log the formatted values
    console.log("Monday.com formatted values:", formattedValues);
    
    // Send to Monday.com
    const itemId = await createMondayItem(
      `Ocorrência: ${declaration.name} - ${declaration.issueType}`, 
      formattedValues
    );
    
    console.log("Monday.com item created with ID:", itemId);
    return itemId;
  } catch (error) {
    console.error("Error sending declaration to external service:", error);
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
