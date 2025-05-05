
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

interface ProviderFormAlertsProps {
  technicalError: string | null;
  emailError: { message: string, code: string } | null;
  inviteStatus: string | null;
  onDismissTechnicalError: () => void;
  onDismissEmailError: () => void;
}

export const ProviderFormAlerts: React.FC<ProviderFormAlertsProps> = ({
  technicalError,
  emailError,
  inviteStatus,
  onDismissTechnicalError,
  onDismissEmailError
}) => {
  return (
    <>
      {technicalError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro técnico</AlertTitle>
          <AlertDescription>
            <p>Ocorreu um erro ao enviar o convite:</p>
            <p className="text-sm mt-1 font-mono bg-secondary/50 p-2 rounded overflow-x-auto">
              {technicalError}
            </p>
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={onDismissTechnicalError}>Entendi</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {emailError && (
        <Alert variant="warning" className="mb-4">
          <AlertTitle>Aviso sobre o email</AlertTitle>
          <AlertDescription>
            <p>A conta foi criada ou atualizada com sucesso, mas não foi possível enviar o email.</p>
            <p className="text-sm text-muted-foreground mt-1">
              {emailError.message}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              URL de login: <code>/auth?provider=true</code>
            </p>
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={onDismissEmailError}>Entendi</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {inviteStatus && !emailError && !technicalError && (
        <Alert className="mb-4" variant="info">
          <Info className="h-4 w-4" />
          <AlertTitle>Status do convite</AlertTitle>
          <AlertDescription>{inviteStatus}</AlertDescription>
        </Alert>
      )}
    </>
  );
};
