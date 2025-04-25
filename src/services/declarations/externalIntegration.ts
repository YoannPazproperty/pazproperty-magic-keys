
import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";

export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  // Cette fonction ne fait plus rien, l'intégration externe a été retirée
  console.log("External service integration removed");
  return null;
};

export const sendTechnicianReportToExternalService = async (
  report: TechnicianReport
): Promise<TechnicianReportResult> => {
  // Cette fonction ne fait plus rien, l'intégration externe a été retirée
  console.log("Technician report external integration removed");
  return {
    success: true,
    message: "External integration removed",
  };
};
