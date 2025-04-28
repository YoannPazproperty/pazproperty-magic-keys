
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const WhyChooseUs = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Por Que Escolher a Pazproperty?</h2>
            <p className="text-gray-600 mb-8">
              Com anos de experiência no mercado imobiliário lisboeta, oferecemos um serviço completo e personalizado para proprietários que valorizam tranquilidade, eficiência e confiança.
            </p>
            
            <FeatureList />
          </div>
          
          <ImageGrid />
        </div>
      </div>
    </section>
  );
};

const FeatureList = () => (
  <div className="space-y-4">
    <Feature
      title="Equipa Local"
      description="Conhecemos Lisboa como a palma da nossa mão."
    />
    <Feature
      title="Disponibilidade 24/7"
      description="Sempre prontos para responder a qualquer emergência."
    />
    <Feature
      title="Tecnologia Avançada"
      description="Sistema de gestão online para acompanhar tudo em tempo real."
    />
    <Feature
      title="Transparência Total"
      description="Relatórios detalhados e comunicação constante."
    />
  </div>
);

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
    <div className="rounded-lg overflow-hidden shadow-md">
      <img 
        src="/lovable-uploads/8eadb346-8ff0-4a3c-9719-32549b26cbfa.png" 
        alt="Edificio moderno em Lisboa" 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="rounded-lg overflow-hidden shadow-md mt-8">
      <img 
        src="/lovable-uploads/cf3cf6fe-029e-4753-814c-8ed65cf25830.png" 
        alt="Fachada de azulejos portuguesa" 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="rounded-lg overflow-hidden shadow-md">
      <img 
        src="/lovable-uploads/15c3a624-ede3-49fa-ac79-da48ffd1da44.png" 
        alt="Hotel histórico em Lisboa" 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="rounded-lg overflow-hidden shadow-md mt-8">
      <img 
        src="/lovable-uploads/c73fd8db-f2c2-47a6-972c-cdcd2b79a21b.png" 
        alt="Fonte Rossio em Lisboa" 
        className="w-full h-full object-cover"
      />
    </div>
  </div>
);

export default WhyChooseUs;
