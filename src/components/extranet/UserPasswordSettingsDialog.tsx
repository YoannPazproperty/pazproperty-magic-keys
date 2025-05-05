
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserPasswordSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRequired?: boolean;
  onPasswordChangeSuccess?: () => void;
}

export function UserPasswordSettingsDialog({
  open,
  onOpenChange,
  isRequired = false,
  onPasswordChangeSuccess
}: UserPasswordSettingsDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);

    try {
      // Log the current session user email for debugging
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData.session?.user?.email;
      console.log("Atualizando senha para o usuário:", userEmail);

      // Update password in Supabase
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error("Erro ao atualizar senha:", error);
        setError(error.message || "Erro ao atualizar a senha");
        return;
      }

      console.log("Resposta da atualização de senha:", data);
      
      // Explicitly update user metadata to ensure password_reset_required is false
      const metadataUpdateResult = await supabase.auth.updateUser({
        data: {
          first_login: false,
          password_reset_required: false,
          password_reset_at: new Date().toISOString()
        }
      });

      console.log("Resultado da atualização de metadados:", metadataUpdateResult);

      if (metadataUpdateResult.error) {
        console.error("Erro ao atualizar metadados:", metadataUpdateResult.error);
        // Continue anyway since password was changed successfully
      }

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Call success callback if provided
      if (onPasswordChangeSuccess) {
        await onPasswordChangeSuccess();
      }

      toast.success("Senha alterada com sucesso");
      
      // Close dialog only if not required
      if (!isRequired) {
        onOpenChange(false);
      }
    } catch (err: any) {
      console.error("Erro inesperado ao atualizar senha:", err);
      setError(err.message || "Ocorreu um erro ao atualizar a senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isRequired ? "Alteração de senha obrigatória" : "Alterar senha"}
            </DialogTitle>
            <DialogDescription>
              {isRequired 
                ? "Por motivos de segurança, você deve alterar sua senha para continuar."
                : "Atualize sua senha para garantir a segurança da sua conta."}
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            {!isRequired && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current-password" className="text-right">
                  Senha atual
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="col-span-3"
                  autoComplete="current-password"
                />
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password" className="text-right">
                Nova senha
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="col-span-3"
                autoComplete="new-password"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirm-password" className="text-right">
                Confirmar senha
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="col-span-3"
                autoComplete="new-password"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            {!isRequired && (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
