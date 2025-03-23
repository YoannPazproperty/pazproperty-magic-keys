
import { toast } from "sonner";
import { 
  Declaration, 
  TechnicianReport, 
  MondayConfigValidation,
  MondayConnectionStatus,
  TechnicianReportResult,
  issueTypeToMondayMap,
  urgencyToMondayMap,
  TECHNICIAN_BOARD_ID
} from "./types";
import { getMondayConfig, saveMondayConfig } from "./storageService";

// Validation and testing of Monday.com configuration
export const validateMondayConfig = async (apiKey: string, boardId: string): Promise<MondayConfigValidation> => {
  try {
    console.log("Validating Monday.com configuration...");
    
    // Query for boards
    const testQuery = `
      query {
        boards(ids: ${boardId}) {
          name
        }
      }
    `;
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey
      },
      body: JSON.stringify({ query: testQuery })
    });
    
    const result = await response.json();
    
    if (result.errors) {
      console.error("Monday.com configuration test error:", result.errors);
      return {
        valid: false,
        message: result.errors[0]?.message || "Configuração inválida. Verifique a chave API e o ID do quadro."
      };
    }
    
    // Check if we got a valid board response
    if (!result.data?.boards?.[0]) {
      return {
        valid: false,
        message: "Quadro não encontrado. Verifique o ID do quadro."
      };
    }
    
    return {
      valid: true,
      message: `Configuração validada com sucesso. Quadro: ${result.data.boards[0].name}`
    };
  } catch (error) {
    console.error("Error validating Monday.com configuration:", error);
    return {
      valid: false,
      message: "Ocorreu um erro ao testar a configuração."
    };
  }
};

// Set Monday.com API configuration
export const setMondayConfig = async (apiKey: string, boardId: string): Promise<MondayConfigValidation> => {
  try {
    const validationResult = await validateMondayConfig(apiKey, boardId);
    
    if (validationResult.valid) {
      // Save the validated configuration
      saveMondayConfig(apiKey, boardId);
      console.log("Monday.com configuration saved successfully");
    }
    
    return validationResult;
  } catch (error) {
    console.error("Error setting Monday.com configuration:", error);
    return {
      valid: false,
      message: "Ocorreu um erro ao testar a configuração."
    };
  }
};

// Get Monday.com connection status
export const getMonday5BoardStatus = async (): Promise<MondayConnectionStatus> => {
  try {
    // Get Monday.com API key and board ID
    const config = getMondayConfig();
    
    if (!config.apiKey) {
      return { 
        connected: false, 
        message: "Chave de API Monday.com não encontrada." 
      };
    }
    
    if (!config.boardId) {
      return { 
        connected: false, 
        message: "ID do quadro Monday.com não encontrado." 
      };
    }
    
    // Test the connection with a simple query
    const query = `
      query {
        boards(ids: ${config.boardId}) {
          name
        }
      }
    `;
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": config.apiKey
      },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    
    if (result.errors) {
      console.error("Monday.com connection test error:", result.errors);
      return { 
        connected: false, 
        message: result.errors[0]?.message || "Erro na conexão com Monday.com." 
      };
    }
    
    return { 
      connected: true, 
      message: `Conexão estabelecida com sucesso. Quadro: ${result.data?.boards?.[0]?.name || "Desconhecido"}` 
    };
  } catch (error) {
    console.error("Error checking Monday.com connection:", error);
    return { 
      connected: false, 
      message: "Erro ao verificar a conexão com Monday.com." 
    };
  }
};

// Sync declarations from Monday.com
export const syncFromMonday = async (): Promise<boolean> => {
  try {
    console.log("Starting sync from Monday.com...");
    
    // Get Monday.com API key and board ID
    const config = getMondayConfig();
    
    if (!config.apiKey) {
      console.error("Missing Monday.com API key");
      return false;
    }
    
    if (!config.boardId) {
      console.error("Missing Monday.com board ID");
      return false;
    }
    
    // Query for items in Monday.com board
    const query = `
      query {
        boards(ids: ${config.boardId}) {
          items {
            id
            name
            column_values {
              id
              text
              value
            }
          }
        }
      }
    `;
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": config.apiKey
      },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    console.log("Monday.com sync response:", result);
    
    if (result.errors) {
      console.error("Monday.com sync error:", result.errors);
      toast.error("Erreur de synchronisation Monday.com", {
        description: result.errors[0]?.message || "Vérifiez vos paramètres d'API et réessayez."
      });
      return false;
    }
    
    // Process items from Monday.com
    const items = result.data?.boards[0]?.items || [];
    if (items.length === 0) {
      console.log("No items found in Monday.com board");
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error syncing from Monday.com:", error);
    toast.error("Erreur de synchronisation", {
      description: "Une erreur s'est produite lors de la synchronisation avec Monday.com."
    });
    return false;
  }
};

