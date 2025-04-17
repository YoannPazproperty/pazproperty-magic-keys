
import React from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
}

const SubmitButton = ({ isSubmitting }: SubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-brand-blue hover:bg-primary/90"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <span className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
          A enviar...
        </span>
      ) : (
        <span className="flex items-center">
          <Send className="mr-2 h-4 w-4" /> 
          Enviar Mensagem
        </span>
      )}
    </Button>
  );
};

export default SubmitButton;
