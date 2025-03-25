
// Load Monday.com configuration from localStorage
export const getMondayConfig = () => {
  const apiKey = localStorage.getItem('mondayApiKey') || '';
  const boardId = localStorage.getItem('mondayBoardId') || '';
  const techBoardId = localStorage.getItem('mondayTechBoardId') || '';
  const eventosGroupId = localStorage.getItem('mondayEventosGroupId') || '';
  
  return {
    apiKey,
    boardId,
    techBoardId,
    eventosGroupId,
  };
};

// Save Monday.com configuration to localStorage
export const saveMondayConfig = (
  apiKey: string, 
  boardId: string, 
  techBoardId?: string,
  eventosGroupId?: string
) => {
  localStorage.setItem('mondayApiKey', apiKey);
  localStorage.setItem('mondayBoardId', boardId);
  
  if (techBoardId) {
    localStorage.setItem('mondayTechBoardId', techBoardId);
  }
  
  if (eventosGroupId) {
    localStorage.setItem('mondayEventosGroupId', eventosGroupId);
  }
  
  console.log("Monday.com configuration saved:", { 
    apiKey: apiKey ? "Set" : "Empty", 
    boardId, 
    techBoardId,
    eventosGroupId
  });
};

// Validate Monday.com configuration
export interface MondayConfigValidation {
  valid: boolean;
  message: string;
}

export const validateMondayConfig = async (): Promise<MondayConfigValidation> => {
  const { apiKey, boardId, techBoardId } = getMondayConfig();
  
  if (!apiKey) {
    return {
      valid: false,
      message: "API key não configurada"
    };
  }
  
  if (!boardId) {
    return {
      valid: false,
      message: "Board ID não configurado"
    };
  }
  
  if (!techBoardId) {
    return {
      valid: false,
      message: "Tech Board ID não configurado"
    };
  }
  
  try {
    // Test API connection with a simple query
    const query = `query { boards(ids: ${parseInt(boardId)}) { name } }`;
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      return {
        valid: false,
        message: `Erro de conexão: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    
    if (data.errors) {
      return {
        valid: false,
        message: `Erro de API: ${data.errors[0]?.message || "Erro desconhecido"}`
      };
    }
    
    return {
      valid: true,
      message: "Configuração válida"
    };
  } catch (error) {
    console.error("Error validating Monday.com config:", error);
    return {
      valid: false,
      message: `Erro de validação: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    };
  }
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
    
    // Test API connection with a simple query
    const query = `query { boards(ids: ${parseInt(boardId)}) { name } }`;
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      return {
        valid: false,
        message: `Erro de conexão: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    
    if (data.errors) {
      return {
        valid: false,
        message: `Erro de API: ${data.errors[0]?.message || "Erro desconhecido"}`
      };
    }
    
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

// Get board groups
export const getBoardGroups = async (boardId: string): Promise<Array<{ id: string, title: string }> | null> => {
  try {
    const { apiKey } = getMondayConfig();
    
    if (!apiKey || !boardId) {
      console.error("Monday.com API key or board ID not configured");
      return null;
    }
    
    const query = `query {
      boards(ids: ${parseInt(boardId)}) {
        groups {
          id
          title
        }
      }
    }`;
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      console.error(`Error getting board groups: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      return null;
    }
    
    if (data.data?.boards?.[0]?.groups) {
      return data.data.boards[0].groups;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting Monday.com board groups:", error);
    return null;
  }
};
