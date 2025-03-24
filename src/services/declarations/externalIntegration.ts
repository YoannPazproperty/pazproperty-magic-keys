
import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";
import { createMondayItem, createTechnicianReport } from "../monday";

// Send declaration to Monday.com
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    console.log("Sending declaration to Monday.com:", declaration);
    
    // Format the data for Monday.com using EXACT column IDs from your screenshot
    const formattedValues: Record<string, any> = {
      // Text columns
      "text0": declaration.name,            // Nome do Inquilino
      "text8": declaration.property,        // Endereço 
      "text7": declaration.city || "",      // Cidade
      "text00": declaration.postalCode || "", // Código Postal
      "text92": declaration.issueType,       // Tipo de problema
      "text6": declaration.description,     // Descrição
      "text4": declaration.id,              // ID Declaração
      
      // Email column
      "email": declaration.email,
      
      // Phone column
      "phone1": declaration.phone,
      
      // NIF field
      "numbers": declaration.nif || "",
      
      // Status dropdown
      "status": "Nouveau",
      
      // Priority dropdown
      "dropdown9": declaration.urgency,
      
      // Date column
      "date4": declaration.submittedAt ? 
        new Date(declaration.submittedAt).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0]
    };
    
    // Log the formatted values
    console.log("Monday.com formatted column values:", formattedValues);
    
    // Send to Monday.com with properly formatted values
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
      
      // Status/dropdown columns
      "dropdown5": report.problemCategory,
      "dropdown": report.needsIntervention ? "Sim" : "Não"
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
