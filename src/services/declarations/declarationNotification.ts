
import { toast } from "sonner";
import { Declaration } from "../types";
import { sendNotificationEmail } from "../notificationService";
import { updateDeclaration } from "./declarationStorage";

// Send notification when a declaration status changes
export const notifyStatusChange = async (declaration: Declaration): Promise<boolean> => {
  try {
    await sendNotificationEmail(
      declaration.email,
      "tenant",
      "statusUpdate",
      declaration
    );
    return true;
  } catch (error) {
    console.error("Error sending status update email:", error);
    return false;
  }
};

// Send initial notification for new declaration
export const notifyNewDeclaration = async (declaration: Declaration): Promise<boolean> => {
  try {
    await sendNotificationEmail(
      declaration.email,
      "tenant",
      "declarationReceived",
      declaration
    );
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
};

// Update status and notify
export const updateStatusAndNotify = (id: string, status: Declaration["status"]): boolean => {
  const updated = updateDeclaration(id, { status });
  
  if (updated) {
    // Send notification for status change
    notifyStatusChange(updated).catch(error => {
      console.error("Error sending status update notification:", error);
    });
  }
  
  return updated !== null;
};
