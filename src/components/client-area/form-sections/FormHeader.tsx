
import React from "react";

const FormHeader = () => {
  // Remplaçons le contenu par quelque chose de plus générique pour la présentation de services
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Nos Services</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div>
            <h3 className="font-semibold text-blue-700">Pazproperty</h3>
            <p className="text-blue-700 text-sm">
              Découvrez notre gamme complète de services immobiliers pour les propriétaires et investisseurs à Lisbonne.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormHeader;
