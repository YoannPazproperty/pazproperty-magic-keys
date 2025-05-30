
import { supabase } from "@/integrations/supabase/client";
import { Declaration } from "../types";

export const updateStatusAndNotify = async (
  declarationId: string,
  newStatus: Declaration["status"],
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
    // Préparer les données de mise à jour
    const updateData: any = {
      status: newStatus,
      ...additionalUpdates
    };

    // Si on assigne un prestataire, ajouter la date d'assignation
    if (additionalUpdates.prestador_id) {
      updateData.prestador_assigned_at = new Date().toISOString();
    }

    console.log("updateStatusAndNotify: Updating declaration", declarationId, "with data:", updateData);

    // Mettre à jour la déclaration dans Supabase
    const { data, error } = await supabase
      .from('declarations')
      .update(updateData)
      .eq('id', declarationId)
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
