
import { MondayConfigValidation } from "../types";

// Validate Monday.com configuration
export const validateMondayConfig = async (apiKey: string, boardId: string, techBoardId: string): Promise<MondayConfigValidation> => {
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
        message: "ID du tableau de déclarations invalide. Veuillez fournir un ID numérique valide."
      };
    }
    
    if (!techBoardId || isNaN(Number(techBoardId))) {
      return {
        valid: false,
        message: "ID du tableau de prestataires invalide. Veuillez fournir un ID numérique valide."
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
export const setMondayConfig = async (apiKey: string, boardId: string, techBoardId: string): Promise<MondayConfigValidation> => {
  try {
    const validation = await validateMondayConfig(apiKey, boardId, techBoardId);
    
    if (validation.valid) {
      // Save config to localStorage
      localStorage.setItem('mondayApiKey', apiKey);
      localStorage.setItem('mondayBoardId', boardId);
      localStorage.setItem('mondayTechBoardId', techBoardId);
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

// Get Monday board configuration
export const getMondayConfig = () => {
  return {
    apiKey: localStorage.getItem('mondayApiKey') || '',
    boardId: localStorage.getItem('mondayBoardId') || '',
    techBoardId: localStorage.getItem('mondayTechBoardId') || ''
  };
};

// Check Monday.com board status
export const getMondayBoardStatus = async (): Promise<{connected: boolean; message: string}> => {
  try {
    const apiKey = localStorage.getItem('mondayApiKey') || '';
    const boardId = localStorage.getItem('mondayBoardId') || '';
    const techBoardId = localStorage.getItem('mondayTechBoardId') || '';
    
    if (!apiKey || !boardId || !techBoardId) {
      return {
        connected: false,
        message: "Configuration Monday.com manquante"
      };
    }
    
    const validation = await validateMondayConfig(apiKey, boardId, techBoardId);
    
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
