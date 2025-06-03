import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface NewActionFormProps {
  onSubmit: (action: string, notes: string | null) => Promise<void>;
}

const ACTION_TYPES: string[] = [
  "Contact initial",
  "Relance téléphonique",
  "Proposition envoyée",
  "Négociation",
  "Contrat signé",
  "Paiement reçu",
  "Clôture de l'affaire",
  "Autre"
];

export const NewActionForm = ({ onSubmit }: NewActionFormProps) => {
  const [action, setAction] = useState<string>(ACTION_TYPES[0]);
  const [customAction, setCustomAction] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalAction = action === "Autre" ? customAction.trim() : action;
    if (!finalAction) {
      toast.error("Veuillez spécifier un type d'action");
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(finalAction, notes.trim() || null);
      toast.success("Action ajoutée avec succès");
      // Réinitialiser
      if (action === "Autre") setCustomAction("");
      setNotes("");
    } catch (error) {
      console.error("Error submitting action:", error);
      toast.error("Erreur lors de l'ajout de l'action");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle>Ajouter une nouvelle action</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action">Type d'action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type d'action" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {action === "Autre" && (
            <div className="space-y-2">
              <Label htmlFor="customAction">Action personnalisée</Label>
              <Input
                id="customAction"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                placeholder="Saisir l'action réalisée"
                required={action === "Autre"}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes détaillées</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails de l'action, résultats, prochaines étapes..."
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer l'action"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};