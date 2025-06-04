
import React from 'react';

interface AffaireFormProps {
  contactId: string;
  affaireId?: string;
  onClose: () => void;
}

export const AffaireForm: React.FC<AffaireFormProps> = ({ 
  contactId, 
  affaireId, 
  onClose 
}) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        {affaireId ? "Modifier l'affaire" : "Créer une nouvelle affaire"}
      </h3>
      <p>Contact ID: {contactId}</p>
      {affaireId && <p>Affaire ID: {affaireId}</p>}
      <button 
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Fermer
      </button>
    </div>
  );
};
