
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
  imageSrc: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1296&q=80",
  imageAlt: "Gestão locativa em Lisboa",
  reverse: false
};
