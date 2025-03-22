
import { toast } from "sonner";

// Declaration interface
export interface Declaration {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  issueType: string;
  description: string;
  urgency: string;
  status: "pending" | "in_progress" | "resolved";
  submittedAt: string;
  nif?: string;
  mondayId?: string;
  mediaFiles?: string[]; // URLs to uploaded media files (photos/videos)
}

// Technician report interface
export interface TechnicianReport {
  interventionId: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  address: string;
  problemCategory: string;
  diagnoseDescription: string;
  needsIntervention: boolean;
  estimateAmount: string;
  workDescription: string;
  date: string;
}

// Example/mock declarations to start with
const initialDeclarations: Declaration[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "+351 912 345 678",
    property: "Avenida de Lisboa, 1",
    issueType: "plumbing",
    description: "Il y a une fuite d'eau dans la salle de bain principale.",
    urgency: "high",
    status: "in_progress",
    submittedAt: "2024-03-18T14:30:00Z",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "+351 923 456 789",
    property: "Rua do Comércio, 23",
    issueType: "electrical",
    description: "La prise électrique dans la cuisine ne fonctionne pas.",
    urgency: "medium",
    status: "pending",
    submittedAt: "2024-03-17T10:15:00Z",
  },
  {
    id: "3",
    name: "António Ferreira",
    email: "antonio.ferreira@email.com",
    phone: "+351 934 567 890",
    property: "Praça do Rossio, 45",
    issueType: "heating",
    description: "Le chauffage central ne chauffe pas correctement.",
    urgency: "medium",
    status: "pending",
    submittedAt: "2024-03-16T08:45:00Z",
  },
  {
    id: "4",
    name: "Sofia Lopes",
    email: "sofia.lopes@email.com",
    phone: "+351 945 678 901",
    property: "Rua Augusta, 78",
    issueType: "pest",
    description: "J'ai vu des cafards dans la cuisine à plusieurs reprises.",
    urgency: "low",
    status: "resolved",
    submittedAt: "2024-03-15T16:20:00Z",
  },
];

// Store declarations in localStorage to persist between page loads
const loadDeclarations = (): Declaration[] => {
  const stored = localStorage.getItem('declarations');
  return stored ? JSON.parse(stored) : initialDeclarations;
};

const saveDeclarations = (declarations: Declaration[]) => {
  localStorage.setItem('declarations', JSON.stringify(declarations));
};

// Initialize declarations
let declarations = loadDeclarations();

// Translation maps for Monday.com
const issueTypeToMondayMap: Record<string, string> = {
  plomberie: "Plomberie",
  electricite: "Électrique",
  serrurerie: "Serrurerie",
  menuiserie: "Menuiserie",
  chauffage: "Chauffage/Climatisation",
  pest: "Nuisibles",
  other: "Autre"
};

const urgencyToMondayMap: Record<string, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Élevée",
  emergency: "Urgence"
};

// Monday.com board configurations
const TECHNICIAN_BOARD_ID = "1863361499"; // The board ID specified by the user

