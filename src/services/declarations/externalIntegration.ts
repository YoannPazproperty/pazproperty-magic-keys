import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";
import { createMondayItem, createTechnicianReport } from "../monday";

// Send declaration to Monday.com
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    console.log("Sending declaration to Monday.com:", declaration);
    
    // Format the data for Monday.com using the exact column IDs from our mapping table
    const formattedValues: Record<string, any> = {};
    
    // Name and contact details
    formattedValues["text_mknxg830"] = declaration.name; // Nome do Inquilino 
    formattedValues["email_mknxfg3r"] = declaration.email; // E-mail
    formattedValues["phone_mknyw109"] = declaration.phone; // Telefone
    if (declaration.nif) formattedValues["numeric_mknx2s4b"] = declaration.nif; // NIF
    
    // Address information
    formattedValues["text_mknx4pjn"] = declaration.property; // Endereço
    if (declaration.city) formattedValues["text_mknxe74j"] = declaration.city; // Cidade
    if (declaration.postalCode) formattedValues["text_mknxq2zr"] = declaration.postalCode; // Código Postal
    
    // Problem information
    formattedValues["text_mknxny1h"] = declaration.issueType; // Tipo de problema
    formattedValues["text_mknxj2e7"] = declaration.description; // Descrição
    
    // Status and urgency
    formattedValues["status"] = { label: "Nouveau" }; // Status
    formattedValues["dropdown_mkpbfgd4"] = { label: declaration.urgency }; // Urgência
    
    // ID and date
    formattedValues["text_mkpbmd7q"] = declaration.id; // ID Declaração
    
    // Date column - format as YYYY-MM-DD
    if (declaration.submittedAt) {
      const date = new Date(declaration.submittedAt);
      if (!isNaN(date.getTime())) {
        formattedValues["date4"] = { date: date.toISOString().split('T')[0] };
      }
    }
    
    // Log the column values before sending
    console.log("Monday.com formatted column values with correct IDs:", formattedValues);
    
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
    
    // Format the data for Monday.com technician board with proper structure
    const formattedValues: Record<string, any> = {};
    
    // Text columns
    formattedValues["Cliente"] = { text: report.clientName };
    formattedValues["Email"] = { text: report.clientEmail };
    formattedValues["Telefone"] = { text: report.clientPhone };
    formattedValues["Endereço"] = { text: report.address };
    formattedValues["Diagnóstico"] = { text: report.diagnoseDescription };
    formattedValues["Trabalhos a realizar"] = { text: report.workDescription || "" };
    formattedValues["ID Intervenção"] = { text: report.interventionId.toString() };
    
    // Number column
    formattedValues["Valor estimado"] = { text: report.estimateAmount || "0" };
    
    // Status/dropdown columns
    formattedValues["Categoria do problema"] = { label: report.problemCategory };
    formattedValues["Necessita de intervenção"] = { label: report.needsIntervention ? "Sim" : "Não" };
    
    // Log the column values before sending
    console.log("Column values being sent to Monday.com for technician report:", formattedValues);
    
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
