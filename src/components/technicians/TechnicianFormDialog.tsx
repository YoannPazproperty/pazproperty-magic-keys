
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import technicienService from '@/services/technicienService';
import { TechnicianFormDialogProps, TechnicianFormValues } from './types';
import { TechnicianForm } from './TechnicianForm';

export const TechnicianFormDialog: React.FC<TechnicianFormDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  technicianToEdit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  
  const [formValues, setFormValues] = useState<TechnicianFormValues>({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialty: '',
    isActive: true
  });
  
  useEffect(() => {
    if (isOpen) {
      if (technicianToEdit) {
        setFormMode('edit');
        setFormValues({
          name: technicianToEdit.name,
          email: technicianToEdit.email,
          password: technicianToEdit.password,
          phone: technicianToEdit.phone || '',
          specialty: technicianToEdit.specialty || '',
          isActive: technicianToEdit.isActive
        });
      } else {
        setFormMode('add');
        setFormValues({
          name: '',
          email: '',
          password: '',
          phone: '',
          specialty: '',
          isActive: true
        });
      }
    }
  }, [isOpen, technicianToEdit]);

  const handleChange = (field: keyof TechnicianFormValues, value: string | boolean) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (formMode === 'add') {
        technicienService.add({
          name: formValues.name,
          email: formValues.email,
          password: formValues.password,
          phone: formValues.phone,
          specialty: formValues.specialty,
          isActive: formValues.isActive
        });
        toast.success("Technicien ajouté avec succès");
      } else if (formMode === 'edit' && technicianToEdit) {
        technicienService.update(technicianToEdit.id, {
          name: formValues.name,
          email: formValues.email,
          password: formValues.password,
          phone: formValues.phone,
          specialty: formValues.specialty,
          isActive: formValues.isActive
        });
        toast.success("Technicien mis à jour avec succès");
      }
      
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Erreur", { description: error.message });
      } else {
        toast.error("Une erreur s'est produite");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {formMode === 'add' ? 'Ajouter un prestataire' : 'Modifier le prestataire'}
          </DialogTitle>
          <DialogDescription>
            {formMode === 'add' 
              ? 'Créez un nouveau compte prestataire technique.'
              : 'Modifiez les informations du prestataire technique.'}
          </DialogDescription>
        </DialogHeader>
        
        <TechnicianForm
          formValues={formValues}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          formMode={formMode}
        />
      </DialogContent>
    </Dialog>
  );
};
