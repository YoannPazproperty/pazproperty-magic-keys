
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DeleteTechnicianDialogProps } from "./types";

export const DeleteTechnicianDialog: React.FC<DeleteTechnicianDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  technicianName,
  isDeleting,
  errorMessage
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le prestataire technique 
            {technicianName ? ` "${technicianName}"` : ""}? 
            Cette action est irréversible.
            {errorMessage && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md">
                {errorMessage}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
