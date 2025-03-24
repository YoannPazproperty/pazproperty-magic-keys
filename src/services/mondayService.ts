
import { MondayConfigValidation } from "./types";

// Validate Monday.com configuration
export const validateMondayConfig = async (apiKey: string, boardId: string): Promise<MondayConfigValidation> => {
  try {
    // In a real app, this would make an API call to test the connection
    // For demonstration, we'll just validate format and simulate a response
    
    if (!apiKey || apiKey.length < 10) {
      return {
        valid: false,
        message: "Clé API invalide. Veuillez fournir une clé API valide."
      };
    }
    
    if (!boardId || isNaN(Number(boardId))) {
      return {
        valid: false,
        message: "ID du tableau invalide. Veuillez fournir un ID numérique valide."
      };
    }
    
    // Simulate API validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demonstration, we'll assume the config is valid
    return {
      valid: true,
      message: "Configuration valide. La connexion à Monday.com a été établie avec succès."
    };
  } catch (error) {
    console.error("Error validating Monday.com config:", error);
    return {
      valid: false,
      message: error instanceof Error ? error.message : "Erreur de validation de la configuration"
    };
  }
};

// Set Monday.com configuration
export const setMondayConfig = async (apiKey: string, boardId: string): Promise<MondayConfigValidation> => {
  try {
    const validation = await validateMondayConfig(apiKey, boardId);
    
    if (validation.valid) {
      // Save config to localStorage
      localStorage.setItem('mondayApiKey', apiKey);
      localStorage.setItem('mondayBoardId', boardId);
    }
    
    return validation;
  } catch (error) {
    console.error("Error setting Monday.com config:", error);
    return {
      valid: false,
      message: error instanceof Error ? error.message : "Erreur lors de la configuration"
    };
  }
};

// Create Monday.com item
export const createMondayItem = async (itemName: string, columnValues: Record<string, any>): Promise<string | null> => {
  try {
    // In a real app, this would make an API call to Monday.com
    // For demonstration, we'll just return a fake item ID
    
    console.log("Creating Monday.com item:", itemName, columnValues);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a fake item ID
    return `${Date.now()}`;
  } catch (error) {
    console.error("Error creating Monday.com item:", error);
    return null;
  }
};

// Create Monday.com technician report
export const createTechnicianReport = async (itemName: string, columnValues: Record<string, any>): Promise<string | null> => {
  try {
    // In a real app, this would make an API call to Monday.com
    console.log("Creating technician report in Monday.com:", itemName, columnValues);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a fake item ID
    return `TR-${Date.now()}`;
  } catch (error) {
    console.error("Error creating technician report in Monday.com:", error);
    return null;
  }
};

// Check Monday.com board status
export const getMondayBoardStatus = async (): Promise<{connected: boolean; message: string}> => {
  try {
    const apiKey = localStorage.getItem('mondayApiKey') || '';
    const boardId = localStorage.getItem('mondayBoardId') || '';
    
    if (!apiKey || !boardId) {
      return {
        connected: false,
        message: "Configuration Monday.com manquante"
      };
    }
    
    const validation = await validateMondayConfig(apiKey, boardId);
    
    return {
      connected: validation.valid,
      message: validation.message
    };
  } catch (error) {
    console.error("Error checking Monday.com board status:", error);
    return {
      connected: false,
      message: error instanceof Error ? error.message : "Erreur de connexion à Monday.com"
    };
  }
};
