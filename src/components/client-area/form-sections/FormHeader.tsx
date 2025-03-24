
import React from "react";
import { AlertCircle } from "lucide-react";

const FormHeader = () => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Formulário de Declaração de Ocorrência</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-700">Importante</h3>
            <p className="text-blue-700 text-sm">
              Para emergências que exigem atenão imediata (como vazamentos graves ou falta de energia), 
              por favor ligue para +351 912 345 678 além de preencher este formulário.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormHeader;
