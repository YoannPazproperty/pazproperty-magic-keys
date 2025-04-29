
import { useState, useEffect } from "react";
import { DeclarationList } from "@/components/admin/DeclarationList";
import { getDeclarations, updateDeclarationStatus } from "@/services/declarationService";
import { toast } from "sonner";
import type { Declaration } from "@/services/types";

export const DeclarationsTab = () => {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDeclarations();
  }, []);

  const loadDeclarations = async () => {
    setIsLoading(true);
    try {
      const allDeclarations = await getDeclarations();
      console.log("Loaded declarations:", allDeclarations);
      setDeclarations(allDeclarations);
    } catch (error) {
      console.error("Error loading declarations:", error);
      toast.error("Erreur lors du chargement des déclarations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Declaration["status"]) => {
    try {
      const updated = await updateDeclarationStatus(id, status);
      if (updated) {
        await loadDeclarations();
        toast.success("Statut mis à jour");
      } else {
        toast.error("Erreur lors de la mise à jour du statut");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  return (
    <DeclarationList 
      declarations={declarations} 
      onStatusUpdate={handleStatusUpdate}
      isLoading={isLoading} 
    />
  );
};
