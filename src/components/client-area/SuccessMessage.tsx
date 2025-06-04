
import React from "react";
import { Button } from "../ui/button";
import { CheckCircle2 } from "lucide-react";

interface SuccessMessageProps {
  onNewDeclaration: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ onNewDeclaration }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-500 mr-3" />
        <h2 className="text-xl font-semibold text-green-700">Declaração Enviada com Sucesso!</h2>
      </div>
      <p className="text-green-700 mb-4">
        Obrigado por nos informar sobre o seu problema. Nossa equipe irá analisar sua solicitação e entrar em contato o mais rápido possível.
      </p>
      <Button 
        onClick={onNewDeclaration}
        className="bg-green-600 hover:bg-green-700"
      >
        Enviar Nova Declaração
      </Button>
    </div>
  );
};

export default SuccessMessage;
