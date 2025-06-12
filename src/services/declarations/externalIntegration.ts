import { Declaration } from "../types";

// Simulates sending a declaration to an external service like Monday.com
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  console.log("externalIntegration: Bypassed for declaration:", declaration.id);
  // The Monday.com integration logic has been removed.
  // This function now returns a null value immediately.
  return Promise.resolve(null);
};
