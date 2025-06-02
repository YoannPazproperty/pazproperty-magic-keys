import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConnected } from "../supabaseService";

/**
 * Notification Logging Utility
 * Permet d’enregistrer l’historique des notifications envoyées, à la fois en localStorage (fallback)
 * et dans la table notifications de Supabase pour une centralisation future.
 */

// Clé du stockage local
const NOTIFICATIONS_STORAGE_KEY = 'notifications';

/**
 * Typage de la notification pour éviter les erreurs à l’avenir
 */
export interface NotificationLog {
  id?: string;
  declaration_id: string;
  email: string;
  type: string; // ex: "status-update", "new-assignment", "quote-approved", etc.
  status: string; // ex: "Envoyé", "Échoué", etc.
  sent_at?: string; // Date ISO string
}

/**
 * Log local en fallback et pour l’UX immédiate.
 */
export const logNotificationLocally = (notificationData: NotificationLog) => {
  try {
    const storedNotifications: NotificationLog[] = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || '[]');
    storedNotifications.push({
      ...notificationData,
      id: Date.now().toString(),
      sent_at: new Date().toISOString(),
    });
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(storedNotifications));
    console.log("[Notification] Stockée localement:", notificationData);
  } catch (error) {
    console.error("[Notification] Erreur stockage local:", error);
  }
};

/**
 * Log dans Supabase (table notifications). 
 * Ne bloque pas l’application en cas d’échec : remonte juste une erreur dans la console.
 */
export const logNotificationToSupabase = async (notificationData: NotificationLog): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error("[Notification] Supabase non initialisé");
      return false;
    }

    const isConnected = await isSupabaseConnected();
    if (!isConnected) {
      console.warn("[Notification] Supabase non connecté, fallback local uniquement");
      return false;
    }

    // Adapter pour correspondre au schéma de Supabase
    const supabaseData = {
      declaration_id: notificationData.declaration_id,
      email: notificationData.email,
      type: notificationData.type,
      status: notificationData.status,
      sent_at: notificationData.sent_at || new Date().toISOString(),
    };

    const { error } = await supabase
      .from('notifications')
      .insert(supabaseData);

    if (error) {
      console.error("[Notification] Erreur d’insertion Supabase:", error);
      return false;
    }

    console.log("[Notification] Logguée dans Supabase");
    return true;
  } catch (err) {
    console.error("[Notification] Exception Supabase:", err);
    return false;
  }
};

/**
 * Fonction principale : tente Supabase, fallback local systématique.
 * Toujours retourner true pour ne pas bloquer les workflows UX.
 */
export const logNotification = async (notificationData: NotificationLog): Promise<boolean> => {
  // Log Supabase (tentative)
  await logNotificationToSupabase(notificationData);

  // Log local systématique (historique/fallback)
  logNotificationLocally(notificationData);

  return true;
};