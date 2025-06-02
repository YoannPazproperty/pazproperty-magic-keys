import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createAffaire, getAffaireById, updateAffaire } from "@/services/affaires/affairesService";
import type { Affaire, AffaireFormData, StatutAffaire } from "@/services/types";
import { STATUTS_AFFAIRES } from "@/services/types";

interface AffaireFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contactId: string;
  affaireToEdit: Affaire | null;
}

export const AffaireFormDialog = ({ 
  isOpen,
  onClose,
  onSuccess,
  contactId,
  affaireToEdit
}: AffaireFormDialogProps) => {
  const isEditing = !!affaireToEdit;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AffaireFormData>({
    contact_id: contactId,
    client_nom: '',
    client_email: null,
    client_telephone: null,
    description: null,
    statut: 'Initial',
    honoraires_percus: null,
    remuneration_prevue: null,
    remuneration_payee: null,
    date_paiement: null,
    notes: null
  });
  
  useEffect(() => {
    const loadAffaireDetails = async () => {
      if (isEditing && affaireToEdit) {
        setFormData({
          contact_id: affaireToEdit.contact_id,
          client_nom: affaireToEdit.client_nom,
          client_email: affaireToEdit.client_email,
          client_telephone: affaireToEdit.client_telephone,
          description: affaireToEdit.description,
          statut: affaireToEdit.statut,
          honoraires_percus: affaireToEdit.honoraires_percus,
          remuneration_prevue: affaireToEdit.remuneration_prevue,
          remuneration_payee: affaireToEdit.remuneration_payee,
          date_paiement: affaireToEdit.date_paiement,
          notes: affaireToEdit.notes
        });
      } else {
        // Réinitialiser le formulaire pour une nouvelle affaire
        setFormData({
          contact_id: contactId,
          client_nom: '',
          client_email: null,
          client_telephone: null,
          description: null,
          statut: 'Initial',
          honoraires_percus: null,
          remuneration_prevue: null,
          remuneration_payee: null,
          date_paiement: null,
          notes: null
        });
      }
    };

    if (isOpen) {
      loadAffaireDetails();
    }
  }, [isOpen, isEditing, affaireToEdit, contactId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && affaireToEdit) {
        await updateAffaire(affaireToEdit.id, formData);
        toast.success("Affaire mise à jour avec succès");
      } else {
        await createAffaire(formData);
        toast.success("Nouvelle affaire créée avec succès");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting affaire form:", error);
      toast.error(isEditing ? "Erreur lors de la mise à jour" : "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof AffaireFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: keyof AffaireFormData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'affaire" : "Nouvelle affaire"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client_nom">Nom du client *</Label>
            <Input
              id="client_nom"
              value={formData.client_nom || ''}
              onChange={(e) => handleChange('client_nom', e.target.value)}
              placeholder="Nom complet du client"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_email">Email du client</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email || ''}
                onChange={(e) => handleChange('client_email', e.target.value || null)}
                placeholder="email@exemple.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_telephone">Téléphone du client</Label>
              <Input
                id="client_telephone"
                value={formData.client_telephone || ''}
                onChange={(e) => handleChange('client_telephone', e.target.value || null)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description de l'affaire</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value || null)}
              placeholder="Description du projet, besoins du client..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="statut">Statut</Label>
            <Select
              value={formData.statut}
              onValueChange={(value) => handleChange('statut', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {STATUTS_AFFAIRES.map((statut) => (
                  <SelectItem key={statut} value={statut}>
                    {statut}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="honoraires_percus">Honoraires perçus (€)</Label>
              <Input
                id="honoraires_percus"
                type="number"
                step="0.01"
                min="0"
                value={formData.honoraires_percus === null ? '' : formData.honoraires_percus}
                onChange={(e) => handleNumberChange('honoraires_percus', e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remuneration_prevue">Rémunération prévue (€)</Label>
              <Input
                id="remuneration_prevue"
                type="number"
                step="0.01"
                min="0"
                value={formData.remuneration_prevue === null ? '' : formData.remuneration_prevue}
                onChange={(e) => handleNumberChange('remuneration_prevue', e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remuneration_payee">Rémunération payée (€)</Label>
              <Input
                id="remuneration_payee"
                type="number"
                step="0.01"
                min="0"
                value={formData.remuneration_payee === null ? '' : formData.remuneration_payee}
                onChange={(e) => handleNumberChange('remuneration_payee', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date_paiement">Date de paiement</Label>
            <Input
              id="date_paiement"
              type="date"
              value={formData.date_paiement ? new Date(formData.date_paiement).toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('date_paiement', e.target.value ? new Date(e.target.value).toISOString() : null)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value || null)}
              placeholder="Notes supplémentaires..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};