
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80" 
                alt="Alexa Uzzan" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">Alexa Uzzan</h3>
              <p className="text-primary font-medium mb-4">Co-fundadora da PazProperty · Consultora imobiliária internacional</p>
              <p className="text-gray-600 text-justify">
                Francesa de origem, com um percurso internacional, trouxe para o mercado imobiliário português a minha paixão pelo serviço ao cliente, visão estratégica e atenção ao detalhe.
                Depois de experiências na hotelaria e no empreendedorismo, dedico-me hoje a acompanhar cada cliente com proximidade e total dedicação — seja para comprar, vender ou investir.
                Foi no contacto diário com proprietários que nasceu a PazProperty: uma solução de gestão pensada para quem quer rentabilizar os seus imóveis com tranquilidade.
                A PazProperty nasceu para simplificar a vida dos proprietários, com um serviço completo, transparente e humano.
                Trabalho com clientes de várias origens, em Lisboa e arredores, e estou sempre disponível para ajudar.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 overflow-hidden">
              <img 
                src="/lovable-uploads/fc706da8-2663-498a-8b87-e0644ba41709.png" 
                alt="Yoann Uzzan" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">Yoann Uzzan</h3>
              <p className="text-primary font-medium mb-4">Co-fundador da PazProperty · Especialista em inovação imobiliária</p>
              <p className="text-gray-600 text-justify">
                Com mais de 27 anos de experiência no setor imobiliário, acompanhei de perto a evolução tecnológica das agências e das ferramentas de gestão em França.
                Sou responsável pela transformação digital do maior grupo imobiliário francês, onde lidero a renovação completa do seu ecossistema tecnológico.
                Apaixonado por inovação e eficiência, decidi cofundar a PazProperty para aplicar esse know-how à gestão de imóveis em Lisboa — com processos claros, tecnologia inteligente e soluções à medida.
                Na PazProperty, contribuo com uma visão estratégica e uma abordagem orientada para resultados, sempre com foco no cliente.
                Domino o português, o francês e o inglês, e trabalho para que cada proprietário tenha total confiança na gestão do seu património.
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
