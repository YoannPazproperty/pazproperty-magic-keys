
import { toast } from "sonner";
import { mondayService } from "./mondayService";
import { notificationService } from "./notificationService";
import { loadDeclarations, saveDeclarations } from "./storageService";
import { Declaration, TechnicianReport, TechnicianReportResult, issueTypeToMondayMap, urgencyToMondayMap } from "./types";

// Generate unique ID for new declarations
const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Get all declarations with optional filters
export const getDeclarations = (statusFilter: string | null = null): Declaration[] => {
  let declarations = loadDeclarations();
  
  if (statusFilter) {
    declarations = declarations.filter(decl => decl.status === statusFilter);
  }
  
  // Sort by submission date, newest first
  return declarations.sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
};

// Get a single declaration by ID
export const getDeclarationById = (id: string): Declaration | undefined => {
  const declarations = loadDeclarations();
  return declarations.find(decl => decl.id === id);
};

// Create a new declaration
export const createDeclaration = async (declarationData: Omit<Declaration, 'id' | 'status' | 'submittedAt'>): Promise<Declaration> => {
  const declarations = loadDeclarations();
  
  const newDeclaration: Declaration = {
    ...declarationData,
    id: generateUniqueId(),
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  
  declarations.push(newDeclaration);
  saveDeclarations(declarations);
  
  // Send notification to tenant
  try {
    await notificationService.sendNotificationEmail(
      newDeclaration.email,
      "tenant",
      "declarationReceived",
      newDeclaration
    );
  } catch (error) {
    console.error("Error sending email notification:", error);
    // Continue even if notification fails
  }
  
  // Create item in Monday.com
  try {
    const mondayConfig = localStorage.getItem('mondayApiKey') && localStorage.getItem('mondayBoardId');
    if (mondayConfig) {
      const mondayItemId = await createMondayItem(newDeclaration);
      if (mondayItemId) {
        // Update declaration with Monday.com item ID
        updateDeclaration(newDeclaration.id, { mondayId: mondayItemId });
      }
    }
  } catch (error) {
    console.error("Error creating Monday.com item:", error);
    // Continue even if Monday.com integration fails
  }
  
  return newDeclaration;
};

// Update an existing declaration
export const updateDeclaration = (id: string, updates: Partial<Declaration>): Declaration | null => {
  const declarations = loadDeclarations();
  const index = declarations.findIndex(decl => decl.id === id);
  
  if (index === -1) return null;
  
  // Update the declaration
  declarations[index] = {
    ...declarations[index],
    ...updates,
  };
  
  saveDeclarations(declarations);

  // Check if there's a status update that requires notification
  if (updates.status && updates.status !== declarations[index].status) {
    // Send notification for status change
    notificationService.sendNotificationEmail(
      declarations[index].email,
      "tenant",
      "statusUpdate",
      declarations[index]
    ).catch(error => {
      console.error("Error sending status update email:", error);
    });
  }
  
  return declarations[index];
};

// Delete a declaration
export const deleteDeclaration = (id: string): boolean => {
  const declarations = loadDeclarations();
  const filteredDeclarations = declarations.filter(decl => decl.id !== id);
  
  if (filteredDeclarations.length === declarations.length) {
    return false; // Nothing was deleted
  }
  
  saveDeclarations(filteredDeclarations);
  return true;
};

// Create a Monday.com item for a declaration
const createMondayItem = async (declaration: Declaration): Promise<string | null> => {
  try {
    // Convert issue type and urgency to Monday.com values
    const mondayIssueType = issueTypeToMondayMap[declaration.issueType] || declaration.issueType;
    const mondayUrgency = urgencyToMondayMap[declaration.urgency] || declaration.urgency;
    
    const itemName = `${declaration.name} - ${declaration.property}`;
    
    // Create the item in Monday.com
    const itemId = await mondayService.createItem(
      itemName,
      {
        nome_do_cliente: declaration.name,
        email: declaration.email,
        telefone: declaration.phone,
        endereco: declaration.property,
        tipo_de_problema: mondayIssueType,
        descricao: declaration.description,
        urgencia: mondayUrgency,
        status: "Novo",
        nif: declaration.nif || "",
        id_declaracao: declaration.id
      }
    );
    
    if (itemId) {
      toast.success("Créé avec succès dans Monday.com", {
        description: `ID de l'élément: ${itemId}`
      });
      return itemId;
    }
    return null;
  } catch (error) {
    console.error("Error creating Monday item:", error);
    toast.error("Erreur lors de la création dans Monday.com", {
      description: error instanceof Error ? error.message : "Une erreur s'est produite"
    });
    return null;
  }
};

// Send technician report to Monday.com
export const sendTechnicianReportToMonday = async (report: TechnicianReport): Promise<TechnicianReportResult> => {
  try {
    // Create a new item in the technician reports board
    const itemName = `Rapport #${report.interventionId} - ${report.clientName}`;
    
    // Map data fields to Monday.com column values
    const columnValues = {
      diagnóstico: report.diagnoseDescription,
      necessita_de_intervenção: report.needsIntervention ? "Sim" : "Não",
      valor_estimado: report.estimateAmount,
      trabalhos_a_realizar: report.workDescription,
      cliente: report.clientName,
      email: report.clientEmail,
      telefone: report.clientPhone,
      endereço: report.address,
      categoria_do_problema: issueTypeToMondayMap[report.problemCategory] || report.problemCategory,
      id_intervenção: report.interventionId.toString()
    };
    
    const itemId = await mondayService.createTechnicianReport(itemName, columnValues);
    
    if (itemId) {
      return {
        success: true,
        message: "Rapport envoyé avec succès à Monday.com",
        mondayItemId: itemId
      };
    } else {
      return {
        success: false,
        message: "Échec de l'envoi du rapport à Monday.com"
      };
    }
  } catch (error) {
    console.error("Error sending technician report to Monday:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue lors de l'envoi du rapport"
    };
  }
};

// Check Monday.com board status for the technician board
export const getMonday5BoardStatus = async () => {
  try {
    const boardId = localStorage.getItem('mondayBoardId') || '';
    
    if (!boardId) {
      return {
        connected: false,
        message: "ID du board Monday.com non configuré"
      };
    }
    
    const result = await mondayService.validateConfig();
    
    return {
      connected: result.valid,
      message: result.message
    };
  } catch (error) {
    console.error("Error checking Monday board status:", error);
    return {
      connected: false,
      message: error instanceof Error ? error.message : "Erreur de connexion à Monday.com"
    };
  }
};

// Re-export types
export type { Declaration, TechnicianReport, TechnicianReportResult };
