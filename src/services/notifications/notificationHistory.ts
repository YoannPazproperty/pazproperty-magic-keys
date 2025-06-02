import { isSupabaseConnected } from "../supabaseService";
import { supabase } from "@/integrations/supabase/client";
import type { NotificationLog } from "@/services/types"; // Prends bien le type global, pas notificationStorage

// Clé unique pour le stockage local (doit matcher notificationStorage.ts)
const NOTIFICATIONS_STORAGE_KEY = "notifications";

/**
 * Récupère l’historique des notifications pour une déclaration :
 * - Priorité à Supabase (si connecté)
 * - Sinon fallback sur localStorage (toujours trié par date décroissante)
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
        // On vérifie que chaque log est complet
        return (data as NotificationLog[]).map((log) => ({
          ...log,
          sent_at: log.sent_at || "", // fallback string vide si absent
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
        // Sécurise la gestion des dates même si sent_at est absent
        const dateA = a.sent_at ? new Date(a.sent_at).getTime() : 0;
        const dateB = b.sent_at ? new Date(b.sent_at).getTime() : 0;
        return dateB - dateA;
      });
  } catch (err) {
    console.error("[NotificationHistory] Erreur lecture localStorage:", err);
    return [];
  }
};