// Declaration service
const declarationService = {
  // Get all declarations
  getAll: () => {
    return [...declarations];
  },
  
  // Add a new declaration
  add: (newDeclaration: Omit<Declaration, "id" | "status" | "submittedAt">) => {
    const declaration: Declaration = {
      ...newDeclaration,
      id: Math.random().toString(36).substring(2, 9),
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    
    declarations = [declaration, ...declarations];
    saveDeclarations(declarations);
    return declaration;
  },
  
  // Add a new declaration with media files
  addWithMedia: (newDeclaration: Omit<Declaration, "id" | "status" | "submittedAt">, mediaFiles: File[]) => {
    // First create a basic declaration
    const declaration: Declaration = {
      ...newDeclaration,
      id: Math.random().toString(36).substring(2, 9),
      status: "pending",
      submittedAt: new Date().toISOString(),
      mediaFiles: [], // Initialize empty array for media URLs
    };
    
    // Convert files to data URLs for storage
    const processFiles = async () => {
      const mediaUrls: string[] = [];
      
      for (const file of mediaFiles) {
        try {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          
          mediaUrls.push(dataUrl);
        } catch (error) {
          console.error("Error processing file:", error);
          toast.error("Erreur lors du traitement du fichier", {
            description: `Impossible de traiter le fichier: ${file.name}`
          });
        }
      }
      
      // Update declaration with media URLs
      declaration.mediaFiles = mediaUrls;
      declarations = [declaration, ...declarations];
      saveDeclarations(declarations);
      
      return declaration;
    };
    
    return processFiles();
  },
  
  // Update declaration status
  updateStatus: (id: string, status: Declaration["status"]) => {
    declarations = declarations.map(declaration => 
      declaration.id === id ? { ...declaration, status } : declaration
    );
    saveDeclarations(declarations);
    return declarations.find(d => d.id === id);
  },
  
  // Send declaration to Monday.com
  sendToExternalService: async (declaration: Declaration) => {
    try {
      console.log("Sending to Monday.com:", declaration);
      
      // Get Monday.com API key from localStorage or prompt user
      const mondayApiKey = localStorage.getItem('mondayApiKey');
      if (!mondayApiKey) {
        toast.error("Clé API Monday.com manquante", {
          description: "Veuillez configurer votre clé API dans les paramètres d'administration."
        });
        return false;
      }
      
      // Get board ID from localStorage or use default
      const mondayBoardId = localStorage.getItem('mondayBoardId') || '';
      if (!mondayBoardId) {
        toast.error("ID du tableau Monday.com manquant", {
          description: "Veuillez configurer l'ID du tableau dans les paramètres d'administration."
        });
        return false;
      }
      
      // Prepare the data for Monday.com - Use more useful name format
      const itemName = `Nouvelle déclaration - ${declaration.name}`;
      
      // Get postal code and city from address if available
      const postalCodeMatch = declaration.property.match(/\d{4,}(?:-\d+)?/);
      const postalCode = postalCodeMatch ? postalCodeMatch[0] : "";
      
      // Get city from address - using the last part after comma
      const addressParts = declaration.property.split(',');
      const city = addressParts.length > 0 ? addressParts[addressParts.length - 2]?.trim() || "" : "";
      
      // Based on the Monday.com columns from the console log, we need to use the column IDs
      const columnValues = {
        // Using exact column IDs from the console log
        "text_mknxg830": declaration.name, // Nome do Inquilino
        "email_mknxfg3r": { "email": declaration.email, "text": declaration.email }, // E-mail Inquilino
        "phone_mknyw109": { "phone": declaration.phone, "countryShortName": "PT" }, // Telefone
        "text_mknx4pjn": declaration.property, // Endereço do Inquilino
        "text_mknxny1h": issueTypeToMondayMap[declaration.issueType] || declaration.issueType, // Tipo de problema
        "text_mknxj2e7": declaration.description, // Explicação do problema
        "numeric_mknx2s4b": declaration.nif || "", // NIF as a number
        "text_mknxq2zr": postalCode, // Codigo Postal
        "text_mknxe74j": city, // Cidade
        "status": { "label": "Nouveau" } // Status - Using "Nouveau" as default
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
            board_id: ${mondayBoardId}, 
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
          "Authorization": mondayApiKey
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
      
      if (result.data?.create_item?.id) {
        toast.success("Envoyé à Monday.com", {
          description: `Déclaration créée avec succès dans Monday.com (ID: ${result.data.create_item.id})`
        });
        
        // Update the declaration with external ID
        declarations = declarations.map(d => 
          d.id === declaration.id ? { ...d, mondayId: result.data.create_item.id } : d
        );
        saveDeclarations(declarations);
        
        return true;
      } else {
        console.error("Unexpected Monday.com response format:", result);
        toast.error("Erreur lors de l'envoi à Monday.com", {
          description: "La réponse de l'API n'a pas renvoyé l'ID attendu."
        });
        return false;
      }
    } catch (error) {
      console.error("Error sending to Monday.com:", error);
      toast.error("Échec de l'envoi à Monday.com", {
        description: "Une erreur s'est produite lors de la communication avec l'API."
      });
      return false;
    }
  },
  
  // Send technician report to Monday.com (board ID 1863361499)
  sendTechnicianReportToMonday: async (report: TechnicianReport) => {
    try {
      console.log("Sending technician report to Monday.com:", report);
      
      // Get Monday.com API key from localStorage
      const mondayApiKey = localStorage.getItem('mondayApiKey');
      if (!mondayApiKey) {
        return { 
          success: false, 
          message: "Clé API Monday.com manquante. Veuillez configurer votre clé API dans les paramètres d'administration." 
        };
      }
      
      // Using the specified board ID
      const mondayBoardId = TECHNICIAN_BOARD_ID;
      
      // Format the item name for Monday.com
      const itemName = `Rapport technique - ${report.clientName} - ${new Date().toLocaleDateString()}`;
      
      // Prepare column values based on the Technician Report board structure
      const columnValues = {
        // These column IDs should match your Monday.com board columns
        "personne": { "text": report.clientName },
        "text": report.address,
        "text1": report.diagnoseDescription,
        "numbers": parseFloat(report.estimateAmount) || 0,
        "status": { "label": report.needsIntervention ? "Intervention requise" : "Résolu" },
        "text6": report.workDescription,
        "email": { "email": report.clientEmail, "text": report.clientEmail },
        "phone": { "phone": report.clientPhone, "countryShortName": "FR" },
        "text0": report.problemCategory,
        // Add the date in the format Monday.com expects
        "date4": { 
          "date": new Date().toISOString().split('T')[0],
          "time": new Date().toISOString().split('T')[1].substring(0, 5)
        }
      };
      
      console.log("Monday.com column values for technician report:", JSON.stringify(columnValues));
      
      // Build the GraphQL mutation for creating an item in Monday.com
      const query = `
        mutation {
          create_item (
            board_id: ${mondayBoardId}, 
            item_name: "${itemName}", 
            column_values: ${JSON.stringify(JSON.stringify(columnValues))}
          ) {
            id
          }
        }
      `;
      
      console.log("Monday.com GraphQL query for technician report:", query);
      
      // Send the request to Monday.com API
      const response = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": mondayApiKey
        },
        body: JSON.stringify({ query })
      });
      
      const responseData = await response.text();
      console.log("Monday.com API raw response for technician report:", responseData);
      
      let result;
      try {
        result = JSON.parse(responseData);
      } catch (e) {
        console.error("Failed to parse Monday.com response:", e);
        return {
          success: false,
          message: "La réponse de l'API n'est pas au format JSON attendu."
        };
      }
      
      if (result.errors) {
        console.error("Monday.com API error for technician report:", result.errors);
        return {
          success: false,
          message: result.errors[0]?.message || "Erreur lors de l'envoi à Monday.com. Vérifiez vos paramètres d'API."
        };
      }
      
      if (result.data?.create_item?.id) {
        return {
          success: true,
          message: "Rapport envoyé avec succès à Monday.com",
          mondayItemId: result.data.create_item.id
        };
      } else {
        console.error("Unexpected Monday.com response format for technician report:", result);
        return {
          success: false,
          message: "La réponse de l'API n'a pas renvoyé l'ID attendu."
        };
      }
    } catch (error) {
      console.error("Error sending technician report to Monday.com:", error);
      return {
        success: false,
        message: "Une erreur s'est produite lors de la communication avec l'API Monday.com."
      };
    }
  },
  
  // Check Monday.com board 5 (1863361499) connection status
  getMonday5BoardStatus: async () => {
    try {
      // Get Monday.com API key from localStorage
      const mondayApiKey = localStorage.getItem('mondayApiKey');
      if (!mondayApiKey) {
        return { 
          connected: false, 
          message: "Clé API Monday.com manquante. Veuillez configurer votre clé API dans les paramètres d'administration." 
        };
      }
      
      const mondayBoardId = TECHNICIAN_BOARD_ID;
      
      // Simple query to check if we can access the board
      const query = `
        query {
          boards(ids: ${mondayBoardId}) {
            name
            columns {
              id
              title
              type
            }
          }
        }
      `;
      
      const response = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": mondayApiKey
        },
        body: JSON.stringify({ query })
      });
      
      const result = await response.json();
      console.log("Monday.com board 5 validation response:", result);
      
      if (result.errors) {
        console.error("Monday.com board 5 validation error:", result.errors);
        return { 
          connected: false, 
          message: result.errors[0]?.message || "Erreur de connexion au tableau Monday.com." 
        };
      }
      
      if (result.data?.boards?.length > 0) {
        const boardName = result.data.boards[0].name;
        console.log("Monday.com board 5 columns:", result.data.boards[0].columns);
        return { 
          connected: true, 
          message: `Connecté au tableau "${boardName}" (ID: ${mondayBoardId})` 
        };
      } else {
        return { 
          connected: false, 
          message: `Le tableau Monday.com avec l'ID ${mondayBoardId} n'a pas été trouvé.` 
        };
      }
    } catch (error) {
      console.error("Error validating Monday.com board 5:", error);
      return { 
        connected: false, 
        message: "Erreur de connexion à l'API Monday.com." 
      };
    }
  },
  
  // Set Monday.com API configuration
  setMondayConfig: (apiKey: string, boardId: string) => {
    localStorage.setItem('mondayApiKey', apiKey);
    localStorage.setItem('mondayBoardId', boardId);
    
    // Validate the API key and board ID
    return declarationService.validateMondayConfig(apiKey, boardId);
  },
  
  // Validate Monday.com configuration
  validateMondayConfig: async (apiKey: string, boardId: string) => {
    try {
      // Simple query to check if the API key and board ID are valid
      const query = `
        query {
          boards(ids: ${boardId}) {
            name
            columns {
              id
              title
              type
            }
          }
        }
      `;
      
      const response = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey
        },
        body: JSON.stringify({ query })
      });
      
      const responseData = await response.text();
      console.log("Monday.com validation response:", responseData);
      
      try {
        const result = JSON.parse(responseData);
        
        if (result.errors) {
          console.error("Monday.com config validation error:", result.errors);
          return { valid: false, message: result.errors[0]?.message || "Invalid API key or board ID." };
        }
        
        if (result.data?.boards?.length > 0) {
          const boardName = result.data.boards[0].name;
          console.log("Monday.com columns:", result.data.boards[0].columns);
          return { valid: true, message: `Connecté au tableau "${boardName}"` };
        } else {
          return { valid: false, message: "Le tableau spécifié n'a pas été trouvé." };
        }
      } catch (e) {
        console.error("Failed to parse Monday.com validation response:", e);
        return { valid: false, message: "Réponse de validation non valide." };
      }
    } catch (error) {
      console.error("Error validating Monday.com config:", error);
      return { valid: false, message: "Erreur de connexion à l'API Monday.com." };
    }
  },
  
  // Get Monday.com configuration
  getMondayConfig: () => {
    return {
      apiKey: localStorage.getItem('mondayApiKey') || '',
      boardId: localStorage.getItem('mondayBoardId') || ''
    };
  }
};

