
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UserPasswordSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserPasswordSettingsDialog({ open, onOpenChange }: UserPasswordSettingsDialogProps) {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(
    user?.user_metadata?.first_login === true
  );

  const validatePasswords = () => {
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswords()) return;
    
    setLoading(true);
    try {
      // Pour la première connexion, pas besoin de l'ancien mot de passe
      if (isFirstLogin) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
          data: { first_login: false }
        });
        
        if (error) throw error;
        
        toast.success("Mot de passe défini avec succès");
        // Fermer le dialogue après définition du mot de passe
        onOpenChange(false);
      } else {
        // Pour les mises à jour suivantes, vérifier d'abord l'ancien mot de passe
        if (!currentPassword) {
          setError("Veuillez saisir votre mot de passe actuel");
          setLoading(false);
          return;
        }
        
        // Vérification du mot de passe actuel
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email || "",
          password: currentPassword
        });
        
        if (signInError) {
          setError("Le mot de passe actuel est incorrect");
          setLoading(false);
          return;
        }
        
        // Mise à jour du mot de passe
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) throw error;
        
        toast.success("Mot de passe mis à jour avec succès");
        onOpenChange(false);
      }
      
      // Réinitialiser les champs
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du mot de passe:", err);
      setError(err.message || "Une erreur est survenue lors de la mise à jour du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  const userEmail = user?.email || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isFirstLogin ? "Définir votre mot de passe" : "Modifier votre mot de passe"}
          </DialogTitle>
          <DialogDescription>
            {isFirstLogin 
              ? "Veuillez définir un mot de passe pour pouvoir vous connecter ultérieurement à l'extranet technique." 
              : "Modifiez votre mot de passe pour sécuriser votre compte."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2 px-1 text-sm">
            <span className="font-semibold">Email:</span> {userEmail}
          </div>

          {!isFirstLogin && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-password" className="text-right">
                Mot de passe actuel
              </Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Entrez votre mot de passe actuel"
                className="col-span-3"
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-password" className="text-right">
              Nouveau mot de passe
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Au moins 8 caractères"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirm-password" className="text-right">
              Confirmer
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répétez le nouveau mot de passe"
              className="col-span-3"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {!isFirstLogin && (
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
          )}
          <Button 
            onClick={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
