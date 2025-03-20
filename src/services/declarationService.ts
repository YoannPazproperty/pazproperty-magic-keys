
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
  
  // Send declaration to external service (e.g. Monday.com)
  sendToExternalService: async (declaration: Declaration) => {
    try {
      // This is a mock implementation
      console.log("Sending to external service:", declaration);
      
      // In a real implementation, this would call the actual service
      // const response = await fetch("https://api.monday.com/webhook", {...})
      
      toast("Declaration sent to task tracking system");
      return true;
    } catch (error) {
      console.error("Error sending to external service:", error);
      toast.error("Failed to send to task tracking system");
      return false;
    }
  }
};

export default declarationService;