// Exportation explicite des fonctions utilisées par d'autres composants
export const sendTechnicianReportToMonday = async (report: TechnicianReport) => {
  try {
    console.log("Sending technician report to Monday.com:", report);
    
    // Get Monday.com API key from localStorage
    const mondayApiKey = localStorage.getItem('mondayApiKey');
    if (!mondayApiKey) {
      return { 
        success: false, 
        message: "Clé API Monday.com manquante. Veuillez configurer votre clé API dans les paramètres d'administration." 
      };
    }
    
    // Using the specified board ID
    const mondayBoardId = TECHNICIAN_BOARD_ID;
    
    // Format the item name for Monday.com
    const itemName = `Rapport technique - ${report.clientName} - ${new Date().toLocaleDateString()}`;
    
    // Prepare column values based on the Technician Report board structure
    const columnValues = {
      // These column IDs should match your Monday.com board columns
      "personne": { "text": report.clientName },
      "text": report.address,
      "text1": report.diagnoseDescription,
      "numbers": parseFloat(report.estimateAmount) || 0,
      "status": { "label": report.needsIntervention ? "Intervention requise" : "Résolu" },
      "text6": report.workDescription,
      "email": { "email": report.clientEmail, "text": report.clientEmail },
      "phone": { "phone": report.clientPhone, "countryShortName": "FR" },
      "text0": report.problemCategory,
      // Add the date in the format Monday.com expects
      "date4": { 
        "date": new Date().toISOString().split('T')[0],
        "time": new Date().toISOString().split('T')[1].substring(0, 5)
      }
    };
    
    console.log("Monday.com column values for technician report:", JSON.stringify(columnValues));
    
    // Build the GraphQL mutation for creating an item in Monday.com
    const query = `
      mutation {
        create_item (
          board_id: ${mondayBoardId}, 
          item_name: "${itemName}", 
          column_values: ${JSON.stringify(JSON.stringify(columnValues))}
        ) {
          id
        }
      }
    `;
    
    console.log("Monday.com GraphQL query for technician report:", query);
    
    // Send the request to Monday.com API
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": mondayApiKey
      },
      body: JSON.stringify({ query })
    });
    
    const responseData = await response.text();
    console.log("Monday.com API raw response for technician report:", responseData);
    
    let result;
    try {
      result = JSON.parse(responseData);
    } catch (e) {
      console.error("Failed to parse Monday.com response:", e);
      return {
        success: false,
        message: "La réponse de l'API n'est pas au format JSON attendu."
      };
    }
    
    if (result.errors) {
      console.error("Monday.com API error for technician report:", result.errors);
      return {
        success: false,
        message: result.errors[0]?.message || "Erreur lors de l'envoi à Monday.com. Vérifiez vos paramètres d'API."
      };
    }
    
    if (result.data?.create_item?.id) {
      return {
        success: true,
        message: "Rapport envoyé avec succès à Monday.com",
        mondayItemId: result.data.create_item.id
      };
    } else {
      console.error("Unexpected Monday.com response format for technician report:", result);
      return {
        success: false,
        message: "La réponse de l'API n'a pas renvoyé l'ID attendu."
      };
    }
  } catch (error) {
    console.error("Error sending technician report to Monday.com:", error);
    return {
      success: false,
      message: "Une erreur s'est produite lors de la communication avec l'API Monday.com."
    };
  }
};

