
import { toast } from "sonner";
import { MondayConfigValidation, MondayConnectionStatus } from "./types";

export const mondayService = {
  // Set Monday.com API key and board ID
  setMondayConfig: async (apiKey: string, boardId: string): Promise<MondayConfigValidation> => {
    // This is just simulating an API call since we're not connecting to a real API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!apiKey || !boardId) {
      return {
        valid: false,
        message: "L'API key et l'ID du board sont requis"
      };
    }
    
    // Store in localStorage
    localStorage.setItem('mondayApiKey', apiKey);
    localStorage.setItem('mondayBoardId', boardId);
    
    return {
      valid: true,
      message: "Configuration validée avec succès"
    };
  },
  
  // Validate Monday.com configuration
  validateMondayConfig: async (apiKey: string, boardId: string): Promise<MondayConfigValidation> => {
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!apiKey) {
      return {
        valid: false,
        message: "L'API key de Monday.com est requise"
      };
    }
    
    if (!boardId) {
      return {
        valid: false,
        message: "L'ID du board Monday.com est requis"
      };
    }
    
    // In a real-world scenario, we would validate with the Monday.com API
    return {
      valid: true,
      message: "Configuration valide"
    };
  },
  
  // Get the connection status for a board
  getBoardConnectionStatus: async (boardId: string): Promise<MondayConnectionStatus> => {
    // Get the API key from localStorage
    const apiKey = localStorage.getItem('mondayApiKey');
    
    if (!apiKey) {
      return {
        connected: false,
        message: "API key non configurée"
      };
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      connected: true,
      message: "Connecté à Monday.com Board ID: " + boardId
    };
  },
  
  // Create a new item in Monday.com
  createItem: async (itemName: string, columnValues: Record<string, string>): Promise<string | null> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a fake Monday.com item ID
    const mondayItemId = Math.floor(Math.random() * 1000000000).toString();
    
    return mondayItemId;
  },
  
  // Create a technician report in Monday.com
  createTechnicianReport: async (itemName: string, columnValues: Record<string, string>): Promise<string | null> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a fake Monday.com item ID
    const mondayItemId = Math.floor(Math.random() * 1000000000).toString();
    
    return mondayItemId;
  },
  
  // Get recent items from a board
  getRecentItems: async (boardId: string, limit: number = 10): Promise<any[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return example items
    return Array(limit).fill(null).map((_, index) => ({
      id: Math.floor(Math.random() * 1000000000).toString(),
      name: `Item ${index + 1}`,
      createdAt: new Date(Date.now() - index * 86400000).toISOString()
    }));
  },
  
  // Delete a Monday.com item
  deleteItem: async (itemId: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  },
  
  // Validate the configuration
  validateConfig: async (): Promise<MondayConfigValidation> => {
    const apiKey = localStorage.getItem('mondayApiKey');
    const boardId = localStorage.getItem('mondayBoardId');
    
    if (!apiKey || !boardId) {
      return {
        valid: false,
        message: "Configuration Monday.com incomplète"
      };
    }
    
    // In a real scenario, we would validate with the Monday.com API
    return {
      valid: true,
      message: "Configuration Monday.com valide"
    };
  }
};
