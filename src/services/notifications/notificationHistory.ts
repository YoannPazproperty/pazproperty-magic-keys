import { isSupabaseConnected } from "../supabaseService";
import { supabase } from "@/integrations/supabase/client";
import type { NotificationLog } from "./notificationStorage";

// Clé du stockage local (doit correspondre à notificationStorage.ts)
const NOTIFICATIONS_STORAGE_KEY = "notifications";

/**
 * Récupère l’historique des notifications d’une déclaration :
 *  - Supabase si connecté
 *  - Fallback localStorage sinon
 */
export const getDeclarationNotificationHistory = async (
  declarationId: string
): Promise<NotificationLog[]> => {
  // 1. Essayer Supabase
  try {
    const isConnected = await isSupabaseConnected();
    if (isConnected) {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("declaration_id", declarationId)
        .order("sent_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return data as NotificationLog[];
      } else if (error) {
        console.warn(
          "[NotificationHistory] Erreur récupération Supabase:",
          error
        );
      }
    }
  } catch (e) {
    console.warn(
      "[NotificationHistory] Exception récupération Supabase:",
      e
    );
  }

  // 2. Fallback : localStorage
  try {
    const localNotifications: NotificationLog[] = JSON.parse(
      localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || "[]"
    );
    return localNotifications
      .filter((n) => n.declaration_id === declarationId)
      .sort(
        (a, b) =>
          new Date(b.sent_at || 0).getTime() -
          new Date(a.sent_at || 0).getTime()
      );
  } catch (e) {
    console.error(
      "[NotificationHistory] Erreur lecture localStorage:",
      e
    );
    return [];
  }
};