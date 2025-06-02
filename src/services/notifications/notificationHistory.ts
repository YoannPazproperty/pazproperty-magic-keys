import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConnected } from "../supabaseService";

const NOTIFICATIONS_STORAGE_KEY = 'notifications';

/**
 * Récupère l’historique des notifications pour une déclaration donnée,
 * en priorité depuis Supabase, sinon depuis le localStorage (fallback offline).
 */
export const getDeclarationNotificationHistory = async (declarationId: string): Promise<any[]> => {
  try {
    let notifications: any[] = [];

    // 1. Essayer de charger depuis Supabase (si connecté)
    const isConnected = await isSupabaseConnected?.();
    if (isConnected) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('declaration_id', declarationId)
        .order('sent_at', { ascending: false });

      if (!error && data) {
        notifications = data;
      } else if (error) {
        console.warn("Erreur Supabase, fallback localStorage:", error);
      }
    }

    // 2. Si vide, charger depuis le localStorage
    if (!notifications.length) {
      try {
        const localNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || '[]')
          .filter((n: any) => n.declaration_id === declarationId)
          .sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
        notifications = localNotifications;
      } catch (e) {
        notifications = [];
      }
    }

    return notifications;
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return [];
  }
};