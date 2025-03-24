
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeclarationDetails } from "./DeclarationDetails";
import type { Declaration } from "@/services/types";
import { formatDate, getStatusBadgeColor, translateStatus } from "@/utils/translationUtils";

interface DeclarationDetailsDialogProps {
  declaration: Declaration | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: Declaration["status"]) => void;
}

export const DeclarationDetailsDialog = ({
  declaration,
  isOpen,
  onClose,
  onStatusUpdate,
}: DeclarationDetailsDialogProps) => {
  if (!declaration) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Détails de la déclaration</DialogTitle>
          <DialogDescription>
            Soumise le {formatDate(declaration.submittedAt)}
          </DialogDescription>
        </DialogHeader>
        
        <DeclarationDetails 
          declaration={declaration} 
          onStatusUpdate={onStatusUpdate} 
          getStatusBadgeColor={getStatusBadgeColor}
          translateStatus={translateStatus}
        />
        
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
