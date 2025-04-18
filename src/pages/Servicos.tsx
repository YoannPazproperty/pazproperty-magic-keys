import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, Wrench, ClipboardCheck, Settings, Search, Shield } from "lucide-react";
import HeroSection from "@/components/servicos/HeroSection";
import ServiceSection from "@/components/servicos/ServiceSection";
import ServiceGrid from "@/components/servicos/ServiceGrid";
import CTASection from "@/components/servicos/CTASection";

const Servicos = () => {
  // Données pour les sections de service
  const serviceData = [
    {
      id: "gestao",
      title: "Gestão de Arrendamentos",
      description: "Nossa gestão de arrendamentos cobre todos os aspectos do arrendamento do seu imóvel, garantindo que você receba o máximo retorno com o mínimo de preocupações.",
      features: [
        { text: "Promoção do imóvel nos principais portais e redes sociais" },
        { text: "Seleção rigorosa de inquilinos com verificação de referências" },
        { text: "Preparação e gestão de contratos de arrendamento" },
        { text: "Cobrança de rendas e gestão de pagamentos" },
        { text: "Inspeções regulares ao imóvel" },
        { text: "Relatórios financeiros mensais detalhados" }
      ],
      icon: <Home className="h-10 w-10 text-primary" />,
      imageSrc: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1296&q=80",
      imageAlt: "Gestão locativa em Lisboa",
      reverse: false
    },
    {
      id: "manutencao",
      title: "Manutenção",
      description: "Nossa equipa de profissionais qualificados está pronta para garantir que o seu imóvel esteja sempre em perfeitas condições, resolvendo problemas rapidamente.",
      features: [
        { text: "Serviços de emergência 24/7" },
        { text: "Manutenção preventiva e inspeções regulares" },
        { text: "Reparações gerais (canalização, eletricidade, etc.)" },
        { text: "Renovações e melhorias" },
        { text: "Serviços de limpeza profissional" },
        { text: "Coordenação com técnicos e fornecedores" }
      ],
      icon: <Wrench className="h-10 w-10 text-primary" />,
      imageSrc: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      imageAlt: "Manutenção de imóveis",
      reverse: true
    },
    {
      id: "limpeza",
      title: "Serviços de Limpeza",
      description: "Oferecemos serviços de limpeza profissional para garantir que o seu imóvel esteja sempre impecável, seja para novos inquilinos ou para manutenção regular.",
      features: [
        { text: "Limpeza profunda entre inquilinos" },
        { text: "Limpeza regular agendada" },
        { text: "Limpeza de vidros e fachadas" },
        { text: "Limpeza de áreas comuns em prédios" },
        { text: "Produtos ecológicos e hipoalergénicos" }
      ],
      icon: <ClipboardCheck className="h-10 w-10 text-primary" />,
      imageSrc: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      imageAlt: "Serviços de limpeza",
      reverse: false
    },
    {
      id: "consultoria",
      title: "Consultoria",
      description: "Nossos especialistas oferecem consultoria personalizada para ajudá-lo a tomar as melhores decisões sobre o seu património imobiliário em Lisboa.",
      features: [
        { text: "Análise de mercado e avaliação de propriedades" },
        { text: "Estratégias de otimização de rendimento" },
        { text: "Aconselhamento sobre investimentos imobiliários" },
        { text: "Orientação sobre regulamentos e legislação" },
        { text: "Planeamento fiscal para proprietários" }
      ],
      icon: <Settings className="h-10 w-10 text-primary" />,
      imageSrc: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
      imageAlt: "Consultoria imobiliária",
      reverse: true
    }
  ];

  // Données pour la grille de services
  const gridServices = [
    {
      icon: <Home className="h-8 w-8 text-primary mb-4" />,
      title: "Gestão de Arrendamentos",
      description: "Gestão completa do seu imóvel para arrendamento.",
      linkTo: "#gestao",
      linkText: "Detalhes"
    },
    {
      icon: <Wrench className="h-8 w-8 text-primary mb-4" />,
      title: "Manutenção",
      description: "Serviços de manutenção e reparação para o seu imóvel.",
      linkTo: "#manutencao",
      linkText: "Detalhes"
    },
    {
      icon: <ClipboardCheck className="h-8 w-8 text-primary mb-4" />,
      title: "Limpeza",
      description: "Serviços de limpeza profissional para o seu imóvel.",
      linkTo: "#limpeza",
      linkText: "Detalhes"
    },
    {
      icon: <Settings className="h-8 w-8 text-primary mb-4" />,
      title: "Consultoria",
      description: "Aconselhamento profissional para o seu património.",
      linkTo: "#consultoria",
      linkText: "Detalhes"
    },
    {
      icon: <Search className="h-8 w-8 text-primary mb-4" />,
      title: "Análise de Mercado",
      description: "Estudos detalhados sobre o mercado imobiliário em Lisboa.",
      linkTo: "/contacto",
      linkText: "Contactar"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary mb-4" />,
      title: "Segurança",
      description: "Sistemas de segurança e vigilância para o seu imóvel.",
      linkTo: "/contacto",
      linkText: "Contactar"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <HeroSection />
      
      {/* Service Sections */}
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
      
      {/* All Services Grid */}
      <ServiceGrid
        title="Todos os Nossos Serviços"
        description="Conheça a gama completa de serviços que oferecemos para garantir uma gestão imobiliária sem complicações."
        services={gridServices}
      />
      
      {/* CTA Section */}
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
