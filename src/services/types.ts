// Shared interfaces for services
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

// Monday.com validation response
export interface MondayConfigValidation {
  valid: boolean;
  message: string;
}

// Monday.com connection status
export interface MondayConnectionStatus {
  connected: boolean;
  message: string;
}

// Technician report submission result
export interface TechnicianReportResult {
  success: boolean;
  message: string;
  mondayItemId?: string;
}

// Email templates for notifications
export const EMAIL_TEMPLATES = {
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

// Translation maps for Monday.com
export const issueTypeToMondayMap: Record<string, string> = {
  plomberie: "Canalização",
  electricite: "Elétrico",
  serrurerie: "Serralharia",
  menuiserie: "Carpintaria",
  chauffage: "Aquecimento/Climatização",
  pest: "Pragas",
  other: "Outro"
};

export const urgencyToMondayMap: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  emergency: "Emergência"
};

// Email configuration
export const EMAIL_CONFIG = {
  technicianEmails: ["technicien@pazproperty.pt"], // Default technician email
  adminEmails: ["admin@pazproperty.pt"], // Default admin email
  fromEmail: "notifications@pazproperty.pt" // Sender email
};

// Monday.com board configurations
export const TECHNICIAN_BOARD_ID = "1863361499"; // The board ID specified by the user

// Email notification function
export const sendNotificationEmail = async (
  recipientEmail: string,
  recipientType: 'tenant' | 'technician' | 'admin',
  notificationType: string,
  data: any
): Promise<{success: boolean; message: string}> => {
  try {
    // This is a placeholder function that would typically integrate with an email service
    console.log(`Would send email to ${recipientEmail} (${recipientType}) about ${notificationType}:`, data);
    
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: "Email sent successfully"
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de l'envoi de l'email"
    };
  }
};
