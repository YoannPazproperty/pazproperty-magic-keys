
import { FileCheck } from "lucide-react";
import { ServiceDataItem } from "../types";

export const insuranceService: ServiceDataItem = {
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
  imageSrc: "/lovable-uploads/800c90ed-ca05-45d2-b607-bea84ece7d1d.png",
  imageAlt: "Seguros imobiliários e proteção de propriedades",
  reverse: true
};
