
import { Home } from "lucide-react";
import { ServiceDataItem } from "../types";

export const rentalManagementService: ServiceDataItem = {
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
  imageSrc: "/lovable-uploads/1a80f337-f332-4cfa-9671-eda3ee48ff7e.png",
  imageAlt: "Vista panorâmica de Lisboa com céu azul e nuvens",
  reverse: false
};
