
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface UserPasswordSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRequired?: boolean;
}

export function UserPasswordSettingsDialog({ open, onOpenChange, isRequired = false }: UserPasswordSettingsDialogProps) {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ajouter un effet pour réinitialiser les champs quand la boîte de dialogue s'ouvre
  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [open]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifications basiques
    if (!password) {
      setError("Veuillez entrer un nouveau mot de passe");
      return;
    }
    
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      // Mettre à jour les métadonnées utilisateur pour indiquer que le mot de passe a été défini
      // et que l'utilisateur n'est plus en première connexion ou après réinitialisation
      await supabase.auth.updateUser({
        data: {
          first_login: false,
          password_reset_required: false,
          password_reset_at: new Date().toISOString()
        }
      });
      
      toast.success("Mot de passe mis à jour avec succès");
      setPassword("");
      setConfirmPassword("");
      
      // Fermer la boîte de dialogue si c'est facultatif,
      // mais maintenir ouverte si l'action est requise et qu'il y a eu une erreur
      if (!isRequired) {
        onOpenChange(false);
      } else {
        onOpenChange(false); // On ferme même si obligatoire car le mot de passe a été mis à jour
      }
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du mot de passe:", err);
      setError(err.message || "Une erreur est survenue lors de la mise à jour du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  const onCloseAttempt = (open: boolean) => {
    // Si l'action est obligatoire, empêcher la fermeture
    if (isRequired && open === false) {
      toast.warning("Vous devez définir un mot de passe pour continuer", {
        description: "Cette action est nécessaire pour sécuriser votre compte."
      });
      return;
    }
    
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={onCloseAttempt}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Définir un mot de passe</DialogTitle>
          <DialogDescription>
            {isRequired 
              ? "Pour des raisons de sécurité, vous devez définir un nouveau mot de passe pour continuer." 
              : "Vous pouvez modifier votre mot de passe ici."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Minimum 8 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Répétez le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <DialogFooter>
            {!isRequired && (
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
                Annuler
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Mise à jour..." : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
