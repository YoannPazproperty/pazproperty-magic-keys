
import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";
import { createMondayItem, createTechnicianReport } from "../monday";

// Send declaration to Monday.com
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    console.log("Sending declaration to Monday.com:", declaration);
    
    // Format the data for Monday.com in the correct format for their API
    // Monday.com expects a flat object with column keys exactly matching the column IDs
    const formattedValues: Record<string, any> = {};
    
    // Text columns - no nested objects
    formattedValues["text"] = declaration.name; // Assuming "text" is the column ID for the item name
    formattedValues["text1"] = declaration.email; // Email column
    formattedValues["text6"] = declaration.phone; // Phone column
    formattedValues["text0"] = declaration.property; // Address column
    formattedValues["long_text"] = declaration.description; // Description column
    formattedValues["text8"] = declaration.id; // ID column
    
    // Optional text fields
    if (declaration.city) formattedValues["text4"] = declaration.city;
    if (declaration.postalCode) formattedValues["text9"] = declaration.postalCode;
    if (declaration.nif) formattedValues["text5"] = declaration.nif;
    
    // Status column - directly use status values without wrapping in objects
    const statusMap: Record<string, string> = {
      "pending": "Nouveau",
      "in_progress": "En cours",
      "resolved": "Fait"
    };
    formattedValues["status"] = statusMap[declaration.status] || "Nouveau";
    
    // Dropdown columns - use the value directly (not wrapped in label object)
    formattedValues["dropdown"] = declaration.issueType;
    formattedValues["dropdown8"] = declaration.urgency === "medium" ? "Média" : declaration.urgency;
    
    // Date column - format as YYYY-MM-DD
    if (declaration.submittedAt) {
      const date = new Date(declaration.submittedAt);
      if (!isNaN(date.getTime())) {
        formattedValues["date4"] = date.toISOString().split('T')[0];
      }
    }
    
    // Log the column values before sending
    console.log("Monday.com formatted column values (flat object):", formattedValues);
    
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