// Update status in Monday.com - Updated to Portuguese status values
export const updateMondayStatus = async (mondayItemId: string, status: Declaration["status"]): Promise<boolean> => {
  try {
    console.log(`Updating Monday.com item ${mondayItemId} status to ${status}`);
    
    // Get Monday.com API key and board ID
    const config = getMondayConfig();
    
    if (!config.apiKey) {
      console.error("Missing Monday.com API key");
      return false;
    }
    
    if (!config.boardId) {
      console.error("Missing Monday.com board ID");
      return false;
    }
    
    // Map application status to Monday.com status - Updated to Portuguese
    let mondayStatus = "Novo";
    switch (status) {
      case "in_progress":
        mondayStatus = "Em progresso";
        break;
      case "resolved":
        mondayStatus = "Resolvido";
        break;
      case "pending":
      default:
        mondayStatus = "Novo";
    }
    
    // Update status in Monday.com using GraphQL mutation
    const columnValues = {
      "status": { "label": mondayStatus }
    };
    
    const query = `
      mutation {
        change_column_value(
          board_id: ${config.boardId}, 
          item_id: ${mondayItemId}, 
          column_id: "status", 
          value: ${JSON.stringify(JSON.stringify(columnValues.status))}
        ) {
          id
        }
      }
    `;
    
    console.log("Monday.com status update query:", query);
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": config.apiKey
      },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    console.log("Monday.com status update response:", result);
    
    if (result.errors) {
      console.error("Monday.com status update error:", result.errors);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating Monday.com status:", error);
    return false;
  }
};

// Send declaration to Monday.com - Using Portuguese column names
export const sendDeclarationToMonday = async (declaration: Declaration): Promise<boolean> => {
  try {
    console.log("Sending to Monday.com:", declaration);
    
    // Get Monday.com configuration
    const config = getMondayConfig();
    
    if (!config.apiKey) {
      console.warn("No Monday.com API key found in localStorage");
      return false;
    }
    
    if (!config.boardId) {
      console.warn("No Monday.com board ID found in localStorage");
      return false;
    }
    
    // Prepare the data for Monday.com - Use more useful name format - Updated to Portuguese
    const itemName = `Nova declaração - ${declaration.name}`;
    
    // Get postal code and city from address if available
    const postalCodeMatch = declaration.property.match(/\d{4,}(?:-\d+)?/);
    const postalCode = postalCodeMatch ? postalCodeMatch[0] : "";
    
    // Get city from address - using the last part after comma
    const addressParts = declaration.property.split(',');
    const city = addressParts.length > 0 ? addressParts[addressParts.length - 2]?.trim() || "" : "";
    
    // Using exact column IDs with Portuguese labels
    const columnValues = {
      "text_mknxg830": declaration.name, // Nome do Inquilino
      "email_mknxfg3r": { "email": declaration.email, "text": declaration.email }, // E-mail Inquilino
      "phone_mknyw109": { "phone": declaration.phone, "countryShortName": "PT" }, // Telefone
      "text_mknx4pjn": declaration.property, // Morada do Inquilino
      "text_mknxny1h": issueTypeToMondayMap[declaration.issueType] || declaration.issueType, // Tipo de problema
      "text_mknxj2e7": declaration.description, // Descrição do problema
      "numeric_mknx2s4b": declaration.nif || "", // NIF
      "text_mknxq2zr": postalCode, // Código Postal
      "text_mknxe74j": city, // Cidade
      "status": { "label": "Novo" } // Estado - Using "Novo" as default
    };
    
    // Add file URLs if present - this assumes we've added a file column to Monday.com
    if (declaration.mediaFiles && declaration.mediaFiles.length > 0) {
      // Note: This is a placeholder. For actual file uploads to Monday.com,
      // we would need to convert dataURLs back to files and use Monday's API
      // for file uploads, then link those files to the item.
      console.log("Media files to send:", declaration.mediaFiles.length);
    }
    
    console.log("Monday.com column values:", JSON.stringify(columnValues));
    
    // Build the GraphQL mutation to create a new item in Monday.com
    const query = `
      mutation {
        create_item (
          board_id: ${config.boardId}, 
          item_name: "${itemName}", 
          column_values: ${JSON.stringify(JSON.stringify(columnValues))}
        ) {
          id
        }
      }
    `;
    
    console.log("Monday.com GraphQL query:", query);
    
    // Send the request to Monday.com's API
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": config.apiKey
      },
      body: JSON.stringify({ query })
    });
    
    const responseData = await response.text();
    console.log("Monday.com API raw response:", responseData);
    
    let result;
    try {
      result = JSON.parse(responseData);
    } catch (e) {
      console.error("Failed to parse Monday.com response:", e);
      toast.error("Erreur de format de réponse Monday.com", {
        description: "La réponse de l'API n'est pas au format JSON attendu."
      });
      return false;
    }
    
    if (result.errors) {
      console.error("Monday.com API error:", result.errors);
      toast.error("Erreur lors de l'envoi à Monday.com", {
        description: result.errors[0]?.message || "Vérifiez vos paramètres d'API et réessayez."
      });
      return false;
    }
    
    // If we got here, the request succeeded. Extract the Monday.com item ID and return it
    if (result.data?.create_item?.id) {
      const mondayItemId = result.data.create_item.id;
      
      toast.success("Déclaration envoyée à Monday.com", {
        description: `Référence Monday.com: ${mondayItemId}`
      });
      
      return true;
    } else {
      console.warn("Monday.com API response does not contain expected item ID");
      return false;
    }
  } catch (error) {
    console.error("Error sending to Monday.com:", error);
    toast.error("Erreur lors de l'envoi à Monday.com", {
      description: "Une erreur s'est produite lors de la tentative d'envoi de la déclaration."
    });
    return false;
  }
};

