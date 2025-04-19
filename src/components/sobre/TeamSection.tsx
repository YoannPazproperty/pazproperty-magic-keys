import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TeamSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Nossa Equipa</h2>
          <p className="text-xl text-gray-600">
            Conheça os profissionais dedicados que tornam a PazProperty uma referência em gestão de arrendamentos em Lisboa — com proximidade, experiência e paixão pelo que fazem.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80" 
                alt="Ana Silva" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">Ana Silva</h3>
              <p className="text-primary font-medium mb-4">CEO & Fundadora</p>
              <p className="text-gray-600">
                Com mais de 15 anos de experiência no mercado imobiliário lisboeta, Ana fundou a 
                Pazproperty com a visão de revolucionar a gestão locativa na cidade.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                alt="Miguel Santos" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">Miguel Santos</h3>
              <p className="text-primary font-medium mb-4">Diretor de Operações</p>
              <p className="text-gray-600">
                Miguel coordena toda a equipa operacional, garantindo que cada propriedade 
                receba o nível de serviço excepcional que a Pazproperty promete.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                alt="Sofia Martins" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">Sofia Martins</h3>
              <p className="text-primary font-medium mb-4">Gestora de Clientes</p>
              <p className="text-gray-600">
                Sofia é o ponto de contacto principal para os nossos clientes, assegurando uma 
                comunicação clara e eficiente em todos os momentos.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Button asChild className="bg-brand-blue hover:bg-primary/90">
            <Link to="/contacto">Fale com a Nossa Equipa</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
