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

// Notification Preference interface
export interface NotificationPreference {
  email: boolean;
  sms: boolean;
  push: boolean;
  recipientEmail?: string;
  recipientPhone?: string;
}

// Email template interface
export interface EmailTemplate {
  subject: string;
  body: string;
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

// Email templates for automated notifications
const EMAIL_TEMPLATES = {
  tenant: {
    declarationReceived: {
      subject: "Votre déclaration a été reçue - PAZ Property",
      body: `Bonjour {name},
        
Nous avons bien reçu votre déclaration concernant un problème de {issueType} à votre adresse {property}.

Référence de votre déclaration: {id}
Date de soumission: {date}

Notre équipe technique a été informée et vous contactera dans les plus brefs délais pour planifier une intervention si nécessaire.

Pour toute urgence, veuillez nous contacter au +351 912 345 678.

Cordialement,
L'équipe PAZ Property`
    },
    statusUpdate: {
      subject: "Mise à jour de votre déclaration - PAZ Property",
      body: `Bonjour {name},
        
Nous vous informons que le statut de votre déclaration (Réf: {id}) a été mis à jour.

Nouveau statut: {status}

{additionalInfo}

Pour toute question, n'hésitez pas à nous contacter.

Cordialement,
L'équipe PAZ Property`
    }
  },
  technician: {
    newDeclaration: {
      subject: "Nouvelle intervention à planifier - PAZ Property",
      body: `Bonjour,
        
Une nouvelle déclaration nécessitant une intervention a été enregistrée.

Client: {name}
Adresse: {property}
Type de problème: {issueType}
Description: {description}
Urgence: {urgency}
Référence: {id}

Veuillez planifier cette intervention dès que possible et mettre à jour le statut sur votre interface technicien.

Cordialement,
L'équipe PAZ Property`
    }
  }
};

// Monday.com board configurations
const TECHNICIAN_BOARD_ID = "1863361499"; // The board ID specified by the user
const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreference = {
  email: true,
  sms: false,
  push: false
};

// Email configuration
const EMAIL_CONFIG = {
  technicianEmails: ["technicien@pazproperty.pt"], // Default technician email
  adminEmails: ["admin@pazproperty.pt"], // Default admin email
  fromEmail: "notifications@pazproperty.pt" // Sender email
};

// Load notification preferences from localStorage or use defaults
export const getNotificationPreferences = (): NotificationPreference => {
  const stored = localStorage.getItem('notificationPreferences');
  return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATION_PREFERENCES;
};

// Save notification preferences to localStorage
export const saveNotificationPreferences = (preferences: NotificationPreference) => {
  localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  return preferences;
};

// Setup webhook for Monday.com notifications
export const setupNotificationWebhook = async (webhookUrl: string, events: string[] = ["status_change"]) => {
  try {
    console.log("Setting up Monday.com notification webhook:", webhookUrl);
    
    // Get Monday.com API key from localStorage
    const mondayApiKey = localStorage.getItem('mondayApiKey');
    if (!mondayApiKey) {
      return { 
        success: false, 
        message: "Clé API Monday.com manquante." 
      };
    }
    
    // Get board ID from localStorage or use default
    const mondayBoardId = localStorage.getItem('mondayBoardId') || '';
    if (!mondayBoardId) {
      return { 
        success: false, 
        message: "ID du tableau Monday.com manquant." 
      };
    }
    
    // Create webhook in Monday.com using GraphQL mutation
    const query = `
      mutation {
        create_webhook(board_id: ${mondayBoardId}, url: "${webhookUrl}", event: "change_column_value", config: "${JSON.stringify({ columnId: "status" })}") {
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
        "Authorization": mondayApiKey
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
    // Get Monday.com API key from localStorage
    const mondayApiKey = localStorage.getItem('mondayApiKey');
    if (!mondayApiKey) {
      return { 
        success: false, 
        message: "Clé API Monday.com manquante." 
      };
    }
    
    // Get board ID from localStorage or use default
    const mondayBoardId = localStorage.getItem('mondayBoardId') || '';
    if (!mondayBoardId) {
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
        "Authorization": mondayApiKey
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
      webhook.board_id === parseInt(mondayBoardId)
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
    // Get Monday.com API key from localStorage
    const mondayApiKey = localStorage.getItem('mondayApiKey');
    if (!mondayApiKey) {
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
        "Authorization": mondayApiKey
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

// Send Email Notification (simulated in this example)
const sendEmailNotification = async (
  recipientEmail: string,
  templateType: keyof typeof EMAIL_TEMPLATES.tenant | keyof typeof EMAIL_TEMPLATES.technician,
  templateCategory: 'tenant' | 'technician',
  data: Record<string, string>
): Promise<boolean> => {
  try {
    // Get the email template
    const template = EMAIL_TEMPLATES[templateCategory][templateType as any];
    
    // Replace placeholders in subject and body with actual data
    let subject = template.subject;
    let body = template.body;
    
    // Replace all placeholders in the template
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      subject = subject.replace(placeholder, value);
      body = body.replace(new RegExp(placeholder, 'g'), value);
    });
    
    console.log(`🔔 Sending ${templateCategory} email notification to ${recipientEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    
    // In a real implementation, this would make an API call to an email service
    // For this example, we're simulating success
    
    // Simulate API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success(`Email notification sent to ${recipientEmail}`, {
      description: `Template: ${templateType}`
    });
    
    return true;
  } catch (error) {
    console.error("Error sending email notification:", error);
    toast.error("Failed to send email notification", {
      description: `Recipient: ${recipientEmail}`
    });
    return false;
  }
};

