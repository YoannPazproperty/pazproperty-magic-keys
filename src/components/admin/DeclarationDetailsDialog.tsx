
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { DeclarationDetails } from "./DeclarationDetails";
import type { Declaration } from "../../services/types";
import { formatDate, getStatusBadgeColor, translateStatus } from "../../utils/translationUtils";
import { ScrollArea } from "../ui/scroll-area";

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
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Détails de la déclaration</DialogTitle>
          <DialogDescription>
            Soumise le {formatDate(declaration.submittedAt || null)}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-full max-h-[calc(85vh-10rem)] pr-4">
          <DeclarationDetails 
            declaration={declaration} 
            onStatusUpdate={onStatusUpdate} 
            getStatusBadgeColor={getStatusBadgeColor}
            translateStatus={translateStatus}
          />
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
