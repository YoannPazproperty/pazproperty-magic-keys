
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyUserLevel } from "@/services/admin/company-users";

interface NameFieldProps {
  name: string;
  onChange: (value: string) => void;
  error?: string;
}

export const NameField: React.FC<NameFieldProps> = ({ name, onChange, error }) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="name">Nom complet</Label>
      <Input
        id="name"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nom complet"
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

interface EmailFieldProps {
  email: string;
  onChange: (value: string) => void;
  error?: string;
}

export const EmailField: React.FC<EmailFieldProps> = ({ email, onChange, error }) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        placeholder="prenom.nom@pazproperty.pt"
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

interface PasswordFieldProps {
  password: string;
  onChange: (value: string) => void;
  error?: string;
  showPassword: boolean;
  toggleShowPassword: () => void;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ 
  password, 
  onChange, 
  error, 
  showPassword, 
  toggleShowPassword 
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="password">Mot de passe temporaire</Label>
      <div className="flex">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Mot de passe (min. 8 caractères)"
          className={`flex-grow ${error ? "border-red-500" : ""}`}
        />
        <Button 
          type="button"
          variant="outline"
          className="ml-2"
          onClick={toggleShowPassword}
        >
          {showPassword ? "Masquer" : "Afficher"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-gray-500 mt-1">
        Un mot de passe temporaire a été généré automatiquement. L'utilisateur pourra le changer après sa première connexion.
      </p>
    </div>
  );
};

interface AccessLevelFieldProps {
  level: CompanyUserLevel;
  onChange: (value: CompanyUserLevel) => void;
}

export const AccessLevelField: React.FC<AccessLevelFieldProps> = ({ level, onChange }) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="level">Niveau d'accès</Label>
      <Select 
        value={level} 
        onValueChange={(value) => onChange(value as CompanyUserLevel)}
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
  );
};

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({ onCancel, isSubmitting }) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
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
  );
};
