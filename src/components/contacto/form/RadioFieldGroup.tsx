
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface RadioFieldGroupProps {
  value: string;
  onChange: (value: string) => void;
}

const RadioFieldGroup: React.FC<RadioFieldGroupProps> = ({ value, onChange }) => {
  const { t } = useLanguage();
  
  return (
    <div>
      <p className="mb-2 font-medium">Tipo de utilizador:</p>
      
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <input
            type="radio"
            id="proprietario"
            name="tipo"
            value="proprietario"
            checked={value === "proprietario"}
            onChange={() => onChange("proprietario")}
            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
          />
          <label htmlFor="proprietario" className="ml-2 text-gray-700">
            {t('contact.form.type.owner')}
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="radio"
            id="inquilino"
            name="tipo"
            value="inquilino"
            checked={value === "inquilino"}
            onChange={() => onChange("inquilino")}
            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
          />
          <label htmlFor="inquilino" className="ml-2 text-gray-700">
            {t('contact.form.type.tenant')}
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="radio"
            id="prospecto"
            name="tipo"
            value="prospecto"
            checked={value === "prospecto"}
            onChange={() => onChange("prospecto")}
            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
          />
          <label htmlFor="prospecto" className="ml-2 text-gray-700">
            {t('contact.form.type.prospect')}
          </label>
        </div>
      </div>
    </div>
  );
};

export default RadioFieldGroup;
