
/**
 * getDeclarationNotificationHistory
 * Centralise la récupération des historiques de notifications d'une déclaration :
 *  - Supabase si connecté (live multi-user)
 *  - Sinon fallback localStorage (offline)
 * Compatible avec le typage global NotificationLog du projet
 */
import { isSupabaseConnected } from "../supabaseService";
import { supabase } from "@/integrations/supabase/client";
import type { NotificationLog } from "@/services/types"; // Prends bien le type global

const NOTIFICATIONS_STORAGE_KEY = "notifications";

/**
 * Récupère l'historique des notifications pour une déclaration :
 * - Priorité à Supabase (si connecté)
 * - Sinon fallback sur localStorage (trié date décroissante)
 */
export const getDeclarationNotificationHistory = async (
  declarationId: string
): Promise<NotificationLog[]> => {
  // 1. Tentative Supabase (live, fiable, multi-user)
  try {
    const isConnected = await isSupabaseConnected();
    if (isConnected) {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("declaration_id", declarationId)
        .order("sent_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        // Convert Supabase data to NotificationLog format
        return data.map((log: any): NotificationLog => ({
          id: log.id,
          declaration_id: log.declaration_id || "",
          notification_type: log.type || "",
          recipient_email: log.email || null,
          recipient_type: "tenant", // Default value since not stored in old schema
          sent_at: log.sent_at || "",
          success: log.status === 'sent',
          error_message: log.status === 'failed' ? 'Send failed' : null,
          message_content: `Notification sent to ${log.email}`,
          // Legacy properties for backward compatibility
          email: log.email,
          type: log.type,
          status: log.status
        }));
      } else if (error) {
        console.warn("[NotificationHistory] Erreur récupération Supabase:", error);
      }
    }
  } catch (err) {
    console.warn("[NotificationHistory] Exception récupération Supabase:", err);
  }

  // 2. Fallback localStorage (en offline uniquement)
  try {
    const localNotifications: NotificationLog[] = JSON.parse(
      localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || "[]"
    );
    return localNotifications
      .filter((n) => n.declaration_id === declarationId)
      .sort((a, b) => {
        const dateA = a.sent_at ? new Date(a.sent_at).getTime() : 0;
        const dateB = b.sent_at ? new Date(b.sent_at).getTime() : 0;
        return dateB - dateA;
      });
  } catch (err) {
    console.error("[NotificationHistory] Erreur lecture localStorage:", err);
    return [];
  }
};
