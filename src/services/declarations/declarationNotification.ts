
import { toast } from "sonner";
import { Declaration } from "../types";
import { sendNotificationEmail } from "../notificationService";
import { updateDeclaration } from "./declarationStorage";
import { getSupabase } from "../supabaseService";

// Table name for notifications in Supabase
const NOTIFICATIONS_TABLE = 'notifications';

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
    
    // Log notification in Supabase if connected
    const supabase = getSupabase();
    let isConnected = false;
    
    // Utiliser une approche différente pour vérifier la connexion
    try {
      const result = await supabase.from(NOTIFICATIONS_TABLE).select('count', { count: 'exact', head: true });
      isConnected = !result.error;
    } catch (err) {
      isConnected = false;
    }
    
    if (isConnected) {
      // Store notification record in Supabase
      await supabase.from(NOTIFICATIONS_TABLE).insert({
        declaration_id: declaration.id,
        email: declaration.email,
        type: 'statusUpdate',
        status: declaration.status,
        sent_at: new Date().toISOString()
      });
      
      console.log("Status update notification stored in Supabase");
    } else {
      console.log("Supabase not connected, notification only sent via email");
    }
    
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
    
    // Log notification in Supabase if connected
    const supabase = getSupabase();
    let isConnected = false;
    
    // Utiliser une approche différente pour vérifier la connexion
    try {
      const result = await supabase.from(NOTIFICATIONS_TABLE).select('count', { count: 'exact', head: true });
      isConnected = !result.error;
    } catch (err) {
      isConnected = false;
    }
    
    if (isConnected) {
      // Store notification record in Supabase
      await supabase.from(NOTIFICATIONS_TABLE).insert({
        declaration_id: declaration.id,
        email: declaration.email,
        type: 'declarationReceived',
        status: declaration.status,
        sent_at: new Date().toISOString()
      });
      
      console.log("New declaration notification stored in Supabase");
    } else {
      console.log("Supabase not connected, notification only sent via email");
    }
    
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

// Fonction pour récupérer l'historique des notifications d'une déclaration depuis Supabase
export const getDeclarationNotificationHistory = async (declarationId: string): Promise<any[]> => {
  try {
    const supabase = getSupabase();
    let isConnected = false;
    
    // Utiliser une approche différente pour vérifier la connexion
    try {
      const result = await supabase.from(NOTIFICATIONS_TABLE).select('count', { count: 'exact', head: true });
      isConnected = !result.error;
    } catch (err) {
      isConnected = false;
    }
    
    if (isConnected) {
      try {
        const { data, error } = await supabase
          .from(NOTIFICATIONS_TABLE)
          .select('*')
          .eq('declaration_id', declarationId)
          .order('sent_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching notification history:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Error fetching notification history:", error);
        return [];
      }
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return [];
  }
};
