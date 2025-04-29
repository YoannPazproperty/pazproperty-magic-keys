
import { Declaration } from "../types";
import { sendNotificationEmail } from "../notificationService";
import { updateDeclaration } from "../declarations/declarationStorage";
import { logNotification } from "./notificationStorage";

// Send notification when a declaration status changes
export const notifyStatusChange = async (declaration: Declaration): Promise<boolean> => {
  try {
    // Send email notification
    await sendNotificationEmail(
      declaration.email || '',
      "Status Update",
      `Your declaration status has been updated to: ${declaration.status}`
    );
    
    // Store notification
    await logNotification({
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
      declaration.email || '',
      "Declaration Received",
      `Thank you for submitting your declaration. We will process it shortly.`
    );
    
    // Store notification
    await logNotification({
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
