
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

// Create Monday.com item based on the actual board structure
export const createMondayItem = async (itemName: string, columnValues: Record<string, any>): Promise<string | null> => {
  try {
    // In a real app, this would make an API call to Monday.com
    // For demonstration, we'll just log the values that would be sent
    
    console.log("Creating Monday.com item with the following data:");
    console.log("Item Name:", itemName);
    
    // Log column values in a way that matches the actual Monday.com board structure
    // Updated column mapping to include all required fields
    const mondayColumnMap = {
      // Map our internal field names to the actual Monday.com column IDs
      nome_do_cliente: "Nome do Inquilino",    // client name
      email: "Email",                          // client email
      telefone: "Telefone",                    // client phone
      nif: "NIF",                              // fiscal number
      endereco: "Endereço",                    // property address
      cidade: "Cidade",                        // city
      codigo_postal: "Codigo Postal",          // postal code
      tipo_de_problema: "Tipo de problema",    // issue type
      descricao: "Descrição",                  // description
      urgencia: "Urgência",                    // urgency
      status: "Status",                        // status
      id_declaracao: "ID Declaração",          // declaration ID
      upload_inquilino: "Upload do Inquilino", // uploaded files
      data_submissao: "Data de submissão"      // submission date
    };
    
    // Transform the column values to match Monday.com column IDs
    const mondayFormatValues: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(columnValues)) {
      if (mondayColumnMap[key]) {
        mondayFormatValues[mondayColumnMap[key]] = value;
      } else {
        // For fields not in our map, keep them as is
        mondayFormatValues[key] = value;
      }
    }
    
    console.log("Monday.com formatted column values:", mondayFormatValues);
    
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
    console.log("Creating technician report in Monday.com:");
    console.log("Item Name:", itemName);
    
    // Map our internal field names to the actual Monday.com column IDs for technician reports
    const techReportColumnMap = {
      diagnóstico: "Diagnóstico", 
      necessita_de_intervenção: "Necessita intervenção",
      valor_estimado: "Valor estimado",
      trabalhos_a_realizar: "Trabalhos a realizar",
      cliente: "Nome do Cliente",
      email: "Email", 
      telefone: "Telefone",
      endereço: "Endereço",
      categoria_do_problema: "Categoria do problema",
      id_intervenção: "ID Intervenção"
    };
    
    // Transform the column values to match Monday.com column IDs
    const mondayFormatValues: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(columnValues)) {
      if (techReportColumnMap[key]) {
        mondayFormatValues[techReportColumnMap[key]] = value;
      } else {
        // For fields not in our map, keep them as is
        mondayFormatValues[key] = value;
      }
    }
    
    console.log("Monday.com formatted column values for technician report:", mondayFormatValues);
    
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
