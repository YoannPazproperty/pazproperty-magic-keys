
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Declaration } from "@/services/types";

export const useProviderAssignment = () => {
  const handleProviderAssignment = async (declarationId: string, providerId: string) => {
    const { error } = await supabase
      .from('declarations')
      .update({ 
        prestador_id: providerId,
        prestador_assigned_at: new Date().toISOString()
      })
      .eq('id', declarationId);

    if (error) {
      console.error('Error assigning provider:', error);
      toast.error("Erreur lors de l'affectation du prestataire");
      return;
    }

    toast.success("Prestataire affecté avec succès");
  };

  return { handleProviderAssignment };
};
