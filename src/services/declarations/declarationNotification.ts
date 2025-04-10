
import { toast } from "sonner";
import { Declaration } from "../types";
import { sendNotificationEmail } from "../notificationService";
import { updateDeclaration } from "./declarationStorage";

// Table name for notifications in localStorage
const NOTIFICATIONS_STORAGE_KEY = 'notifications';

// Function to log notification to local storage
const logNotificationLocally = (notificationData: any) => {
  const storedNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || '[]');
  storedNotifications.push({
    ...notificationData,
    id: Date.now().toString(),
    sent_at: new Date().toISOString()
  });
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(storedNotifications));
  console.log("Notification stored locally:", notificationData);
};

// Send notification when a declaration status changes
export const notifyStatusChange = async (declaration: Declaration): Promise<boolean> => {
  try {
    // Send email notification
    await sendNotificationEmail(
      declaration.email,
      "tenant",
      "statusUpdate",
      declaration
    );
    
    // Store locally
    logNotificationLocally({
      declaration_id: declaration.id,
      email: declaration.email,
      type: 'statusUpdate',
      status: declaration.status
    });
    
    return true;
  } catch (error) {
    console.error("Error sending status update email:", error);
    return false;
  }
};

// Send initial notification for new declaration
export const notifyNewDeclaration = async (declaration: Declaration): Promise<boolean> => {
  try {
    // Send email notification
    await sendNotificationEmail(
      declaration.email,
      "tenant",
      "declarationReceived",
      declaration
    );
    
    // Store locally
    logNotificationLocally({
      declaration_id: declaration.id,
      email: declaration.email,
      type: 'declarationReceived',
      status: declaration.status
    });
    
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
};

// Update status and notify
export const updateStatusAndNotify = async (id: string, status: Declaration["status"]): Promise<boolean> => {
  try {
    const updated = await updateDeclaration(id, { status });
    
    if (updated) {
      try {
        // Send notification for status change
        await notifyStatusChange(updated);
        return true;
      } catch (error) {
        console.error("Error sending status update notification:", error);
        // Even if notification fails, return true as status was updated
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error updating status and notifying:", error);
    return false;
  }
};

// Function to get notification history from localStorage
export const getDeclarationNotificationHistory = async (declarationId: string): Promise<any[]> => {
  try {
    // Get notifications from localStorage
    const localNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || '[]')
      .filter((n: any) => n.declaration_id === declarationId)
      .sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
    
    return localNotifications;
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return [];
  }
};
