
import { toast } from "sonner";
import { Declaration } from "../types";
import { sendNotificationEmail } from "../notificationService";
import { updateDeclaration } from "./declarationStorage";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConnected } from "../supabaseService";

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

// Function to log notification to Supabase
const logNotificationToSupabase = async (notificationData: any): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error("Supabase n'est pas disponible");
      return false;
    }
    
    const isConnected = await isSupabaseConnected();
    if (!isConnected) {
      console.error("Supabase n'est pas connecté");
      return false;
    }
    
    // Tenter d'insérer dans la table notifications
    console.log("Tentative d'insertion dans Supabase:", notificationData);
    
    // Transformer les données pour correspondre au schéma Supabase
    const supabaseData = {
      declaration_id: notificationData.declaration_id,
      email: notificationData.email,
      type: notificationData.type, 
      status: notificationData.status
      // sent_at sera ajouté automatiquement par défaut
    };
    
    const { error } = await supabase
      .from('notifications')
      .insert(supabaseData);
    
    if (error) {
      console.error("Erreur lors de l'insertion dans Supabase:", error);
      return false;
    }
    
    console.log("Notification enregistrée dans Supabase avec succès");
    return true;
  } catch (err) {
    console.error("Erreur lors de l'enregistrement de la notification dans Supabase:", err);
    return false;
  }
};

// Function to log notification (tries Supabase first, then falls back to localStorage)
const logNotification = async (notificationData: any): Promise<boolean> => {
  // Tenter d'abord d'enregistrer dans Supabase
  const supabaseSuccess = await logNotificationToSupabase(notificationData);
  
  // Toujours enregistrer localement comme sauvegarde
  logNotificationLocally(notificationData);
  
  return true;
};

// Send notification when a declaration status changes
export const notifyStatusChange = async (declaration: Declaration): Promise<boolean> => {
  try {
    // Send email notification - updating to match the expected parameter count
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
    // Send email notification - updating to match the expected parameter count
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

// Function to get notification history from localStorage and Supabase
export const getDeclarationNotificationHistory = async (declarationId: string): Promise<any[]> => {
  try {
    let notifications = [];
    
    // Attempt to get notifications from Supabase first
    if (supabase) {
      try {
        const isConnected = await isSupabaseConnected();
        
        if (isConnected) {
          console.log("Tentative de récupération des notifications depuis Supabase");
          
          // Using type assertion to bypass TypeScript errors
          // This is safe because we know the table exists in Supabase
          const { data, error } = await (supabase as any)
            .from('notifications')
            .select('*')
            .eq('declaration_id', declarationId)
            .order('sent_at', { ascending: false });
            
          if (error) {
            console.error("Erreur lors de la récupération des notifications depuis Supabase:", error);
          } else if (data && data.length > 0) {
            console.log("Notifications récupérées depuis Supabase:", data);
            notifications = data;
          }
        }
      } catch (supabaseError) {
        console.error("Erreur lors de la récupération des notifications depuis Supabase:", supabaseError);
      }
    }
    
    // Always get notifications from localStorage as a backup
    const localNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || '[]')
      .filter((n: any) => n.declaration_id === declarationId)
      .sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
    
    // If we didn't get any notifications from Supabase, use the local ones
    if (notifications.length === 0) {
      notifications = localNotifications;
    }
    
    return notifications;
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return [];
  }
};
