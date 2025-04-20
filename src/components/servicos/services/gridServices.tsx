
import { Home, Wrench, Settings, Calculator, Search, FileCheck } from "lucide-react";
import { GridServiceItem } from "../types";

export const gridServices: GridServiceItem[] = [
  {
    icon: <Home className="h-8 w-8 text-primary mb-4" />,
    title: "Gestão de Arrendamentos",
    description: "Gestão completa do seu imóvel para arrendamento.",
    linkTo: "#gestao",
    linkText: "Saber mais",
    linkStyle: "text-[#ffb100] hover:text-[#ffa500]"
  },
  {
    icon: <Wrench className="h-8 w-8 text-primary mb-4" />,
    title: "Manutenção",
    description: "Serviços de manutenção e reparação para o seu imóvel.",
    linkTo: "#manutencao",
    linkText: "Saber mais",
    linkStyle: "text-[#ffb100] hover:text-[#ffa500]"
  },
  {
    icon: <Settings className="h-8 w-8 text-primary mb-4" />,
    title: "Consultoria",
    description: "Aconselhamento profissional para o seu património.",
    linkTo: "#consultoria",
    linkText: "Saber mais",
    linkStyle: "text-[#ffb100] hover:text-[#ffa500]"
  },
  {
    icon: <Calculator className="h-8 w-8 text-primary mb-4" />,
    title: "Optimização Fiscal",
    description: "Maximização de benefícios fiscais para proprietários.",
    linkTo: "#optimizacao-fiscal",
    linkText: "Saber mais",
    linkStyle: "text-[#ffb100] hover:text-[#ffa500]"
  },
  {
    icon: <Search className="h-8 w-8 text-primary mb-4" />,
    title: "Análise de Mercado",
    description: "Estudos detalhados sobre o mercado imobiliário em Lisboa.",
    linkTo: "#analise-mercado",
    linkText: "Saber mais",
    linkStyle: "text-[#ffb100] hover:text-[#ffa500]"
  },
  {
    icon: <FileCheck className="h-8 w-8 text-primary mb-4" />,
    title: "Seguros",
    description: "Proteção completa para o seu investimento imobiliário.",
    linkTo: "#seguros",
    linkText: "Saber mais",
    linkStyle: "text-[#ffb100] hover:text-[#ffa500]"
  }
];
