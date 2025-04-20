
import { Search } from "lucide-react";
import { ServiceDataItem } from "../types";

export const marketAnalysisService: ServiceDataItem = {
  id: "analise-mercado",
  title: "Análise de Mercado",
  description: "Realizamos estudos aprofundados sobre o mercado imobiliário em Lisboa, fornecendo dados e insights que ajudam os proprietários a tomar decisões informadas e estratégicas sobre os seus imóveis.",
  features: [
    { text: "Avaliação comparativa de imóveis na zona" },
    { text: "Acompanhamento das tendências de preços e procura" },
    { text: "Análise do potencial de valorização a médio e longo prazo" },
    { text: "Identificação das melhores zonas para investimento" },
    { text: "Relatórios personalizados com base no seu perfil de património" }
  ],
  icon: <Search className="h-10 w-10 text-primary" />,
  imageSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1015&q=80",
  imageAlt: "Análise de mercado imobiliário",
  reverse: false
};
