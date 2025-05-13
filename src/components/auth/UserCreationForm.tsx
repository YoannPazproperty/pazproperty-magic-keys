
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  UserCreationContext,
  UserCreationData,
  determineUserRole
} from "@/services/auth/userCreationService";
import { useUserCreation } from "@/hooks/auth/useUserCreation";
import { generateTemporaryPassword } from "@/services/admin/company-users";
import { UserRole } from "@/hooks/auth/types";

interface UserCreationFormProps {
  context: UserCreationContext;
  onSuccess?: (userData: { userId: string, email: string }) => void;
  onCancel?: () => void;
  showRoleSelector?: boolean;
  allowedRoles?: UserRole[];
  additionalMetadata?: Record<string, any>;
}

export const UserCreationForm: React.FC<UserCreationFormProps> = ({
  context,
  onSuccess,
  onCancel,
  showRoleSelector = false,
  allowedRoles = ['admin', 'user', 'provider', 'customer'],
  additionalMetadata = {}
}) => {
  const { createUser, isCreating, error, clearError } = useUserCreation(context);
  
  const [formValues, setFormValues] = useState<{
    name: string;
    email: string;
    password: string;
    company: string;
    selectedRole?: UserRole;
  }>({
    name: '',
    email: '',
    password: generateTemporaryPassword(),
    company: '',
    selectedRole: undefined
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(true);
  
  // Effet pour mettre à jour le rôle sélectionné en fonction du contexte
  useEffect(() => {
    if (context === 'employee_creation') {
      setFormValues(prev => ({
        ...prev,
        selectedRole: 'user'
      }));
    } else if (context === 'prestadores_creation') {
      setFormValues(prev => ({
        ...prev,
        selectedRole: 'provider'
      }));
    } else {
      const defaultRole = determineUserRole(context);
      setFormValues(prev => ({
        ...prev,
        selectedRole: defaultRole
      }));
    }
  }, [context]);
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formValues.email) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = "Veuillez saisir une adresse email valide";
    }
    
    if (!formValues.password || formValues.password.length < 8) {
      errors.password = "Le mot de passe doit comporter au moins 8 caractères";
    }
    
    // Si on est dans le contexte de création d'employé ou prestataire, le nom est requis
    if ((context === 'employee_creation' || context === 'prestadores_creation') && !formValues.name) {
      errors.name = "Le nom est requis";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (field: string, value: any) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
    
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: ''
      });
    }
    
    clearError();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const userData: UserCreationData = {
      email: formValues.email,
      password: formValues.password,
      name: formValues.name,
      company: formValues.company,
      selectedRole: formValues.selectedRole,
      additionalMetadata
    };
    
    const result = await createUser(userData);
    
    if (result.success && result.userId && onSuccess) {
      onSuccess({ userId: result.userId, email: formValues.email });
    }
  };
  
  // Obtenir le texte du titre en fonction du contexte
  const getTitleByContext = (ctx: UserCreationContext) => {
    switch (ctx) {
      case 'employee_creation':
        return "Créer un employé";
      case 'prestadores_creation':
        return "Créer un prestataire";
      case 'crm_creation':
        return "Créer un partenaire d'affaires";
      case 'customer_creation':
        return "Créer un client";
      case 'claim_submission':
        return "Enregistrer un nouveau client";
      default:
        return "Créer un utilisateur";
    }
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{getTitleByContext(context)}</CardTitle>
        <CardDescription>
          {context === 'employee_creation' && "Créez un compte pour un employé PazProperty"}
          {context === 'prestadores_creation' && "Créez un compte pour un prestataire de services"}
          {context === 'crm_creation' && "Créez un compte pour un apporteur d'affaires"}
          {context === 'customer_creation' && "Créez un compte pour un client"}
          {context === 'claim_submission' && "Enregistrement automatique lors d'une déclaration"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              value={formValues.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nom et prénom"
              className={formErrors.name ? "border-red-500" : ""}
            />
            {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formValues.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="exemple@domaine.com"
              className={formErrors.email ? "border-red-500" : ""}
            />
            {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
          </div>
          
          {(context === 'prestadores_creation' || context === 'crm_creation') && (
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise / Organisation</Label>
              <Input
                id="company"
                value={formValues.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Nom de l'entreprise"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe temporaire</Label>
            <div className="flex space-x-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formValues.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Mot de passe temporaire"
                className={formErrors.password ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Masquer" : "Afficher"}
              </Button>
            </div>
            {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
            <p className="text-xs text-gray-500">
              Un mot de passe temporaire a été généré automatiquement.
              L'utilisateur pourra le modifier après sa première connexion.
            </p>
          </div>
          
          {showRoleSelector && context === 'employee_creation' && (
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={formValues.selectedRole}
                onValueChange={(value) => handleChange('selectedRole', value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {allowedRoles.includes('admin') && (
                    <SelectItem value="admin">Administrateur</SelectItem>
                  )}
                  {allowedRoles.includes('user') && (
                    <SelectItem value="user">Utilisateur standard</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Les administrateurs peuvent gérer tous les aspects de l'application.
                Les utilisateurs standard ont un accès limité.
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            )}
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Création...
                </>
              ) : (
                "Créer l'utilisateur"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
