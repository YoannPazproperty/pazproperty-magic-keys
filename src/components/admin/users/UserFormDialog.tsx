import React, { useEffect } from "react";
import { Dialog, DialogContent } from "../../ui/dialog";
import { UserCreationForm } from "../../auth/UserCreationForm";
import { useUserCreationContext } from "../../../contexts/UserCreationContext";

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  // Utiliser le contexte de création d'utilisateur
  const { setContext } = useUserCreationContext();
  
  // Définir le contexte approprié pour cette page
  useEffect(() => {
    setContext('employee_creation');
  }, [setContext]);
  
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <UserCreationForm 
          context="employee_creation"
          showRoleSelector={true}
          allowedRoles={['admin', 'user']}
          onSuccess={handleSuccess}
          onCancel={onClose}
          additionalMetadata={{
            is_company_user: true,
            domain: 'pazproperty.pt'
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
