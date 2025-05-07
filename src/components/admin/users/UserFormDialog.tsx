
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createCompanyUser } from "@/services/admin/company-users";
import { useUserFormState } from "./form/useUserFormState";
import { FormError } from "./form/FormError";
import { NameField, EmailField, PasswordField, AccessLevelField, FormActions } from "./form/FormFields";
import { CompanyUserLevel } from "@/services/admin/company-users";

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
  const {
    formValues,
    isSubmitting,
    errors,
    apiError,
    showPassword,
    setShowPassword,
    setIsSubmitting,
    setApiError,
    handleChange,
    resetForm,
    validate
  } = useUserFormState(isOpen);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    setApiError(null);
    
    try {
      toast.info("Création du compte utilisateur en cours...");
      
      const result = await createCompanyUser({
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        level: formValues.level as CompanyUserLevel
      });
      
      if (result.success) {
        toast.success("Utilisateur créé avec succès", {
          description: `Un compte a été créé pour ${formValues.email}`
        });
        
        if (result.emailSent) {
          toast.success("Email d'invitation envoyé", {
            description: "L'utilisateur a reçu ses identifiants de connexion par email"
          });
        } else if (result.error) {
          toast.warning("Compte créé mais erreur d'envoi d'email", {
            description: "L'utilisateur a bien été créé mais n'a pas reçu l'email d'invitation"
          });
        }
        
        resetForm();
        onSuccess();
      } else {
        // Si l'erreur concerne un utilisateur déjà existant, l'afficher de manière spécifique
        if (result.error && (
            result.error.includes("already registered") || 
            result.error.includes("already exists")
        )) {
          setApiError("Cet email est déjà utilisé par un compte existant");
          toast.error("Email déjà utilisé", {
            description: "Un utilisateur avec cette adresse email existe déjà"
          });
        } else {
          setApiError(result.message || "Une erreur est survenue lors de la création du compte");
          toast.error("Erreur lors de la création", {
            description: result.message || "Une erreur est survenue"
          });
        }
      }
    } catch (error: any) {
      console.error("Exception lors de la création de l'utilisateur:", error);
      setApiError(error.message || "Une erreur inattendue est survenue");
      toast.error("Une erreur inattendue est survenue", {
        description: error.message || "Veuillez réessayer"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel employé</DialogTitle>
          <DialogDescription>
            Créez un nouveau compte avec accès à l'interface d'administration.
            <strong className="block mt-2 text-amber-600">
              Uniquement pour les adresses @pazproperty.pt
            </strong>
          </DialogDescription>
        </DialogHeader>
        
        <FormError error={apiError} />
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <NameField 
            name={formValues.name} 
            onChange={(value) => handleChange('name', value)} 
            error={errors.name}
          />
          
          <EmailField 
            email={formValues.email} 
            onChange={(value) => handleChange('email', value)} 
            error={errors.email}
          />
          
          <PasswordField 
            password={formValues.password} 
            onChange={(value) => handleChange('password', value)} 
            error={errors.password}
            showPassword={showPassword}
            toggleShowPassword={() => setShowPassword(!showPassword)}
          />
          
          <AccessLevelField 
            level={formValues.level} 
            onChange={(value) => handleChange('level', value)}
          />
          
          <FormActions 
            onCancel={onClose} 
            isSubmitting={isSubmitting} 
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
