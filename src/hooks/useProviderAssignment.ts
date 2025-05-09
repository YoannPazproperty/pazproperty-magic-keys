
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { updateStatusAndNotify } from "@/services/notifications";
import { toast } from "sonner";

export const useProviderAssignment = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleProviderAssignment = async (declarationId: string, providerId: string) => {
    if (!declarationId || !providerId) {
      toast.error("Données insuffisantes pour assigner le prestataire");
      return false;
    }
    
    setIsLoading(true);
    try {
      // Mise à jour de la déclaration avec le prestataire assigné
      const success = await updateStatusAndNotify(
        declarationId,
        "Em espera do encontro de diagnostico",
        { provider_id: providerId }
      );
      
      if (success) {
        toast.success("Prestataire assigné avec succès");
      } else {
        toast.error("Erreur lors de l'assignation du prestataire");
      }
      
      return success;
    } catch (error) {
      console.error("Erreur lors de l'assignation du prestataire:", error);
      toast.error("Erreur lors de l'assignation du prestataire");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    handleProviderAssignment
  };
};
