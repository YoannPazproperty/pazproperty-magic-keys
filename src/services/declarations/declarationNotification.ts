
import { toast } from "sonner";
import { Declaration } from "../types";
import { sendNotificationEmail } from "../notificationService";
import { updateDeclaration } from "./declarationStorage";
import { getSupabase } from "../supabaseService";

// Table name for notifications in Supabase
const NOTIFICATIONS_TABLE = 'notifications';

// Function to log notification to local storage when Supabase is unavailable
const logNotificationLocally = (notificationData: any) => {
  const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  storedNotifications.push({
    ...notificationData,
    id: Date.now().toString(),
    sent_at: new Date().toISOString()
  });
  localStorage.setItem('notifications', JSON.stringify(storedNotifications));
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
    
    // Log notification in Supabase if connected
    const supabase = getSupabase();
    let isConnected = false;
    
    // Check connection differently
    if (supabase) {
      try {
        const { error } = await supabase.from('declarations').select('count', { count: 'exact', head: true });
        isConnected = !error;
      } catch (err) {
        isConnected = false;
      }
    }
    
    if (isConnected && supabase) {
      try {
        // Store notification record in Supabase
        await supabase.from(NOTIFICATIONS_TABLE).insert({
          declaration_id: declaration.id,
          email: declaration.email,
          type: 'statusUpdate',
          status: declaration.status,
          sent_at: new Date().toISOString()
        });
        
        console.log("Status update notification stored in Supabase");
      } catch (error) {
        console.error("Failed to store notification in Supabase:", error);
        // Fallback to local storage
        logNotificationLocally({
          declaration_id: declaration.id,
          email: declaration.email,
          type: 'statusUpdate',
          status: declaration.status
        });
      }
    } else {
      console.log("Supabase not connected, notification only sent via email");
      // Store locally
      logNotificationLocally({
        declaration_id: declaration.id,
        email: declaration.email,
        type: 'statusUpdate',
        status: declaration.status
      });
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
    
    // Check connection differently
    if (supabase) {
      try {
        const { error } = await supabase.from('declarations').select('count', { count: 'exact', head: true });
        isConnected = !error;
      } catch (err) {
        isConnected = false;
      }
    }
    
    if (isConnected && supabase) {
      try {
        // Store notification record in Supabase
        await supabase.from(NOTIFICATIONS_TABLE).insert({
          declaration_id: declaration.id,
          email: declaration.email,
          type: 'declarationReceived',
          status: declaration.status,
          sent_at: new Date().toISOString()
        });
        
        console.log("New declaration notification stored in Supabase");
      } catch (error) {
        console.error("Failed to store notification in Supabase:", error);
        // Fallback to local storage
        logNotificationLocally({
          declaration_id: declaration.id,
          email: declaration.email,
          type: 'declarationReceived',
          status: declaration.status
        });
      }
    } else {
      console.log("Supabase not connected, notification only sent via email");
      // Store locally
      logNotificationLocally({
        declaration_id: declaration.id,
        email: declaration.email,
        type: 'declarationReceived',
        status: declaration.status
      });
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

// Function to get notification history from both Supabase and localStorage
export const getDeclarationNotificationHistory = async (declarationId: string): Promise<any[]> => {
  try {
    const supabase = getSupabase();
    let supabaseNotifications: any[] = [];
    let isConnected = false;
    
    // Check if Supabase is available
    if (supabase) {
      try {
        const { error } = await supabase.from('declarations').select('count', { count: 'exact', head: true });
        isConnected = !error;
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
          
          if (!error && data) {
            supabaseNotifications = data;
          }
        } catch (error) {
          console.error("Error fetching notification history from Supabase:", error);
        }
      }
    }
    
    // Get notifications from localStorage as well
    const localNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      .filter((n: any) => n.declaration_id === declarationId)
      .sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
    
    // Combine both sources with Supabase taking precedence
    const allNotifications = [...supabaseNotifications];
    
    // Add local notifications that don't exist in Supabase
    localNotifications.forEach((localNote: any) => {
      if (!supabaseNotifications.some(supNote => supNote.id === localNote.id)) {
        allNotifications.push(localNote);
      }
    });
    
    return allNotifications.sort(
      (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
    );
  } catch (error) {
    console.error("Error fetching notification history:", error);
    
    // Fallback to local storage only
    const localNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      .filter((n: any) => n.declaration_id === declarationId)
      .sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
    
    return localNotifications;
  }
};
