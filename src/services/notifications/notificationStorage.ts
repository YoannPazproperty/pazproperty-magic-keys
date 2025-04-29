
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConnected } from "../supabaseService";

// Table name for notifications in localStorage
const NOTIFICATIONS_STORAGE_KEY = 'notifications';

// Function to log notification to local storage
export const logNotificationLocally = (notificationData: any) => {
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
export const logNotificationToSupabase = async (notificationData: any): Promise<boolean> => {
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
export const logNotification = async (notificationData: any): Promise<boolean> => {
  // Tenter d'abord d'enregistrer dans Supabase
  const supabaseSuccess = await logNotificationToSupabase(notificationData);
  
  // Toujours enregistrer localement comme sauvegarde
  logNotificationLocally(notificationData);
  
  return true;
};
