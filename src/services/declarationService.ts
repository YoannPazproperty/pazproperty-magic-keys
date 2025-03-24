
import { toast } from "sonner";
import { Declaration, TechnicianReport, TechnicianReportResult } from "./types";
import { loadDeclarations, saveDeclarations } from "./storageService";
import { createMondayItem, createTechnicianReport, getMondayBoardStatus } from "./mondayService";
import { sendNotificationEmail } from "./notificationService";
import { issueTypeToMondayMap, urgencyToMondayMap } from "./types";

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

// Create a new declaration with media files
export const addWithMedia = async (
  declarationData: Omit<Declaration, 'id' | 'status' | 'submittedAt'>,
  mediaFiles: File[]
): Promise<Declaration> => {
  const newDeclaration: Declaration = {
    ...declarationData,
    id: generateUniqueId(),
    status: "pending",
    submittedAt: new Date().toISOString(),
    mediaFiles: []
  };
  
  const declarations = loadDeclarations();
  declarations.push(newDeclaration);
  saveDeclarations(declarations);
  
  // Send notification
  try {
    await sendNotificationEmail(
      newDeclaration.email,
      "tenant",
      "declarationReceived",
      newDeclaration
    );
  } catch (error) {
    console.error("Error sending notification:", error);
  }
  
  return newDeclaration;
};

// Send declaration to external service (Monday.com)
export const sendToExternalService = async (declaration: Declaration): Promise<string | null> => {
  try {
    // Convert issue type and urgency to Monday.com values
    const mondayIssueType = issueTypeToMondayMap[declaration.issueType] || declaration.issueType;
    const mondayUrgency = urgencyToMondayMap[declaration.urgency] || declaration.urgency;
    
    const itemName = `${declaration.name} - ${declaration.property}`;
    
    // Create the item in Monday.com
    const itemId = await createMondayItem(
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
      // Update declaration with Monday ID
      updateDeclaration(declaration.id, { mondayId: itemId });
      
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
    sendNotificationEmail(
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

// Update declaration status (alias for updateDeclaration with status)
export const updateDeclarationStatus = (id: string, status: Declaration["status"]): boolean => {
  const result = updateDeclaration(id, { status });
  return result !== null;
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
    
    const itemId = await createTechnicianReport(itemName, columnValues);
    
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

// Get Monday board status (alias for getMondayBoardStatus)
export const getMonday5BoardStatus = getMondayBoardStatus;
