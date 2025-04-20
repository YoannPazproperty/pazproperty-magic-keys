
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/servicos/HeroSection";
import ServiceSection from "@/components/servicos/ServiceSection";
import ServiceGrid from "@/components/servicos/ServiceGrid";
import CTASection from "@/components/servicos/CTASection";
import { serviceData, gridServices } from "@/components/servicos/serviceData";

const Servicos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <HeroSection />
      
      {serviceData.map((service) => (
        <ServiceSection
          key={service.id}
          id={service.id}
          title={service.title}
          description={service.description}
          features={service.features}
          icon={service.icon}
          imageSrc={service.imageSrc}
          imageAlt={service.imageAlt}
          reverse={service.reverse}
        />
      ))}
      
      <ServiceGrid
        title="Todos os Nossos Serviços"
        description="Conheça a gama completa de serviços que oferecemos para garantir uma gestão imobiliária sem complicações."
        services={gridServices}
      />
      
      <CTASection
        title="Pronto para começar?"
        description="Entre em contacto connosco para discutir as suas necessidades e como podemos ajudar a maximizar o valor do seu imóvel em Lisboa."
        buttonText="Fale Connosco Hoje"
        buttonLink="/contacto"
      />
      
      <Footer />
    </div>
  );
};

export default Servicos;
