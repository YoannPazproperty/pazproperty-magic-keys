
import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";
import { createMondayItem, createTechnicianReport } from "../monday";

// Send declaration to Monday.com
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    console.log("Sending declaration to Monday.com:", declaration);
    
    // Format the data for Monday.com
    const columnValues: Record<string, any> = {
      "Nome do Inquilino": declaration.name,
      "Email": declaration.email,
      "Telefone": declaration.phone,
      "Endereço": declaration.property,
      "Cidade": declaration.city || "",
      "Codigo Postal": declaration.postalCode || "",
      "Tipo de problema": declaration.issueType,
      "Descrição": declaration.description,
      "Urgência": declaration.urgency,
      "Status": declaration.status,
      "ID Declaração": declaration.id,
      "Data de submissão": declaration.submittedAt
    };
    
    // Add NIF if available
    if (declaration.nif) {
      columnValues["NIF"] = declaration.nif;
    }
    
    // Send to Monday.com
    const itemId = await createMondayItem(
      `Ocorrência: ${declaration.name} - ${declaration.issueType}`, 
      columnValues
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
    const columnValues = {
      "Cliente": report.clientName,
      "Email": report.clientEmail,
      "Telefone": report.clientPhone,
      "Endereço": report.address,
      "Categoria do problema": report.problemCategory,
      "Diagnóstico": report.diagnoseDescription,
      "Necessita de intervenção": report.needsIntervention ? "Sim" : "Não",
      "Valor estimado": report.estimateAmount,
      "Trabalhos a realizar": report.workDescription,
      "ID Intervenção": report.interventionId.toString()
    };
    
    // Create item in the technician board
    const itemId = await createTechnicianReport(
      `Relatório: ${report.clientName} - ${report.problemCategory}`,
      columnValues
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
