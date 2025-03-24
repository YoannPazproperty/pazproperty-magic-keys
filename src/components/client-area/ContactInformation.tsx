
import React from "react";

const ContactInformation: React.FC = () => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Informações de Contato</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Horário de Atendimento</h3>
            <p className="text-gray-600 mb-2">Segunda a Sexta: 9h às 18h</p>
            <p className="text-gray-600 mb-2">Sábado: 10h às 14h</p>
            <p className="text-gray-600">Domingos e Feriados: Emergências apenas</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Contatos de Emergência</h3>
            <p className="text-gray-600 mb-2">Telefone: +351 912 345 678</p>
            <p className="text-gray-600 mb-2">Email: emergencia@pazproperty.pt</p>
            <p className="text-gray-600">Fora do horário de expediente: +351 912 987 654</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;
