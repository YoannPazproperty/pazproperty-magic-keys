
import { toast } from "sonner";
import { NotificationPreference } from "./types";

// Get notification preferences from localStorage
export const getNotificationPreferences = (): NotificationPreference => {
  const storedPrefs = localStorage.getItem('notificationPreferences');
  if (storedPrefs) {
    return JSON.parse(storedPrefs);
  }
  
  // Default preferences
  return {
    email: true,
    sms: false,
    push: false
  };
};

// Save notification preferences to localStorage
export const saveNotificationPreferences = (preferences: NotificationPreference): void => {
  localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
};

// Setup webhook for notifications
export const setupNotificationWebhook = async (webhookUrl: string): Promise<{success: boolean; message: string}> => {
  try {
    // This would typically call an API to set up a webhook
    // For now, we'll simulate it with a timeout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store webhook in localStorage for demonstration
    const webhooks = JSON.parse(localStorage.getItem('webhooks') || '[]');
    const newWebhook = {
      id: Date.now().toString(),
      url: webhookUrl,
      event: 'all_events',
      createdAt: new Date().toISOString()
    };
    
    webhooks.push(newWebhook);
    localStorage.setItem('webhooks', JSON.stringify(webhooks));
    
    return {
      success: true,
      message: "Webhook configuré avec succès. Il recevra les notifications pour toutes les déclarations."
    };
  } catch (error) {
    console.error("Error setting up webhook:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la configuration du webhook"
    };
  }
};

// Get configured webhooks
export const getWebhookIntegrations = async (): Promise<{success: boolean; webhooks: any[]; message?: string}> => {
  try {
    // In a real app, this would be an API call
    const webhooks = JSON.parse(localStorage.getItem('webhooks') || '[]');
    
    return {
      success: true,
      webhooks
    };
  } catch (error) {
    console.error("Error getting webhooks:", error);
    return {
      success: false,
      webhooks: [],
      message: error instanceof Error ? error.message : "Erreur lors de la récupération des webhooks"
    };
  }
};

// Delete a webhook
export const deleteWebhook = async (webhookId: string): Promise<{success: boolean; message: string}> => {
  try {
    // In a real app, this would be an API call
    const webhooks = JSON.parse(localStorage.getItem('webhooks') || '[]');
    const filteredWebhooks = webhooks.filter((wh: any) => wh.id !== webhookId);
    
    localStorage.setItem('webhooks', JSON.stringify(filteredWebhooks));
    
    return {
      success: true,
      message: "Webhook supprimé avec succès"
    };
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la suppression du webhook"
    };
  }
};

// Send notification
export const sendNotification = async (
  recipientType: 'tenant' | 'technician' | 'admin',
  notificationType: string,
  data: any
): Promise<{success: boolean; message: string}> => {
  try {
    const preferences = getNotificationPreferences();
    
    // Log notification for demonstration
    console.log(`Sending ${notificationType} notification to ${recipientType}:`, data);
    
    // If email notifications are enabled
    if (preferences.email) {
      // In a real app, this would send an actual email
      console.log(`Email would be sent to: ${preferences.recipientEmail || 'default email'}`);
    }
    
    // If SMS notifications are enabled
    if (preferences.sms) {
      // In a real app, this would send an actual SMS
      console.log(`SMS would be sent to: ${preferences.recipientPhone || 'default phone'}`);
    }
    
    // If push notifications are enabled
    if (preferences.push) {
      // For demonstration, we'll show a toast notification
      toast.info(`Notification: ${notificationType}`, {
        description: `Une notification a été envoyée à ${recipientType}`
      });
    }
    
    return {
      success: true,
      message: "Notification envoyée avec succès"
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de l'envoi de la notification"
    };
  }
};

// Expose necessary functions from the original service
export { sendNotificationEmail } from './types';
