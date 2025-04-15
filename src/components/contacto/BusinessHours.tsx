
import React from "react";

const BusinessHours = () => {
  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold mb-4">Horário de Funcionamento</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Segunda-Feira</span>
          <span className="text-gray-800">9:00 - 18:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Terça-Feira</span>
          <span className="text-gray-800">9:00 - 18:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Quarta-Feira</span>
          <span className="text-gray-800">9:00 - 18:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Quinta-Feira</span>
          <span className="text-gray-800">9:00 - 18:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Sexta-Feira</span>
          <span className="text-gray-800">9:00 - 18:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Sábado</span>
          <span className="text-gray-800">Fechado</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Domingo</span>
          <span className="text-gray-800">Fechado</span>
        </div>
      </div>
    </div>
  );
};

export default BusinessHours;