// Send SMS Notification (simulated in this example)
const sendSmsNotification = async (
  phoneNumber: string,
  message: string
): Promise<boolean> => {
  try {
    console.log(`🔔 Sending SMS notification to ${phoneNumber}`);
    console.log(`Message: ${message}`);
    
    // In a real implementation, this would make an API call to an SMS service
    // For this example, we're simulating success
    
    // Simulate API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success(`SMS notification sent to ${phoneNumber}`, {
      description: `Message length: ${message.length} characters`
    });
    
    return true;
  } catch (error) {
    console.error("Error sending SMS notification:", error);
    toast.error("Failed to send SMS notification", {
      description: `Recipient: ${phoneNumber}`
    });
    return false;
  }
};

// Format status for display
const formatStatus = (status: Declaration["status"]): string => {
  switch (status) {
    case "pending":
      return "En attente";
    case "in_progress":
      return "En cours d'intervention";
    case "resolved":
      return "Résolu";
    default:
      return status;
  }
};

// Send notifications to tenant and technician based on preferences
const sendNotifications = async (declaration: Declaration, type: 'new' | 'update'): Promise<void> => {
  try {
    // Get notification preferences
    const preferences = getNotificationPreferences();
    
    // Prepare common data for templates
    const commonData = {
      name: declaration.name,
      id: declaration.id,
      property: declaration.property,
      issueType: declaration.issueType,
      description: declaration.description,
      urgency: declaration.urgency,
      date: new Date(declaration.submittedAt).toLocaleDateString('fr-FR'),
      status: formatStatus(declaration.status)
    };
    
    // Send notifications based on the type
    if (type === 'new') {
      // Notify tenant about new declaration
      if (preferences.email && declaration.email) {
        await sendEmailNotification(
          declaration.email,
          'declarationReceived',
          'tenant',
          commonData
        );
      }
      
      if (preferences.sms && declaration.phone) {
        const smsMessage = `PAZ Property: Votre déclaration (Réf: ${declaration.id}) a été reçue. Nous vous contacterons prochainement.`;
        await sendSmsNotification(declaration.phone, smsMessage);
      }
      
      // Notify technicians about new declaration
      for (const techEmail of EMAIL_CONFIG.technicianEmails) {
        await sendEmailNotification(
          techEmail,
          'newDeclaration',
          'technician',
          commonData
        );
      }
    } else if (type === 'update') {
      // Notify tenant about status update
      if (preferences.email && declaration.email) {
        // Add additional info based on status
        let additionalInfo = "";
        if (declaration.status === "in_progress") {
          additionalInfo = "Un technicien a été assigné à votre demande et interviendra prochainement.";
        } else if (declaration.status === "resolved") {
          additionalInfo = "Votre problème a été résolu. Si vous constatez que le problème persiste, n'hésitez pas à nous contacter.";
        }
        
        await sendEmailNotification(
          declaration.email,
          'statusUpdate',
          'tenant',
          { ...commonData, additionalInfo }
        );
      }
      
      if (preferences.sms && declaration.phone) {
        const smsMessage = `PAZ Property: Le statut de votre déclaration (Réf: ${declaration.id}) est maintenant: ${formatStatus(declaration.status)}.`;
        await sendSmsNotification(declaration.phone, smsMessage);
      }
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
    toast.error("Erreur lors de l'envoi des notifications", {
      description: "Une erreur est survenue lors de la tentative d'envoi des notifications."
    });
  }
};

// Sync data from Monday.com
const syncFromMondayImpl = async (): Promise<boolean> => {
  try {
    console.log("Starting sync from Monday.com...");
    
    // Get Monday.com API key from localStorage
    const mondayApiKey = localStorage.getItem('mondayApiKey');
    if (!mondayApiKey) {
      console.error("Missing Monday.com API key");
      return false;
    }
    
    // Get board ID from localStorage or use default
    const mondayBoardId = localStorage.getItem('mondayBoardId') || '';
    if (!mondayBoardId) {
      console.error("Missing Monday.com board ID");
      return false;
    }
    
    // Query for items in Monday.com board
    const query = `
      query {
        boards(ids: ${mondayBoardId}) {
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
        "Authorization": mondayApiKey
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
    
    // Map Monday.com items to declarations and update local storage
    const existingDeclarations = loadDeclarations();
    let updatedCount = 0;
    
    for (const item of items) {
      // Find the declaration with this Monday.com ID
      const existingIndex = existingDeclarations.findIndex(d => d.mondayId === item.id);
      
      // If this is a known declaration, update its status
      if (existingIndex >= 0) {
        // Get the status column value
        const statusColumn = item.column_values.find((col: any) => col.id === "status");
        if (statusColumn && statusColumn.text) {
          // Map Monday.com status back to our application status
          let appStatus: Declaration["status"] = "pending";
          
          if (statusColumn.text === "En cours") {
            appStatus = "in_progress";
          } else if (statusColumn.text === "Résolu") {
            appStatus = "resolved";
          }
          
          // Check if status has changed
          if (existingDeclarations[existingIndex].status !== appStatus) {
            existingDeclarations[existingIndex].status = appStatus;
            updatedCount++;
          }
        }
      }
    }
    
    // Save updated declarations if any changes were made
    if (updatedCount > 0) {
      saveDeclarations(existingDeclarations);
      toast.success(`Synchronisation terminée`, {
        description: `${updatedCount} déclaration(s) mise(s) à jour depuis Monday.com`
      });
    } else {
      console.log("No declarations needed updating");
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
        declarationService.updateMondayStatus(updatedDeclaration.mondayId, status);
      }
    }
    
    return updatedDeclaration;
  },
  
  // Update status in Monday.com
  updateMondayStatus: async (mondayItemId: string, status: Declaration["status"]) => {
    try {
      console.log(`Updating Monday.com item ${mondayItemId} status to ${status}`);
      
      // Get Monday.com API key from localStorage
      const mondayApiKey = localStorage.getItem('mondayApiKey');
      if (!mondayApiKey) {
        console.error("Missing Monday.com API key");
        return false;
      }
      
      // Get board ID from localStorage or use default
      const mondayBoardId = localStorage.getItem('mondayBoardId') || '';
      if (!mondayBoardId) {
        console.error("Missing Monday.com board ID");
        return false;
      }
      
      // Map application status to Monday.com status
      let mondayStatus = "Nouveau";
      switch (status) {
        case "in_progress":
          mondayStatus = "En cours";
          break;
        case "resolved":
          mondayStatus = "Résolu";
          break;
        case "pending":
        default:
          mondayStatus = "Nouveau";
      }
      
      // Update status in Monday.com using GraphQL mutation
      const columnValues = {
        "status": { "label": mondayStatus }
      };
      
      const query = `
        mutation {
          change_column_value(
            board_id: ${mondayBoardId}, 
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
          "Authorization": mondayApiKey
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
  },
  
  // Set up notification preferences for Monday.com notifications
  setupNotificationWebhook,
  
  // Get all webhook integrations for a board
  getWebhookIntegrations,
  
  // Delete a webhook integration
  deleteWebhook,
  
  // Save notification preferences
  saveNotificationPreferences,
  
  // Get notification preferences
  getNotificationPreferences,
  
  // Sync declarations from Monday.com
  syncFromMonday: syncFromMondayImpl,
  
  // Send declaration to Monday.com
  sendToExternalService: async (declaration: Declaration) => {
    try {
      console.log("Sending to Monday.com:", declaration);
      
      // Get Monday.com API key from localStorage
      const mondayApiKey = localStorage.getItem('mondayApiKey');
      if (!mondayApiKey) {
        console.warn("No Monday.com API key found in localStorage");
        return false;
      }
      
      // Get board ID from localStorage
      const mondayBoardId = localStorage.getItem('mondayBoardId') || '';
      if (!mondayBoardId) {
        console.warn("No Monday.com board ID found in localStorage");
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
  },
  
  // Update email configuration
  setEmailConfig: (config: Partial<typeof EMAIL_CONFIG>) => {
    const currentConfig = JSON.parse(localStorage.getItem('emailConfig') || JSON.stringify(EMAIL_CONFIG));
    const newConfig = { ...currentConfig, ...config };
    localStorage.setItem('emailConfig', JSON.stringify(newConfig));
    return newConfig;
  },
  
  // Get email configuration
  getEmailConfig: () => {
    return JSON.parse(localStorage.getItem('emailConfig') || JSON.stringify(EMAIL_CONFIG));
  }
};

// Export the functions for use in other components
export const sendTechnicianReportToMonday = declarationService.sendTechnicianReportToMonday;
export const getMonday5BoardStatus = declarationService.getMonday5BoardStatus;
export const syncFromMonday = declarationService.syncFromMonday;

export default declarationService;

