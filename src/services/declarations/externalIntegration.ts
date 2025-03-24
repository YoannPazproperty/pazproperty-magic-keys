
import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";
import { createMondayItem, createTechnicianReport } from "../monday";

// Send declaration to Monday.com
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    console.log("Sending declaration to Monday.com:", declaration);
    
    // Format the data for Monday.com with exact column IDs based on the mapping table
    const formattedValues: Record<string, any> = {
      // Text columns - direct string values without additional formatting
      "text": declaration.name,             // Nome do Inquilino
      "text4": declaration.property,        // Endereço 
      "text5": declaration.city || "",      // Cidade
      "text7": declaration.postalCode || "", // Código Postal
      "text6": declaration.issueType,       // Tipo de problema
      "text87": declaration.description,    // Descrição
      "text1": declaration.id,              // ID Declaração
      
      // Email column - format as string (Monday.com formats it internally)
      "email": declaration.email,
      
      // Phone column - format as string (Monday.com formats it internally)
      "phone": declaration.phone,
      
      // NIF number - just send as a string
      "text0": declaration.nif || "",
      
      // Status column - send as string
      "status": "Nouveau",
      
      // Priority dropdown - send as string
      "priority": declaration.urgency,
      
      // Date column - send in YYYY-MM-DD format
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
