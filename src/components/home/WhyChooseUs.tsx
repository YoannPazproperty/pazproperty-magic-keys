
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
        src="https://images.unsplash.com/photo-1567016526105-22da7c13f707?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80" 
        alt="Propriedade em Lisboa" 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="rounded-lg overflow-hidden shadow-md mt-8">
      <img 
        src="https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80" 
        alt="Interior moderno" 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="rounded-lg overflow-hidden shadow-md">
      <img 
        src="https://images.unsplash.com/photo-1597211833712-5e41faa202e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=863&q=80" 
        alt="Bairro lisboeta" 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="rounded-lg overflow-hidden shadow-md mt-8">
      <img 
        src="https://images.unsplash.com/photo-1537726235470-8504e3beef77?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80" 
        alt="Detalhe arquitetônico" 
        className="w-full h-full object-cover"
      />
    </div>
  </div>
);

export default WhyChooseUs;
