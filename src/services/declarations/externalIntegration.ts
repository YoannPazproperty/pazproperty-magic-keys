
import { Declaration, TechnicianReport, TechnicianReportResult } from "../types";

export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  // Cette fonction ne fait plus rien maintenant que Monday.com est retiré
  console.log("External service integration removed");
  return null;
};

export const sendTechnicianReportToMonday = async (
  report: TechnicianReport
): Promise<TechnicianReportResult> => {
  // Cette fonction ne fait plus rien maintenant que Monday.com est retiré
  console.log("Technician report external integration removed");
  return {
    success: true,
    message: "External integration removed",
  };
};
