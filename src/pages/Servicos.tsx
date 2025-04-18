import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, Wrench, Calculator, Settings, Search, FileCheck } from "lucide-react";
import HeroSection from "@/components/servicos/HeroSection";
import ServiceSection from "@/components/servicos/ServiceSection";
import ServiceGrid from "@/components/servicos/ServiceGrid";
import CTASection from "@/components/servicos/CTASection";

const Servicos = () => {
  const serviceData = [
    {
      id: "gestao",
      title: "Gestão de Arrendamentos",
      description: "A nossa gestão de arrendamentos cobre todos os aspetos do arrendamento do seu imóvel, garantindo-lhe o máximo retorno com o mínimo de preocupações.",
      features: [
        { text: "Promoção do imóvel nos principais portais e redes sociais" },
        { text: "Seleção rigorosa de inquilinos com verificação de referências" },
        { text: "Preparação e gestão dos contratos de arrendamento" },
        { text: "Cobrança das rendas e gestão de pagamentos" },
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
      description: "Nossa equipa de profissionais qualificados está pronta para garantir que o seu imóvel se mantenha sempre em perfeitas condições, resolvendo qualquer problema com rapidez e eficiência.",
      features: [
        { text: "Serviços de emergência 24/7" },
        { text: "Manutenção preventiva e inspeções regulares" },
        { text: "Reparações gerais (canalização, eletricidade, etc.)" },
        { text: "Renovações e melhorias" },
        { text: "Limpezas profissionais" },
        { text: "Coordenação com técnicos e fornecedores" }
      ],
      icon: <Wrench className="h-10 w-10 text-primary" />,
      imageSrc: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      imageAlt: "Manutenção de imóveis",
      reverse: true
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
      reverse: false
    },
    {
      id: "optimizacao-fiscal",
      title: "Optimização Fiscal",
      description: "Oferecemos serviços especializados de optimização fiscal para proprietários de imóveis, ajudando-o a maximizar os seus benefícios fiscais de forma legal e eficiente.",
      features: [
        { text: "Análise detalhada da situação fiscal" },
        { text: "Identificação de benefícios fiscais aplicáveis" },
        { text: "Planeamento fiscal para proprietários" },
        { text: "Assessoria na declaração de impostos" },
        { text: "Optimização de despesas dedutíveis" }
      ],
      icon: <Calculator className="h-10 w-10 text-primary" />,
      imageSrc: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      imageAlt: "Optimização fiscal para proprietários",
      reverse: true
    },
    {
      id: "analise-mercado",
      title: "Análise de Mercado",
      description: "Fornecemos análises detalhadas e insights valiosos sobre o mercado imobiliário em Lisboa, permitindo-lhe tomar decisões informadas sobre seus investimentos.",
      features: [
        { text: "Análise de tendências de mercado" },
        { text: "Avaliação comparativa de propriedades" },
        { text: "Estudos de viabilidade" },
        { text: "Relatórios personalizados de mercado" },
        { text: "Previsões de valorização imobiliária" },
        { text: "Identificação de oportunidades de investimento" }
      ],
      icon: <Search className="h-10 w-10 text-primary" />,
      imageSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1015&q=80",
      imageAlt: "Análise de mercado imobiliário",
      reverse: false
    },
    {
      id: "seguros",
      title: "Seguros",
      description: "Ajudamos na gestão de seguros associados ao seu imóvel, propondo seguros negociados tanto para o proprietário como para o inquilino.",
      features: [
        { text: "Contratação e gestão de seguros multiriscos" },
        { text: "Seguros de proteção de renda (em caso de incumprimento)" },
        { text: "Seguros de responsabilidade civil para inquilinos" },
        { text: "Acompanhamento de sinistros e pedidos de indemnização" },
        { text: "Consultoria para escolha das melhores coberturas" }
      ],
      icon: <FileCheck className="h-10 w-10 text-primary" />,
      imageSrc: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      imageAlt: "Seguros imobiliários",
      reverse: true
    }
  ];

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
      icon: <Settings className="h-8 w-8 text-primary mb-4" />,
      title: "Consultoria",
      description: "Aconselhamento profissional para o seu património.",
      linkTo: "#consultoria",
      linkText: "Detalhes"
    },
    {
      icon: <Calculator className="h-8 w-8 text-primary mb-4" />,
      title: "Optimização Fiscal",
      description: "Maximização de benefícios fiscais para proprietários.",
      linkTo: "#optimizacao-fiscal",
      linkText: "Detalhes"
    },
    {
      icon: <Search className="h-8 w-8 text-primary mb-4" />,
      title: "Análise de Mercado",
      description: "Estudos detalhados sobre o mercado imobiliário em Lisboa.",
      linkTo: "#analise-mercado",
      linkText: "Detalhes"
    },
    {
      icon: <FileCheck className="h-8 w-8 text-primary mb-4" />,
      title: "Seguros",
      description: "Proteção completa para o seu investimento imobiliário.",
      linkTo: "#seguros",
      linkText: "Detalhes"
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
