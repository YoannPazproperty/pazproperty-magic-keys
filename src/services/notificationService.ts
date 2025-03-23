
import { toast } from "sonner";
import { 
  Declaration, 
  NotificationPreference, 
  EMAIL_TEMPLATES, 
  EMAIL_CONFIG 
} from "./types";
import { getNotificationPreferences } from "./storageService";

// Format status for display - Updated to Portuguese
export const formatStatus = (status: Declaration["status"]): string => {
  switch (status) {
    case "pending":
      return "Em espera";
    case "in_progress":
      return "Em intervenção";
    case "resolved":
      return "Resolvido";
    default:
      return status;
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

// Send notifications to tenant and technician based on preferences
export const sendNotifications = async (declaration: Declaration, type: 'new' | 'update'): Promise<void> => {
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

export default {
  sendNotifications,
  formatStatus
};
