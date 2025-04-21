import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BedDouble, Bath, Square, Ruler, ArrowLeft } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

// Dados de exemplo de propriedades
const propriedadesData = [
  {
    id: 1,
    titulo: "Apartamento Moderno no Chiado",
    descricao: "Fantástico apartamento T2 totalmente renovado no coração do Chiado, a curta distância de restaurantes e lojas.",
    descricaoCompleta: "Este fantástico apartamento T2 localizado no coração do Chiado foi completamente renovado com acabamentos de alta qualidade. O imóvel dispõe de ampla sala de estar com muita luz natural, uma cozinha moderna totalmente equipada com eletrodomésticos de primeira linha, dois quartos confortáveis e uma elegante casa de banho.\n\nA localização é imbatível, com acesso fácil aos principais pontos de interesse cultural, restaurantes premiados, cafés históricos e as melhores lojas de Lisboa. A proximidade dos transportes públicos (metro e elétrico) facilita a mobilidade para qualquer parte da cidade.\n\nDestaca-se ainda pelas suas características originais preservadas, como os tectos altos e as janelas tradicionais, que conferem um charme especial a este apartamento no bairro mais cosmopolita de Lisboa.",
    preco: 1200,
    localizacao: "Chiado, Lisboa",
    quartos: 2,
    banheiros: 1,
    areaUtil: 70,
    areaTotal: 75,
    imagens: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80"
    ]
  },
  {
    id: 2,
    titulo: "Espaçoso T3 em Alfama",
    descricao: "Charmoso apartamento T3 no bairro histórico de Alfama, com varandas e vista parcial para o rio Tejo.",
    descricaoCompleta: "Este charmoso apartamento T3 está localizado no bairro histórico de Alfama e oferece varandas com vista parcial para o rio Tejo. O imóvel possui uma espaçosa sala de estar, três quartos confortáveis e duas casas de banho completas.\n\nA localização é ideal para quem aprecia a autenticidade de Lisboa, com fácil acesso a restaurantes tradicionais, casas de fado e os principais pontos turísticos de Alfama. A proximidade dos transportes públicos (elétrico e autocarro) facilita a mobilidade para outras partes da cidade.\n\nO apartamento destaca-se pela sua luminosidade natural e pelos detalhes arquitetónicos típicos do bairro, como os azulejos e as janelas de sacada.",
    preco: 1500,
    localizacao: "Alfama, Lisboa",
    quartos: 3,
    banheiros: 2,
    areaUtil: 100,
    areaTotal: 110,
    imagens: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123140ef3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1541167760496-1628856ab77f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80"
    ]
  },
  {
    id: 3,
    titulo: "Estúdio Moderno em Belém",
    descricao: "Estúdio contemporâneo em Belém, acabamentos de alta qualidade e proximidade aos principais pontos turísticos.",
    descricaoCompleta: "Este estúdio contemporâneo está situado em Belém, com acabamentos de alta qualidade e uma localização privilegiada perto dos principais pontos turísticos. O imóvel dispõe de uma área de estar em open space com muita luz natural, uma cozinha moderna totalmente equipada e uma casa de banho elegante.\n\nA localização é ideal para quem procura um estilo de vida moderno e prático, com fácil acesso a museus, monumentos históricos e espaços de lazer. A proximidade dos transportes públicos (comboio e autocarro) facilita a mobilidade para outras partes da cidade.\n\nO estúdio destaca-se pelo seu design minimalista e funcional, com detalhes que valorizam o conforto e a praticidade.",
    preco: 850,
    localizacao: "Belém, Lisboa",
    quartos: 0,
    banheiros: 1,
    areaUtil: 40,
    areaTotal: 45,
    imagens: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123140ef3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1551523851-6f16b4e9d3e1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80"
    ]
  },
  {
    id: 4,
    titulo: "Apartamento T2 no Parque das Nações",
    descricao: "Moderno T2 no Parque das Nações, com vista para o rio, estacionamento e acesso a todas as comodidades.",
    descricaoCompleta: "Este moderno T2 está localizado no Parque das Nações, com vista para o rio, estacionamento e acesso a todas as comodidades. O imóvel dispõe de uma ampla sala de estar com muita luz natural, uma cozinha moderna totalmente equipada, dois quartos confortáveis e duas casas de banho completas.\n\nA localização é ideal para quem procura um estilo de vida moderno e sofisticado, com fácil acesso a espaços de lazer, restaurantes e centros comerciais. A proximidade dos transportes públicos (metro e autocarro) facilita a mobilidade para outras partes da cidade.\n\nO apartamento destaca-se pela sua vista panorâmica sobre o rio Tejo e pela qualidade dos acabamentos.",
    preco: 1300,
    localizacao: "Parque das Nações, Lisboa",
    quartos: 2,
    banheiros: 2,
    areaUtil: 80,
    areaTotal: 90,
    imagens: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1541167760496-1628856ab77f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80"
    ]
  },
  {
    id: 5,
    titulo: "Apartamento Clássico na Baixa",
    descricao: "Apartamento de 1 quarto na Baixa Pombalina, recentemente renovado mantendo elementos originais do edifício.",
    descricaoCompleta: "Este apartamento de 1 quarto está localizado na Baixa Pombalina e foi recentemente renovado, mantendo os elementos originais do edifício. O imóvel dispõe de uma sala de estar acolhedora, uma cozinha moderna totalmente equipada, um quarto confortável e uma casa de banho elegante.\n\nA localização é ideal para quem aprecia a história e a cultura de Lisboa, com fácil acesso a monumentos históricos, museus e espaços culturais. A proximidade dos transportes públicos (metro e autocarro) facilita a mobilidade para outras partes da cidade.\n\nO apartamento destaca-se pelos seus detalhes arquitetónicos originais, como os azulejos e as janelas de sacada.",
    preco: 1100,
    localizacao: "Baixa, Lisboa",
    quartos: 1,
    banheiros: 1,
    areaUtil: 60,
    areaTotal: 65,
    imagens: [
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123140ef3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1541167760496-1628856ab77f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80"
    ]
  },
  {
    id: 6,
    titulo: "Espaçosa Moradia em Alvalade",
    descricao: "Moradia de 4 quartos em Alvalade, com jardim, garagem e excelente para famílias que procuram tranquilidade.",
    descricaoCompleta: "Esta espaçosa moradia de 4 quartos está localizada em Alvalade, com jardim, garagem e é excelente para famílias que procuram tranquilidade. O imóvel dispõe de uma ampla sala de estar com muita luz natural, uma cozinha moderna totalmente equipada, quatro quartos confortáveis e três casas de banho completas.\n\nA localização é ideal para quem procura um estilo de vida familiar e tranquilo, com fácil acesso a escolas, parques e espaços de lazer. A proximidade dos transportes públicos (metro e autocarro) facilita a mobilidade para outras partes da cidade.\n\nA moradia destaca-se pelo seu jardim espaçoso e pela qualidade dos acabamentos.",
    preco: 2500,
    localizacao: "Alvalade, Lisboa",
    quartos: 4,
    banheiros: 3,
    areaUtil: 180,
    areaTotal: 200,
    imagens: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123140ef3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1541167760496-1628856ab77f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80"
    ]
  }
];

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const propertyId = parseInt(id, 10);
      const foundProperty = propriedadesData.find(prop => prop.id === propertyId);
      setProperty(foundProperty);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">A carregar...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Propriedade não encontrada</h1>
          <p className="text-xl mb-6">A propriedade que procura não existe ou foi removida.</p>
          <Button asChild size="lg">
            <Link to="/propriedades">Ver Todas as Propriedades</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Format description with paragraphs
  const formattedDescription = property.descricaoCompleta.split('\n\n').map((paragraph: string, i: number) => (
    <p key={i} className="mb-4">{paragraph}</p>
  ));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-32">
        <div className="mb-6">
          <Button asChild variant="outline" className="mb-8">
            <Link to="/propriedades" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Propriedades
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold">{property.titulo}</h1>
          <p className="text-lg text-gray-600 mt-2">{property.localizacao}</p>
        </div>

        {/* Photo Gallery Carousel */}
        <div className="mb-12">
          <Carousel className="w-full">
            <CarouselContent className="mx-0">
              {property.imagens.map((image: string, index: number) => (
                <CarouselItem key={index} className="pl-0">
                  <Card className="border-0">
                    <CardContent className="aspect-[16/9] overflow-hidden rounded-lg p-0">
                      <img 
                        src={image} 
                        alt={`${property.titulo} - Imagem ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end gap-2 mt-2">
              <CarouselPrevious className="relative inset-auto transform-none" />
              <CarouselNext className="relative inset-auto transform-none" />
            </div>
          </Carousel>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Main Information */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Descrição</h2>
            <div className="text-gray-600">
              {formattedDescription}
            </div>
          </div>

          {/* Property Details */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold mb-6 text-center">
                {property.preco}€<span className="text-base font-normal text-gray-600">/mês</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <BedDouble className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-gray-600">Quartos</span>
                  </div>
                  <span className="font-semibold">{property.quartos}</span>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-gray-600">Casas de Banho</span>
                  </div>
                  <span className="font-semibold">{property.banheiros}</span>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <Square className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-gray-600">Área Útil</span>
                  </div>
                  <span className="font-semibold">{property.areaUtil} m²</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Ruler className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-gray-600">Área Total</span>
                  </div>
                  <span className="font-semibold">{property.areaTotal} m²</span>
                </div>
              </div>
              
              <div className="mt-8">
                <Button className="w-full bg-brand-blue hover:bg-primary/90">
                  Contactar Agência
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Properties Section could be added here */}
      </div>
      
      <Footer />
    </div>
  );
};

export default PropertyDetail;
