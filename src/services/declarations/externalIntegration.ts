
import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";
import { createMondayItem, createTechnicianReport } from "../monday";

// Send declaration to Monday.com
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    // Format the data for Monday.com
    const columnValues = {
      nome_do_cliente: declaration.name,
      email: declaration.email,
      telefone: declaration.phone,
      endereco: declaration.property,
      cidade: declaration.city || "",
      codigo_postal: declaration.postalCode || "",
      tipo_de_problema: declaration.issueType,
      descricao: declaration.description,
      urgencia: declaration.urgency,
      status: declaration.status,
      id_declaracao: declaration.id,
      data_submissao: declaration.submittedAt
    };
    
    // Add NIF if available
    if (declaration.nif) {
      columnValues.nif = declaration.nif;
    }
    
    // Send to Monday.com
    const itemId = await createMondayItem(
      `Ocorrência: ${declaration.name} - ${declaration.issueType}`, 
      columnValues
    );
    
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
    // Format the data for Monday.com technician board
    const columnValues = {
      cliente: report.clientName,
      email: report.clientEmail,
      telefone: report.clientPhone,
      endereço: report.address,
      categoria_do_problema: report.problemCategory,
      diagnóstico: report.diagnoseDescription,
      necessita_de_intervenção: report.needsIntervention ? "Sim" : "Não",
      valor_estimado: report.estimateAmount,
      trabalhos_a_realizar: report.workDescription,
      id_intervenção: report.interventionId.toString()
    };
    
    // Create item in the technician board
    const itemId = await createTechnicianReport(
      `Relatório: ${report.clientName} - ${report.problemCategory}`,
      columnValues
    );
    
    if (itemId) {
      return {
        success: true,
        message: "Relatório enviado com sucesso para Monday.com",
        mondayItemId: itemId
      };
    } else {
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
