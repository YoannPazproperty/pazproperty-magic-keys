
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConnected } from "../supabaseService";

// Table name for notifications in localStorage
const NOTIFICATIONS_STORAGE_KEY = 'notifications';

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
