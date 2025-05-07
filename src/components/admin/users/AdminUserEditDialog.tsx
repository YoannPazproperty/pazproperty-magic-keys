import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { 
  updateCompanyUser, 
  CompanyUserLevel,
  isValidCompanyEmail,
  CompanyUser
} from "@/services/admin/company-users";

interface AdminUserEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: CompanyUser | null;
}

export const AdminUserEditDialog: React.FC<AdminUserEditDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  user 
}) => {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    level: 'user' as CompanyUserLevel
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Charger les données de l'utilisateur dans le formulaire
  useEffect(() => {
    if (isOpen && user) {
      setFormValues({
        name: user.name,
        email: user.email,
        level: user.level as CompanyUserLevel
      });
      
      // Réinitialiser les erreurs
      setErrors({});
      setApiError(null);
    }
  }, [isOpen, user]);
  
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
    
    // Effacer l'erreur API si on modifie l'email (car c'est souvent lié à un email existant)
    if (field === 'email' && apiError) {
      setApiError(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }
    
    setIsSubmitting(true);
    setApiError(null);
    
    try {
      toast.info("Mise à jour du compte utilisateur en cours...");
      
      const result = await updateCompanyUser({
        userId: user.user_id,
        name: formValues.name,
        email: formValues.email,
        level: formValues.level as CompanyUserLevel
      });
      
      if (result.success) {
        toast.success("Utilisateur mis à jour avec succès", {
          description: `Les informations de ${formValues.email} ont été mises à jour`
        });
        
        onSuccess();
      } else {
        // Si l'erreur concerne un utilisateur déjà existant, l'afficher de manière spécifique
        if (result.error && (
            result.error.includes("already registered") || 
            result.error.includes("already exists")
        )) {
          setApiError("Cet email est déjà utilisé par un autre compte");
          toast.error("Email déjà utilisé", {
            description: "Un utilisateur avec cette adresse email existe déjà"
          });
        } else {
          setApiError(result.message || "Une erreur est survenue lors de la mise à jour du compte");
          toast.error("Erreur lors de la mise à jour", {
            description: result.message || "Une erreur est survenue"
          });
        }
      }
    } catch (error: any) {
      console.error("Exception lors de la mise à jour de l'utilisateur:", error);
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
          <DialogTitle>Modifier un employé</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'employé.
          </DialogDescription>
        </DialogHeader>
        
        {apiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        
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
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