// Check Monday.com board 5 (1863361499) connection status
export const getMonday5BoardStatus = async () => {
  try {
    // Get Monday.com API key from localStorage
    const mondayApiKey = localStorage.getItem('mondayApiKey');
    if (!mondayApiKey) {
      return { 
        connected: false, 
        message: "Clé API Monday.com manquante. Veuillez configurer votre clé API dans les paramètres d'administration." 
      };
    }
    
    const mondayBoardId = TECHNICIAN_BOARD_ID;
    
    // Simple query to check if we can access the board
    const query = `
      query {
        boards(ids: ${mondayBoardId}) {
          name
          columns {
            id
            title
            type
          }
        }
      }
    `;
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": mondayApiKey
      },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    console.log("Monday.com board 5 validation response:", result);
    
    if (result.errors) {
      console.error("Monday.com board 5 validation error:", result.errors);
      return { 
        connected: false, 
        message: result.errors[0]?.message || "Erreur de connexion au tableau Monday.com." 
      };
    }
    
    if (result.data?.boards?.length > 0) {
      const boardName = result.data.boards[0].name;
      console.log("Monday.com board 5 columns:", result.data.boards[0].columns);
      return { 
        connected: true, 
        message: `Connecté au tableau "${boardName}" (ID: ${mondayBoardId})` 
      };
    } else {
      return { 
        connected: false, 
        message: `Le tableau Monday.com avec l'ID ${mondayBoardId} n'a pas été trouvé.` 
      };
    }
  } catch (error) {
    console.error("Error validating Monday.com board 5:", error);
    return { 
      connected: false, 
      message: "Erreur de connexion à l'API Monday.com." 
    };
  }
};

export default declarationService;
