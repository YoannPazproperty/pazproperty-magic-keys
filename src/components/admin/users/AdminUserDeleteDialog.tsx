
import React, { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { archiveCompanyUser } from "@/services/admin/companyUserService";

interface AdminUserDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string | null;
  userName: string;
  userEmail: string;
}

export const AdminUserDeleteDialog: React.FC<AdminUserDeleteDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userName,
  userEmail
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!userId) return;
    
    setIsDeleting(true);
    try {
      toast.info("Suppression de l'utilisateur en cours...");
      
      const result = await archiveCompanyUser(userId);
      
      if (result.success) {
        toast.success("Utilisateur supprimé avec succès", {
          description: `L'utilisateur ${userName} a été archivé`
        });
        onSuccess();
      } else {
        toast.error("Erreur lors de la suppression", {
          description: result.message || "Une erreur est survenue lors de la suppression de l'utilisateur"
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast.error("Une erreur est survenue", {
        description: error.message || "Impossible de supprimer l'utilisateur"
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="mb-2">
              Vous êtes sur le point de supprimer l'utilisateur suivant :
            </p>
            <p className="font-medium">{userName}</p>
            <p className="text-sm text-gray-500">{userEmail}</p>
            <p className="mt-4">
              Cette action archivera l'utilisateur. Il ne pourra plus se connecter à l'application mais ses données seront conservées dans les archives.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Suppression en cours..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
