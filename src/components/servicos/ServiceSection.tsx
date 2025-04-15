
import React, { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ServiceFeature {
  text: string;
}

interface ServiceSectionProps {
  id: string;
  title: string;
  description: string;
  features: ServiceFeature[];
  icon: ReactNode;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

const ServiceSection = ({
  id,
  title,
  description,
  features,
  icon,
  imageSrc,
  imageAlt,
  reverse = false
}: ServiceSectionProps) => {
  return (
    <section className={`py-20 ${reverse ? 'bg-gray-50' : ''}`} id={id}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={`${reverse ? 'order-2 lg:order-1' : ''}`}>
            {!reverse && (
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                {icon}
              </div>
            )}
            <div className={`rounded-xl overflow-hidden shadow-xl ${!reverse ? 'hidden' : ''}`}>
              <img 
                src={imageSrc} 
                alt={imageAlt} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className={`${reverse ? 'order-1 lg:order-2' : ''}`}>
            {reverse && (
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                {icon}
              </div>
            )}
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
            <p className="text-lg text-gray-600 mb-6">
              {description}
            </p>
            
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">{feature.text}</p>
                </div>
              ))}
            </div>
            
            <Button asChild className="bg-brand-blue hover:bg-primary/90">
              <Link to="/contacto">Solicitar Orçamento</Link>
            </Button>
            
            <div className={`rounded-xl overflow-hidden shadow-xl mt-6 lg:mt-0 ${reverse ? 'hidden' : ''} lg:hidden`}>
              <img 
                src={imageSrc} 
                alt={imageAlt} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {!reverse && (
            <div className="rounded-xl overflow-hidden shadow-xl hidden lg:block">
              <img 
                src={imageSrc} 
                alt={imageAlt} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
