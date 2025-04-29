
import React from 'react';
import ServiceCard from './ServiceCard';
import { ServiceCardProps } from './types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ServiceGridProps {
  title: string;
  description: string;
  services: ServiceCardProps[];
}

const ServiceGrid = ({ title, description, services }: ServiceGridProps) => {
  const { t } = useLanguage();
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">{title || t('services.grid.title')}</h2>
          <p className="text-lg text-gray-600">
            {description || t('services.grid.description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceGrid;
