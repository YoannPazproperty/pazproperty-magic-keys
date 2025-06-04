
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Affaire } from "../services/types";
import { supabase } from "../integrations/supabase/client";

export const useAffaires = (contactId: string) => {
  const [affaires, setAffaires] = useState<Affaire[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAffaires = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('affaires')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAffaires(data || []);
    } catch (error) {
      console.error("Error loading affaires:", error);
      toast.error("Erreur lors du chargement des affaires");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAffaire = async (affaireId: string) => {
    try {
      const { error } = await supabase
        .from('affaires')
        .delete()
        .eq('id', affaireId);

      if (error) throw error;

      toast.success("Affaire supprimée avec succès");
      await loadAffaires();
    } catch (error) {
      console.error("Error deleting affaire:", error);
      toast.error("Erreur lors de la suppression de l'affaire");
    }
  };

  const refreshAffaires = () => {
    loadAffaires();
  };

  useEffect(() => {
    loadAffaires();
  }, [contactId]);

  return {
    affaires,
    isLoading,
    deleteAffaire,
    refreshAffaires
  };
};
