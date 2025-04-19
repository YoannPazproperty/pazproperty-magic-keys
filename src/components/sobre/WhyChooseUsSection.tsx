
import React from 'react';
import { Check } from 'lucide-react';

const WhyChooseUsSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
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
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Por Que Escolher a Pazproperty?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Na Pazproperty, combinamos conhecimento local com tecnologia de ponta para oferecer 
              uma gestão imobiliária sem complicações, permitindo que você aproveite os benefícios 
              do seu investimento sem as preocupações.
            </p>
            
            <div className="space-y-4">
              {[
                {
                  title: "Conhecimento Local Profundo",
                  description: "Nossa equipa conhece Lisboa em detalhe, incluindo as particularidades de cada bairro."
                },
                {
                  title: "Serviço Personalizado",
                  description: "Adaptamos os nossos serviços às necessidades específicas de cada proprietário."
                },
                {
                  title: "Tecnologia Avançada",
                  description: "Utilizamos as mais recentes tecnologias para otimizar a gestão e comunicação."
                },
                {
                  title: "Rede de Profissionais",
                  description: "Temos uma extensa rede de profissionais qualificados para qualquer necessidade."
                },
                {
                  title: "Disponibilidade 24/7",
                  description: "Estamos sempre disponíveis para resolver qualquer situação de emergência."
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="mr-4 mt-1">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
