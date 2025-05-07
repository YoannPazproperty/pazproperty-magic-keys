
import React from "react";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FormErrorProps {
  error: string | null;
}

export const FormError: React.FC<FormErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erreur</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};
