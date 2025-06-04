
/**
 * Declaration Status Update & Notification Handler
 * Met à jour le statut d'une déclaration dans Supabase et prépare les futurs envois de notifications automatisées.
 * (Prochaines automatisations prévues dans le mastodonte)
 */

import { supabase } from "../../integrations/supabase/client";
import { Declaration, DeclarationStatus } from "../types";

/**
 * Met à jour le statut d'une déclaration et envoie une notification si nécessaire.
 * @param declarationId - ID de la déclaration à mettre à jour
 * @param newStatus - Nouveau statut à appliquer
 * @param additionalUpdates - Autres champs à mettre à jour (ex : prestador_id, meeting_date, etc.)
 * @returns {Promise<boolean>} - true si la mise à jour a réussi, false sinon.
 */
export const updateStatusAndNotify = async (
  declarationId: string,
  newStatus: DeclarationStatus,
  additionalUpdates: {
    prestador_id?: string;
    meeting_date?: string;
    meeting_notes?: string;
    quote_amount?: number;
    quote_approved?: boolean;
    quote_rejection_reason?: string;
  } = {}
): Promise<boolean> => {
  try {
    // Préparation des données à mettre à jour
    const updateData: Record<string, any> = {
      status: newStatus,
      ...additionalUpdates,
    };

    // Si un prestataire est assigné, logguer la date d'assignation
    if (additionalUpdates.prestador_id) {
      updateData.prestador_assigned_at = new Date().toISOString();
    }

    // --- Future automation: trigger email/notification logic here if needed ---

    // Mise à jour de la déclaration dans Supabase
    const { data, error } = await supabase
      .from("declarations")
      .update(updateData)
      .eq("id", declarationId)
      .select()
      .single();

    if (error) {
      console.error("updateStatusAndNotify: Error updating declaration:", error);
      return false;
    }

    console.log("updateStatusAndNotify: Declaration updated successfully:", data);
    return true;
  } catch (error) {
    console.error("updateStatusAndNotify: Exception:", error);
    return false;
  }
};
