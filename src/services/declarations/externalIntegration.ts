
import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";
import { createMondayItem } from "../monday/declarationBoard";
import { createTechnicianReport } from "../monday";

// Send declaration to Monday.com
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    console.log("Sending declaration to Monday.com:", declaration);
    
    // Format the data for Monday.com using the exact column IDs from the correspondence table
    // IMPORTANT: The format for Monday.com API is { "column_id": {"text": "value"} } for text fields
    // and { "column_id": {"label": "value"} } for status/dropdown fields
    const formattedValues: Record<string, any> = {};
    
    // Text and number columns - use correct format for each type
    formattedValues["text_mknxg830"] = { "text": declaration.name };             // Nome do Inquilino
    formattedValues["email_mknxfg3r"] = { "email": declaration.email };          // E-mail
    formattedValues["phone_mknyw109"] = { "phone": declaration.phone };          // Telefone
    formattedValues["numeric_mknx2s4b"] = { "number": declaration.nif || "" };   // NIF
    formattedValues["text_mknx4pjn"] = { "text": declaration.property };         // Endereço
    formattedValues["text_mknxe74j"] = { "text": declaration.city || "" };       // Cidade
    formattedValues["text_mknxq2zr"] = { "text": declaration.postalCode || "" }; // Código Postal
    formattedValues["text_mknxny1h"] = { "text": declaration.issueType };        // Tipo de problema
    formattedValues["text_mknxj2e7"] = { "text": declaration.description };      // Descrição
    formattedValues["text_mkpbmd7q"] = { "text": declaration.id };               // ID Declaração
    
    // Date column - format as YYYY-MM-DD
    formattedValues["date4"] = { "date": new Date().toISOString().split('T')[0] }; // Data de submissão
    
    // Status and dropdown columns - format as {"label": "value"}
    formattedValues["status"] = { "label": "Nouveau" };                // Status
    formattedValues["dropdown_mkpbfgd4"] = { "label": declaration.urgency }; // Urgência
    
    // Media files - if any
    if (declaration.mediaFiles && declaration.mediaFiles.length > 0) {
      formattedValues["link_mknx8vyw"] = { "url": declaration.mediaFiles[0] };  // Upload do Inquilino (first file)
    }
    
    // Log the formatted values
    console.log("Monday.com formatted values:", JSON.stringify(formattedValues, null, 2));
    
    // Send to Monday.com
    const itemId = await createMondayItem(
      `Ocorrência: ${declaration.name} - ${declaration.issueType}`, 
      formattedValues
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
