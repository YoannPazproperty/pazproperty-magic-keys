
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactInfo = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Informações de Contacto</h2>
      
      <div className="space-y-8">
        <div className="flex items-start">
          <div className="mt-1 mr-4 bg-primary/10 p-3 rounded-full">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Telefone</h3>
            <p className="text-gray-600">Alexa: +351 962 093 401</p>
            <p className="text-gray-600">Yoann: +33 6 09 95 12 84</p>
            <p className="text-gray-500 text-sm mt-1">Seg-Sex: 9:00 - 18:00</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mt-1 mr-4 bg-primary/10 p-3 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Email</h3>
            <p className="text-gray-600">yoann@pazproperty.pt</p>
            <p className="text-gray-500 text-sm mt-1">Respondemos em 24 horas</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mt-1 mr-4 bg-primary/10 p-3 rounded-full">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Morada</h3>
            <p className="text-gray-600">Rua Professor Sergio Pinto 224, 3°Dto</p>
            <p className="text-gray-600">2870-497 Montijo, Portugal</p>
            <p className="text-gray-500 text-sm mt-1">Seg-Sex: 9:00 - 18:00 (com marcação)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
