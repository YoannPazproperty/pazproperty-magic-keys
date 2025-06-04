
import { toast } from "sonner";
import { updateStatusAndNotify } from "../services/notifications";

export const useProviderAssignment = () => {
  const handleProviderAssignment = async (declarationId: string, providerId: string) => {
    try {
      console.log("Assigning provider:", providerId, "to declaration:", declarationId);
      
      const success = await updateStatusAndNotify(
        declarationId,
        "AWAITING_DIAGNOSTIC",
        { prestador_id: providerId }
      );

      if (success) {
        toast.success("Prestataire assigné avec succès");
        console.log("Provider assignment successful");
        return true;
      } else {
        toast.error("Erreur lors de l'assignation du prestataire");
        console.error("Provider assignment failed");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de l'assignation du prestataire:", error);
      toast.error("Erreur lors de l'assignation du prestataire");
      return false;
    }
  };

  return { handleProviderAssignment };
};
