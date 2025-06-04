import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { AffaireForm } from "./AffaireForm";

export interface AffaireFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  affaireId?: string;
}

export const AffaireFormDialog: React.FC<AffaireFormDialogProps> = ({ 
  isOpen, 
  onClose, 
  contactId, 
  affaireId 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{affaireId ? "Modifier l'affaire" : "Créer une nouvelle affaire"}</DialogTitle>
        </DialogHeader>
        <AffaireForm contactId={contactId} affaireId={affaireId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
