
import { toast } from "sonner";
import { Declaration, EmailTemplate, NotificationPreference, EMAIL_TEMPLATES } from "./types";
import { getNotificationPreferences, saveNotificationPreferences } from "./storageService";

// Replace template variables in email content
const replaceTemplateVariables = (template: string, data: Record<string, any>): string => {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
};

// Format date for display
const formatDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoDate;
  }
};

export const notificationService = {
  // Send an email notification
  sendNotificationEmail: async (
    recipient: string,
    templateType: 'tenant' | 'technician',
    templateName: string,
    data: Declaration | Record<string, any>
  ): Promise<boolean> => {
    try {
      // Get the email template
      const template = EMAIL_TEMPLATES[templateType][templateName as keyof typeof EMAIL_TEMPLATES.tenant | keyof typeof EMAIL_TEMPLATES.technician] as EmailTemplate;
      
      if (!template) {
        throw new Error(`Template ${templateName} not found for ${templateType}`);
      }
      
      // Prepare data for template replacement
      const templateData = {
        ...data,
        date: formatDate(data.submittedAt || new Date().toISOString())
      };
      
      // Replace variables in template
      const subject = replaceTemplateVariables(template.subject, templateData);
      const body = replaceTemplateVariables(template.body, templateData);
      
      // In a real app, we would send the email here
      console.log(`Email would be sent to ${recipient}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${body}`);
      
      // For the demo, we'll simulate a successful send
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error("Error sending notification email:", error);
      return false;
    }
  },
  
  // Send SMS notification
  sendSMS: async (phoneNumber: string, message: string): Promise<boolean> => {
    try {
      // In a real app, we would send the SMS here
      console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error("Error sending SMS:", error);
      return false;
    }
  },
  
  // Set up notification webhook (for sending notifications to external systems)
  setupNotificationWebhook: async (url: string, events: string[]): Promise<{id: string, url: string}> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate fake webhook ID
      const webhookId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      
      // Store in localStorage (in a real app, this would be stored on the server)
      const webhooks = JSON.parse(localStorage.getItem('notificationWebhooks') || '[]');
      webhooks.push({
        id: webhookId,
        url,
        events
      });
      localStorage.setItem('notificationWebhooks', JSON.stringify(webhooks));
      
      return {
        id: webhookId,
        url
      };
    } catch (error) {
      console.error("Error setting up webhook:", error);
      throw new Error("Failed to set up notification webhook");
    }
  },
  
  // Get all configured webhooks
  getWebhookIntegrations: async (): Promise<Array<{id: string, url: string, events: string[]}>> => {
    // Retrieve from localStorage
    const webhooks = JSON.parse(localStorage.getItem('notificationWebhooks') || '[]');
    return webhooks;
  },
  
  // Delete a webhook
  deleteWebhook: async (webhookId: string): Promise<boolean> => {
    try {
      // Get existing webhooks
      const webhooks = JSON.parse(localStorage.getItem('notificationWebhooks') || '[]');
      
      // Filter out the webhook to delete
      const updatedWebhooks = webhooks.filter((webhook: any) => webhook.id !== webhookId);
      
      // Save back to localStorage
      localStorage.setItem('notificationWebhooks', JSON.stringify(updatedWebhooks));
      
      return true;
    } catch (error) {
      console.error("Error deleting webhook:", error);
      return false;
    }
  }
};
