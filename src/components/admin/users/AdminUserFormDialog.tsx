import React from "react";
import { Dialog, DialogContent } from "../../ui/dialog";
import { UserCreationForm } from "../../auth/UserCreationForm";
import { useUserCreationContext } from "../../../contexts/UserCreationContext";

interface AdminUserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminUserFormDialog: React.FC<AdminUserFormDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
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
          onSuccess={onSuccess}
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
