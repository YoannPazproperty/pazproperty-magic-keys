
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { TechnicianFormValues } from './types';

interface TechnicianFormProps {
  formValues: TechnicianFormValues;
  onChange: (field: keyof TechnicianFormValues, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  formMode: 'add' | 'edit';
}

export const TechnicianForm: React.FC<TechnicianFormProps> = ({
  formValues,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  formMode
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            value={formValues.name}
            onChange={(e) => onChange('name', e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formValues.email}
            onChange={(e) => onChange('email', e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="text"
            value={formValues.password}
            onChange={(e) => onChange('password', e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            value={formValues.phone}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="specialty">Spécialité</Label>
          <Select 
            value={formValues.specialty} 
            onValueChange={(value) => onChange('specialty', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une spécialité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plomberie">Plomberie</SelectItem>
              <SelectItem value="électricité">Électricité</SelectItem>
              <SelectItem value="chauffage">Chauffage</SelectItem>
              <SelectItem value="serrurerie">Serrurerie</SelectItem>
              <SelectItem value="menuiserie">Menuiserie</SelectItem>
              <SelectItem value="peinture">Peinture</SelectItem>
              <SelectItem value="maçonnerie">Maçonnerie</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={formValues.isActive}
            onCheckedChange={(checked) => onChange('isActive', checked)}
            id="active-status"
          />
          <Label htmlFor="active-status">Compte actif</Label>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              {formMode === 'add' ? 'Ajout...' : 'Enregistrement...'}
            </>
          ) : (
            formMode === 'add' ? 'Ajouter' : 'Enregistrer'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};
