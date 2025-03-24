
// Load Monday.com configuration from localStorage
export const getMondayConfig = () => {
  const apiKey = localStorage.getItem('mondayApiKey') || '';
  const boardId = localStorage.getItem('mondayBoardId') || '';
  const techBoardId = localStorage.getItem('mondayTechBoardId') || '';
  
  return {
    apiKey,
    boardId,
    techBoardId,
  };
};

// Save Monday.com configuration to localStorage
export const saveMondayConfig = (apiKey: string, boardId: string, techBoardId?: string) => {
  localStorage.setItem('mondayApiKey', apiKey);
  localStorage.setItem('mondayBoardId', boardId);
  
  if (techBoardId) {
    localStorage.setItem('mondayTechBoardId', techBoardId);
  }
};

// Validate Monday.com configuration
export interface MondayConfigValidation {
  valid: boolean;
  message: string;
}

export const validateMondayConfig = async (): Promise<MondayConfigValidation> => {
  const { apiKey, boardId } = getMondayConfig();
  
  if (!apiKey || !boardId) {
    return {
      valid: false,
      message: "API key ou Board ID não configurados"
    };
  }
  
  // In a real implementation, we would make an API call to Monday.com here
  // For now, we'll just check if the values exist
  return {
    valid: true,
    message: "Configuração válida"
  };
};

// Check Monday board status
export const getMonday5BoardStatus = async (): Promise<{ valid: boolean; message: string }> => {
  try {
    const { apiKey, boardId } = getMondayConfig();
    
    if (!apiKey || !boardId) {
      return {
        valid: false,
        message: "Monday.com não configurado"
      };
    }
    
    // In a real implementation, we would make an API call to Monday.com here
    // For now, we'll just return a success message
    return {
      valid: true,
      message: "Monday.com boards conectados"
    };
  } catch (error) {
    console.error("Error checking Monday.com board status:", error);
    return {
      valid: false,
      message: "Erro ao verificar status do Monday.com"
    };
  }
};
