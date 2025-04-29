
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ContactInfo = () => {
  const { t } = useLanguage();
  
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">{t('contact.info.title')}</h2>
      
      <div className="space-y-8">
        <div className="flex items-start">
          <div className="mt-1 mr-4">
            <Phone className="h-6 w-6 text-[#ffb100]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{t('contact.phone')}</h3>
            <p className="text-gray-600">Alexa: +351 962 093 401</p>
            <p className="text-gray-600">Yoann: +33 6 09 95 12 84</p>
            <p className="text-gray-500 text-sm mt-1">{t('contact.phone.hours')}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mt-1 mr-4">
            <Mail className="h-6 w-6 text-[#ffb100]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{t('contact.email')}</h3>
            <p className="text-gray-600">yoann@pazproperty.pt</p>
            <p className="text-gray-500 text-sm mt-1">{t('contact.email.response')}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mt-1 mr-4">
            <MapPin className="h-6 w-6 text-[#ffb100]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{t('contact.address')}</h3>
            <p className="text-gray-600">Rua Professor Sergio Pinto 224, 3°Dto</p>
            <p className="text-gray-600">2870-497 Montijo, Portugal</p>
            <p className="text-gray-500 text-sm mt-1">{t('contact.address.hours')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
