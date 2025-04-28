
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Wrench, Settings } from "lucide-react";

const ServicesOverview = () => {
  const navigate = useNavigate();

  const handleServiceNavigation = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const handleAllServicesNavigation = () => {
    navigate("/servicos");
    window.scrollTo(0, 0);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Serviços</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Oferecemos uma gama completa de serviços para garantir que o seu imóvel esteja 
            sempre bem cuidado e a gerar o máximo retorno.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard
            icon={<Home className="h-8 w-8" color="#ffb100" />}
            title="Gestão de Arrendamentos"
            description="Gerimos todo o processo — desde a promoção do imóvel até à gestão diária, passando pela seleção de inquilinos e contratos."
            onClick={() => handleServiceNavigation("/servicos#gestao")}
          />
          
          <ServiceCard
            icon={<Wrench className="h-8 w-8" color="#ffb100" />}
            title="Manutenção"
            description="Equipa de profissionais pronta para resolver qualquer questão de manutenção — desde pequenos reparos até grandes renovações."
            onClick={() => handleServiceNavigation("/servicos#manutencao")}
          />
          
          <ServiceCard
            icon={<Settings className="h-8 w-8" color="#ffb100" />}
            title="Consultoria"
            description="Aconselhamento especializado sobre o mercado imobiliário em Lisboa, com foco em oportunidades de investimento e na otimização de rendimentos."
            onClick={() => handleServiceNavigation("/servicos#consultoria")}
          />
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleAllServicesNavigation}
          >
            Ver Todos os Serviços
          </Button>
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ 
  icon, 
  title, 
  description, 
  onClick 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-4 mb-6">
      {icon}
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <p className="text-gray-600 mb-4">{description}</p>
    <button 
      onClick={onClick}
      className="text-[#ffb100] hover:text-[#ffa500] inline-flex items-center"
    >
      Saber mais <ArrowRight className="ml-2 h-4 w-4" color="#ffb100" />
    </button>
  </div>
);

export default ServicesOverview;
