import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConnected } from "../supabaseService";

/**
 * Utilitaire pour loguer toutes les notifications dans Supabase + localStorage.
 * Cohérence parfaite avec NotificationLog du src/services/types.ts
 */

// On utilise le type global importé pour éviter les divergences
import type { NotificationLog } from "@/services/types"; // Assure-toi que tout le projet référence ce type

const NOTIFICATIONS_STORAGE_KEY = "notifications";

/**
 * Log local (fallback + historique offline)
 */
export const logNotificationLocally = (notification: NotificationLog) => {
  try {
    const stored: NotificationLog[] = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || "[]");
    stored.push({
      ...notification,
      id: notification.id || Date.now().toString(),
      sent_at: notification.sent_at || new Date().toISOString(),
    });
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(stored));
    console.log("[Notification] Stockée localement:", notification);
  } catch (error) {
    console.error("[Notification] Erreur stockage local:", error);
  }
};

/**
 * Log dans Supabase (table notifications)
 */
export const logNotificationToSupabase = async (notification: NotificationLog): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error("[Notification] Supabase non initialisé");
      return false;
    }

    const isConnected = await isSupabaseConnected();
    if (!isConnected) {
      console.warn("[Notification] Supabase non connecté, fallback local seulement");
      return false;
    }

    // Format pour Supabase (évite les champs inconnus)
    const supabaseData = {
      declaration_id: notification.declaration_id,
      email: notification.email,
      type: notification.type,
      status: notification.status,
      sent_at: notification.sent_at || new Date().toISOString(),
    };

    const { error } = await supabase.from("notifications").insert(supabaseData);

    if (error) {
      console.error("[Notification] Erreur d’insertion Supabase:", error);
      return false;
    }

    console.log("[Notification] Logguée dans Supabase:", supabaseData);
    return true;
  } catch (err) {
    console.error("[Notification] Exception Supabase:", err);
    return false;
  }
};

/**
 * Fonction principale qui log d'abord dans Supabase puis toujours localement (défensif)
 */
export const logNotification = async (notification: NotificationLog): Promise<boolean> => {
  await logNotificationToSupabase(notification); // On n’arrête jamais le process
  logNotificationLocally(notification);
  return true;
};