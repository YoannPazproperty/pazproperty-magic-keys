
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  createCompanyUser, 
  CompanyUserLevel, 
  isValidCompanyEmail,
  generateTemporaryPassword
} from "@/services/admin/companyUserService";

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
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    level: 'user' as CompanyUserLevel
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(true);
  
  // Générer un mot de passe temporaire si le champ est vide
  React.useEffect(() => {
    if (isOpen && !formValues.password) {
      setFormValues(prev => ({
        ...prev,
        password: generateTemporaryPassword()
      }));
    }
  }, [isOpen]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formValues.name.trim()) {
      newErrors.name = "Le nom est requis";
    }
    
    if (!formValues.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!isValidCompanyEmail(formValues.email)) {
      newErrors.email = "L'email doit être une adresse @pazproperty.pt";
    }
    
    if (!formValues.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formValues.password.length < 8) {
      newErrors.password = "Le mot de passe doit comporter au moins 8 caractères";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (field: string, value: string) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
    
    // Effacer l'erreur lorsque le champ est édité
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };
  
  const resetForm = () => {
    setFormValues({
      name: '',
      email: '',
      password: generateTemporaryPassword(),
      level: 'user'
    });
    setErrors({});
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
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
        toast.error("Erreur lors de la création", {
          description: result.message || "Une erreur est survenue"
        });
      }
    } catch (error: any) {
      console.error("Exception lors de la création de l'utilisateur:", error);
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
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              value={formValues.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nom complet"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formValues.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="prenom.nom@pazproperty.pt"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe temporaire</Label>
            <div className="flex">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formValues.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Mot de passe (min. 8 caractères)"
                className={`flex-grow ${errors.password ? "border-red-500" : ""}`}
              />
              <Button 
                type="button"
                variant="outline"
                className="ml-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Masquer" : "Afficher"}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Un mot de passe temporaire a été généré automatiquement. L'utilisateur pourra le changer après sa première connexion.
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="level">Niveau d'accès</Label>
            <Select 
              value={formValues.level} 
              onValueChange={(value) => handleChange('level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un niveau d'accès" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  Administrateur (peut créer d'autres utilisateurs)
                </SelectItem>
                <SelectItem value="user">
                  Utilisateur (accès en lecture seule)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Les administrateurs peuvent créer d'autres utilisateurs, les utilisateurs simples peuvent seulement consulter.
            </p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Création...
                </>
              ) : (
                'Créer l\'utilisateur'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
