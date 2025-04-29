
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const BusinessHours = () => {
  const { t } = useLanguage();
  
  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold mb-4">{t('contact.hours.title')}</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">{t('contact.hours.monday')}</span>
          <span className="text-gray-800">9:00 - 18:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('contact.hours.tuesday')}</span>
          <span className="text-gray-800">9:00 - 18:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('contact.hours.wednesday')}</span>
          <span className="text-gray-800">9:00 - 18:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('contact.hours.thursday')}</span>
          <span className="text-gray-800">9:00 - 18:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('contact.hours.friday')}</span>
          <span className="text-gray-800">9:00 - 18:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('contact.hours.saturday')}</span>
          <span className="text-gray-800">{t('contact.hours.closed')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('contact.hours.sunday')}</span>
          <span className="text-gray-800">{t('contact.hours.closed')}</span>
        </div>
      </div>
    </div>
  );
};

export default BusinessHours;
