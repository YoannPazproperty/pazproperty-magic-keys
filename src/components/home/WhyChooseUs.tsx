
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WhyChooseUs = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('why.title')}</h2>
            <p className="text-gray-600 mb-8">
              {t('why.subtitle')}
            </p>
            
            <FeatureList />
          </div>
          
          <ImageGrid />
        </div>
      </div>
    </section>
  );
};

const FeatureList = () => {
  const { t } = useLanguage();
  
  const features = [
    { titleKey: 'why.local', descKey: 'why.local.desc' },
    { titleKey: 'why.availability', descKey: 'why.availability.desc' },
    { titleKey: 'why.tech', descKey: 'why.tech.desc' },
    { titleKey: 'why.transparency', descKey: 'why.transparency.desc' }
  ];
  
  return (
    <div className="space-y-4">
      {features.map((feature, index) => (
        <Feature
          key={index}
          title={t(feature.titleKey)}
          description={t(feature.descKey)}
        />
      ))}
    </div>
  );
};

const Feature = ({ title, description }: { title: string; description: string }) => (
  <div className="flex items-start">
    <div className="mr-4 mt-1">
      <Check className="h-5 w-5" color="#ffb100" />
    </div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const ImageGrid = () => (
  <div className="grid grid-cols-2 gap-4">
    <div className="rounded-lg overflow-hidden shadow-md h-64">
      <img 
        src="/lovable-uploads/fed62806-8b0e-4a0c-975a-f2bf09cb04f2.png" 
        alt="Edificio moderno em Lisboa" 
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div className="rounded-lg overflow-hidden shadow-md h-64">
      <img 
        src="/lovable-uploads/cf3cf6fe-029e-4753-814c-8ed65cf25830.png" 
        alt="Fachada de azulejos portuguesa" 
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div className="rounded-lg overflow-hidden shadow-md h-64">
      <img 
        src="/lovable-uploads/15c3a624-ede3-49fa-ac79-da48ffd1da44.png" 
        alt="Hotel histórico em Lisboa" 
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div className="rounded-lg overflow-hidden shadow-md h-64">
      <img 
        src="/lovable-uploads/c73fd8db-f2c2-47a6-972c-cdcd2b79a21b.png" 
        alt="Fonte Rossio em Lisboa" 
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  </div>
);

export default WhyChooseUs;
