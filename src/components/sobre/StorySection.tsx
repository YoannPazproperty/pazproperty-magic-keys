
import React from 'react';

const StorySection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">A Nossa História</h2>
            <p className="text-lg text-gray-600 mb-6 text-justify">
              A PazProperty nasceu de uma paixão: a paixão por Lisboa — pelos seus bairros cheios de vida, 
              pelos edifícios com história e pelo potencial de cada imóvel escondido entre o Tejo e as colinas.
            </p>
            <p className="text-lg text-gray-600 mb-6 text-justify">
              Ao viver entre Portugal e o estrangeiro, percebemos uma realidade partilhada por muitos — 
              não só investidores internacionais, mas também muitos portugueses: proprietários que valorizam 
              os seus imóveis, mas que não querem — ou não podem — lidar com a gestão do dia a dia.
            </p>
            <p className="text-lg text-gray-600 mb-6 text-justify">
              Foi com isso em mente que fundámos a PazProperty, em 2023. Mais do que uma empresa de gestão 
              de arrendamentos, somos um parceiro de confiança. Cuidamos de cada propriedade como se fosse 
              nossa — com proximidade, rigor e dedicação.
            </p>
            <p className="text-lg text-gray-600 mb-6 text-justify">
              Combinamos tecnologia inteligente, processos transparentes e um atendimento humano, próximo 
              e disponível. A nossa equipa é formada por profissionais experientes, apaixonados pelo setor 
              imobiliário e por resolver problemas antes que eles aconteçam.
            </p>
            <p className="text-lg text-gray-600 text-justify">
              Hoje, a PazProperty é mais do que um nome — é uma promessa:
              a de transformar imóveis em rendimento, e preocupações em paz.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-xl">
            <img 
              src="/lovable-uploads/c402d587-5321-456e-a8f4-ab4ba600d11e.png" 
              alt="Vista do Tejo com barcos e a Ponte 25 de Abril" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
