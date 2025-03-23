
import { toast } from "sonner";
import { Declaration, TechnicianReport, NotificationPreference } from "./types";
import { 
  loadDeclarations, 
  saveDeclarations, 
  getNotificationPreferences, 
  saveNotificationPreferences, 
  getMondayConfig
} from "./storageService";
import { 
  sendNotifications,
  formatStatus
} from "./notificationService";
import mondayService, { 
  setMondayConfig, 
  validateMondayConfig, 
  getMonday5BoardStatus, 
  syncFromMonday,
  sendTechnicianReportToMonday,
  sendDeclarationToMonday as sendToMonday,
  updateMondayStatus,
  setupNotificationWebhook,
  getWebhookIntegrations,
  deleteWebhook
} from "./mondayService";

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
    
    // Send notifications for new declaration
    sendNotifications(declaration, 'new');
    
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
      
      // Send notifications for new declaration if configured
      try {
        sendNotifications(declaration, 'new');
      } catch (error) {
        console.error("Error sending notifications:", error);
      }
      
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
    
    // Get the updated declaration
    const updatedDeclaration = declarations.find(d => d.id === id);
    
    if (updatedDeclaration) {
      // Send notifications for status update
      sendNotifications(updatedDeclaration, 'update');
      
      // If the declaration has a Monday.com ID, update the status there too
      if (updatedDeclaration.mondayId) {
        updateMondayStatus(updatedDeclaration.mondayId, status);
      }
    }
    
    return updatedDeclaration;
  },
  
  // Send declaration to Monday.com
  sendToExternalService: async (declaration: Declaration) => {
    try {
      const result = await sendToMonday(declaration);
      
      if (result && declaration.id) {
        // If successful, get the Monday.com item ID from the result
        const items = await mondayService.getRecentItems();
        if (items && items.length > 0) {
          // Find the item that matches our declaration name
          const matchedItem = items.find(item => 
            item.name.includes(declaration.name)
          );
          
          if (matchedItem) {
            // Update the declaration with the Monday.com item ID
            declarations = declarations.map(d => 
              d.id === declaration.id ? { ...d, mondayId: matchedItem.id } : d
            );
            saveDeclarations(declarations);
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error in sendToExternalService:", error);
      return false;
    }
  },
  
  // Set Monday.com configuration wrapper
  setMondayConfig,
  
  // Validate Monday.com configuration wrapper
  validateMondayConfig,
  
  // Get Monday.com configuration
  getMondayConfig,
  
  // Sync declarations from Monday.com
  syncFromMonday,
  
  // Setup webhooks
  setupNotificationWebhook,
  getWebhookIntegrations,
  deleteWebhook,
  
  // Notification preferences
  saveNotificationPreferences,
  getNotificationPreferences,
  
  // Format status for display
  formatStatus
};

// Export needed functions and the declaration service
export { 
  sendTechnicianReportToMonday, 
  getMonday5BoardStatus,
  Declaration,
  TechnicianReport,
  NotificationPreference
};

export default declarationService;
