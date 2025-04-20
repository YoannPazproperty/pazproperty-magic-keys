
import { Calculator } from "lucide-react";
import { ServiceDataItem } from "../types";

export const taxOptimizationService: ServiceDataItem = {
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
};
