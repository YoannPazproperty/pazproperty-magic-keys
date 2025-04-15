
import React from "react";

const LocationMap = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Onde Estamos</h2>
        <div className="h-96 rounded-xl overflow-hidden shadow-lg">
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Mapa de Localização - Avenida da Liberdade, Lisboa</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;
