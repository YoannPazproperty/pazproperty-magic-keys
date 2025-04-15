
import React, { ReactNode } from "react";
import ServiceCard from "./ServiceCard";

interface ServiceGridItem {
  icon: ReactNode;
  title: string;
  description: string;
  linkTo: string;
  linkText: string;
}

interface ServiceGridProps {
  title: string;
  description: string;
  services: ServiceGridItem[];
}

const ServiceGrid = ({ title, description, services }: ServiceGridProps) => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              linkTo={service.linkTo}
              linkText={service.linkText}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceGrid;
