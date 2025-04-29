
import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";
import { getMondayConfig } from "../storageService";
import { toast } from "sonner";

// Function for sending a declaration to Monday.com board
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    console.log("externalIntegration: Sending declaration to Monday.com:", declaration);
    
    // Get Monday.com configuration
    const config = getMondayConfig();
    
    if (!config.apiKey || !config.boardId) {
      console.error("externalIntegration: Missing Monday.com configuration");
      return null;
    }
    
    // In a production environment, this would make an API call to Monday.com
    // For now, simulate a successful Monday.com integration
    const mockMondayId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    console.log(`externalIntegration: Declaration sent to Monday.com with ID: ${mockMondayId}`);
    return mockMondayId;
  } catch (error) {
    console.error("externalIntegration: Error sending to external service:", error);
    return null;
  }
};

// Function to send technician report to Monday.com board
export const sendTechnicianReport = async (report: TechnicianReport): Promise<TechnicianReportResult> => {
  try {
    console.log("externalIntegration: Sending technician report to Monday.com:", report);
    
    // Get Monday.com configuration
    const config = getMondayConfig();
    
    if (!config.apiKey || !config.techBoardId) {
      console.error("externalIntegration: Missing Monday.com technician board configuration");
      return {
        success: false,
        message: "Configuration Monday.com manquante"
      };
    }
    
    // In a production environment, this would make an API call to Monday.com
    // For now, simulate a successful Monday.com integration
    const mockReportId = `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    console.log(`externalIntegration: Technician report sent to Monday.com with ID: ${mockReportId}`);
    
    return {
      success: true,
      message: "Rapport envoyé avec succès",
      reportId: mockReportId
    };
  } catch (error) {
    console.error("externalIntegration: Error sending technician report:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de l'envoi du rapport"
    };
  }
};