// Send technician report to Monday.com
export const sendTechnicianReportToMonday = async (report: TechnicianReport): Promise<TechnicianReportResult> => {
  try {
    console.log("Sending technician report to Monday.com:", report);
    
    // Get Monday.com configuration
    const config = getMondayConfig();
    
    if (!config.apiKey) {
      return {
        success: false,
        message: "Chave de API Monday.com não encontrada."
      };
    }
    
    // Get board ID from localStorage or use technician board ID
    const boardId = config.boardId || TECHNICIAN_BOARD_ID;
    if (!boardId) {
      return {
        success: false,
        message: "ID do quadro Monday.com não encontrado."
      };
    }
    
    // Prepare the data for Monday.com
    const itemName = `Relatório Técnico - ${report.clientName}`;
    
    // Map our report fields to Monday.com column IDs - Using Portuguese column names
    const columnValues = {
      "personne": report.clientName, // Nome do Cliente
      "text": report.address, // Morada
      "text1": report.diagnoseDescription, // Descrição do diagnóstico
      "numbers": report.estimateAmount, // Valor do orçamento
      "status": { "label": report.needsIntervention ? "Intervenção necessária" : "Resolvido" }, // Estado
      "text6": report.workDescription, // Trabalhos a realizar
      "email": { "email": report.clientEmail, "text": report.clientEmail }, // E-mail do Cliente
      "phone": { "phone": report.clientPhone, "countryShortName": "PT" }, // Telefone do Cliente
      "text0": report.problemCategory, // Categoria do problema
      "date4": report.date // Data da intervenção
    };
    
    console.log("Monday.com column values for technician report:", JSON.stringify(columnValues));
    
    // Build the GraphQL mutation to create a new item in Monday.com
    const query = `
      mutation {
        create_item (
          board_id: ${boardId}, 
          item_name: "${itemName}", 
          column_values: ${JSON.stringify(JSON.stringify(columnValues))}
        ) {
          id
        }
      }
    `;
    
    console.log("Monday.com GraphQL query for technician report:", query);
    
    // Send the request to Monday.com's API
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": config.apiKey
      },
      body: JSON.stringify({ query })
    });
    
    const responseData = await response.text();
    console.log("Monday.com API raw response:", responseData);
    
    let result;
    try {
      result = JSON.parse(responseData);
    } catch (e) {
      console.error("Failed to parse Monday.com response:", e);
      return {
        success: false,
        message: "A resposta da API não está no formato JSON esperado."
      };
    }
    
    if (result.errors) {
      console.error("Monday.com API error:", result.errors);
      return {
        success: false,
        message: result.errors[0]?.message || "Verifique as configurações da API e tente novamente."
      };
    }
    
    // Extract the Monday.com item ID
    if (result.data?.create_item?.id) {
      const mondayItemId = result.data.create_item.id;
      
      return {
        success: true,
        message: "Relatório enviado com sucesso para Monday.com",
        mondayItemId
      };
    } else {
      console.warn("Monday.com API response does not contain expected item ID");
      return {
        success: false,
        message: "A resposta da API não contém o ID do item esperado."
      };
    }
  } catch (error) {
    console.error("Error sending technician report to Monday.com:", error);
    return {
      success: false,
      message: "Ocorreu um erro ao enviar o relatório para Monday.com."
    };
  }
};

