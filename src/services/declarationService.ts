
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
  nif?: string; // Ajout du NIF comme champ optionnel
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
  plumbing: "Plomberie",
  electrical: "Électrique",
  appliance: "Électroménager",
  heating: "Chauffage/Climatisation",
  structural: "Structurel",
  pest: "Nuisibles",
  other: "Autre"
};

const urgencyToMondayMap: Record<string, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Élevée",
  emergency: "Urgence"
};

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
      
      // Prepare the data for Monday.com - Utiliser un format de nom plus utile
      const itemName = `Nouvelle déclaration - ${declaration.name}`;
      
      // Extract name parts if possible
      let firstName = declaration.name;
      let lastName = "";
      
      const nameParts = declaration.name.split(' ');
      if (nameParts.length > 1) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }
      
      // Convert our data structure to Monday.com's expected format
      // Correspond aux colonnes visibles dans le tableau Monday.com
      const columnValues = {
        "Nome do Inquilino": declaration.name,
        "E-mail Inquilino": declaration.email,
        "Telefone": declaration.phone,
        "Endereço do Inquilino": declaration.property,
        "Tipo de problema": issueTypeToMondayMap[declaration.issueType] || declaration.issueType,
        "Explicação do problema": declaration.description,
        "NIF": declaration.nif || "",
        "Codigo Postal": declaration.property.match(/\d{4,}(?:-\d+)?/)?.[0] || "",
        "Cidade": declaration.property.split(',').pop()?.trim() || "",
        "Status": { label: "Nouveau" }
      };
      
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
      
      // Send the request to Monday.com's API
      const response = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": mondayApiKey
        },
        body: JSON.stringify({ query })
      });
      
      const result = await response.json();
      
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
      
      const result = await response.json();
      
      if (result.errors) {
        console.error("Monday.com config validation error:", result.errors);
        return { valid: false, message: result.errors[0]?.message || "Invalid API key or board ID." };
      }
      
      if (result.data?.boards?.length > 0) {
        const boardName = result.data.boards[0].name;
        return { valid: true, message: `Connecté au tableau "${boardName}"` };
      } else {
        return { valid: false, message: "Le tableau spécifié n'a pas été trouvé." };
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

export default declarationService;
