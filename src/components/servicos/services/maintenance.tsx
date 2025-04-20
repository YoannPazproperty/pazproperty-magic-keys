
import { Wrench } from "lucide-react";
import { ServiceDataItem } from "../types";

export const maintenanceService: ServiceDataItem = {
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
};