// Setup webhook for Monday.com notifications
export const setupNotificationWebhook = async (webhookUrl: string, events: string[] = ["status_change"]) => {
  try {
    console.log("Setting up Monday.com notification webhook:", webhookUrl);
    
    // Get Monday.com API key and board ID
    const config = getMondayConfig();
    
    if (!config.apiKey) {
      return { 
        success: false, 
        message: "Clé API Monday.com manquante." 
      };
    }
    
    if (!config.boardId) {
      return { 
        success: false, 
        message: "ID du tableau Monday.com manquant." 
      };
    }
    
    // Create webhook in Monday.com using GraphQL mutation
    const query = `
      mutation {
        create_webhook(board_id: ${config.boardId}, url: "${webhookUrl}", event: "change_column_value", config: "${JSON.stringify({ columnId: "status" })}") {
          id
          board_id
        }
      }
    `;
    
    console.log("Monday.com webhook creation query:", query);
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": config.apiKey
      },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    console.log("Monday.com webhook creation response:", result);
    
    if (result.errors) {
      console.error("Monday.com webhook creation error:", result.errors);
      return { 
        success: false, 
        message: result.errors[0]?.message || "Erreur lors de la création du webhook."
      };
    }
    
    if (result.data?.create_webhook?.id) {
      return {
        success: true,
        message: "Webhook de notification configuré avec succès.",
        webhookId: result.data.create_webhook.id
      };
    } else {
      return {
        success: false,
        message: "La réponse de l'API n'a pas renvoyé l'ID attendu."
      };
    }
  } catch (error) {
    console.error("Error setting up Monday.com notification webhook:", error);
    return {
      success: false,
      message: "Une erreur s'est produite lors de la configuration du webhook."
    };
  }
};

// Get all webhook integrations for a board
export const getWebhookIntegrations = async () => {
  try {
    // Get Monday.com API key and board ID
    const config = getMondayConfig();
    
    if (!config.apiKey) {
      return { 
        success: false, 
        message: "Clé API Monday.com manquante." 
      };
    }
    
    if (!config.boardId) {
      return { 
        success: false, 
        message: "ID du tableau Monday.com manquant." 
      };
    }
    
    // Query for webhooks
    const query = `
      query {
        webhooks {
          id
          board_id
          url
          event
        }
      }
    `;
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": config.apiKey
      },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    console.log("Monday.com webhooks response:", result);
    
    if (result.errors) {
      console.error("Monday.com webhooks query error:", result.errors);
      return { 
        success: false, 
        message: result.errors[0]?.message || "Erreur lors de la récupération des webhooks."
      };
    }
    
    // Filter webhooks for the specified board
    const boardWebhooks = result.data?.webhooks?.filter((webhook: any) => 
      webhook.board_id === parseInt(config.boardId)
    ) || [];
    
    return {
      success: true,
      webhooks: boardWebhooks
    };
  } catch (error) {
    console.error("Error getting Monday.com webhooks:", error);
    return {
      success: false,
      message: "Une erreur s'est produite lors de la récupération des webhooks."
    };
  }
};

// Delete a webhook integration
export const deleteWebhook = async (webhookId: string) => {
  try {
    // Get Monday.com API key and board ID
    const config = getMondayConfig();
    
    if (!config.apiKey) {
      return { 
        success: false, 
        message: "Clé API Monday.com manquante." 
      };
    }
    
    // Delete webhook using GraphQL mutation
    const query = `
      mutation {
        delete_webhook(id: ${webhookId}) {
          id
        }
      }
    `;
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": config.apiKey
      },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    console.log("Monday.com webhook deletion response:", result);
    
    if (result.errors) {
      console.error("Monday.com webhook deletion error:", result.errors);
      return { 
        success: false, 
        message: result.errors[0]?.message || "Erreur lors de la suppression du webhook."
      };
    }
    
    return {
      success: true,
      message: "Webhook supprimé avec succès."
    };
  } catch (error) {
    console.error("Error deleting Monday.com webhook:", error);
    return {
      success: false,
      message: "Une erreur s'est produite lors de la suppression du webhook."
    };
  }
};

export default {
  setMondayConfig,
  validateMondayConfig,
  getMonday5BoardStatus,
  syncFromMonday,
  sendDeclarationToMonday,
  sendTechnicianReportToMonday,
  updateMondayStatus,
  setupNotificationWebhook,
  getWebhookIntegrations,
  deleteWebhook
};
