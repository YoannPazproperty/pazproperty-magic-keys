
import { Settings } from "lucide-react";
import { ServiceDataItem } from "../types";

export const consultingService: ServiceDataItem = {
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
};
