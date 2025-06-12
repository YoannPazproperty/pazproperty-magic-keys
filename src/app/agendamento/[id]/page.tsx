import AgendamentoForm from "@/components/agendamento/AgendamentoForm";
import React from "react";

type AgendamentoPageProps = {
  params: {
    id: string;
  };
};

const AgendamentoPage = ({ params }: AgendamentoPageProps) => {
  const { id } = params;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Agendamento de Intervenção
      </h1>
      <AgendamentoForm declarationId={id} />
    </div>
  );
};

export default AgendamentoPage; 