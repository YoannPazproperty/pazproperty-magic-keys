
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Wrench, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES, SERVICE_ANCHORS } from "@/constants/routes";

const ServicesOverview = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const services = [
    { 
      icon: Home, 
      titleKey: 'services.rental.title', 
      descKey: 'services.rental.description', 
      path: `${ROUTES.SERVICES}${SERVICE_ANCHORS.MANAGEMENT}` 
    },
    { 
      icon: Wrench, 
      titleKey: 'services.maintenance.title', 
      descKey: 'services.maintenance.description', 
      path: `${ROUTES.SERVICES}${SERVICE_ANCHORS.MAINTENANCE}` 
    },
    { 
      icon: Settings, 
      titleKey: 'services.consulting.title', 
      descKey: 'services.consulting.description', 
      path: `${ROUTES.SERVICES}${SERVICE_ANCHORS.CONSULTING}` 
    }
  ];

  const handleServiceNavigation = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const handleAllServicesNavigation = () => {
    navigate(ROUTES.SERVICES);
    window.scrollTo(0, 0);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('services.title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={<service.icon className="h-8 w-8" color="#ffb100" />}
              title={t(service.titleKey)}
              description={t(service.descKey)}
              onClick={() => handleServiceNavigation(service.path)}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleAllServicesNavigation}
          >
            {t('services.viewAll')}
          </Button>
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ 
  icon, 
  title, 
  description, 
  onClick 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4 mb-6">
        {icon}
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <button 
        onClick={onClick}
        className="text-[#ffb100] hover:text-[#ffa500] inline-flex items-center"
      >
        {t('services.learnMore')} <ArrowRight className="ml-2 h-4 w-4" color="#ffb100" />
      </button>
    </div>
  );
};

export default ServicesOverview;
