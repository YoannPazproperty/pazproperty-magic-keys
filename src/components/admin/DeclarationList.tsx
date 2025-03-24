
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { Declaration } from "@/services/types";
import { DeclarationListTable } from "./DeclarationListTable";
import { DeclarationDetailsDialog } from "./DeclarationDetailsDialog";

interface DeclarationListProps {
  declarations: Declaration[];
  onStatusUpdate: (id: string, status: Declaration["status"]) => void;
}

export const DeclarationList = ({ declarations, onStatusUpdate }: DeclarationListProps) => {
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const viewDeclarationDetails = (declaration: Declaration) => {
    setSelectedDeclaration(declaration);
    setIsDetailOpen(true);
  };

  const handleStatusUpdate = (id: string, newStatus: Declaration["status"]) => {
    onStatusUpdate(id, newStatus);
    
    if (selectedDeclaration && selectedDeclaration.id === id) {
      setSelectedDeclaration({ ...selectedDeclaration, status: newStatus });
    }
    
    toast("Statut mis à jour", {
      description: `La déclaration a été mise à jour avec le statut "${translateStatus(newStatus)}".`
    });
  };
  
  const translateStatus = (status: string): string => {
    const translations: Record<string, string> = {
      pending: "Em espera",
      in_progress: "Em progresso",
      resolved: "Resolvido",
    };
    return translations[status] || status;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Déclarations des Locataires</CardTitle>
          <CardDescription>
            Liste de toutes les déclarations soumises par les locataires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeclarationListTable 
            declarations={declarations} 
            onViewDetails={viewDeclarationDetails} 
          />
        </CardContent>
      </Card>

      <DeclarationDetailsDialog 
        declaration={selectedDeclaration}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};
