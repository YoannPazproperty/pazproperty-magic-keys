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
    titulo: "Apartamento Renovado Arroios",
    descricao: "Descubra este encantador apartamento T2, um refúgio de tranquilidade e estilo no coração do bairro dos Anjos, em Lisboa.",
    descricaoCompleta: "Descubra este encantador apartamento T2, um refúgio de tranquilidade e estilo no coração do bairro dos Anjos, em Lisboa. Situado na rua mais pitoresca de Penha de França, este imóvel combina o charme tradicional com todas as comodidades modernas, ideal para quem valoriza a harmonia entre a vida urbana e o conforto dom��stico. POSSIBILIDADE DE ARRENDAR COM OU SEM MOBILIA.\n\nEste apartamento de 2 quartos destaca-se pelo seu pé direito alto que amplia a sensação de espaço. Ao entrar, é recebido por um hall que abre para uma sala de estar espaçosa e uma varanda transformada em agradável área de refeições com vidros duplos oscilo-batentes. A cozinha, moderna e totalmente equipada, complementa este ambiente acolhedor.\n\nO apartamento dispõe de dois quartos, sendo um deles uma suíte com closet e casa de banho moderna equipada com base de duche. Existe ainda uma segunda casa de banho completa, também com duche, servindo o segundo quarto.\n\nCaracterísticas adicionais incluem:\n- Pisos em madeira\n- Aquecimento elétrico\n- Totalmente mobiliado (camas, sofa, cadeiras, mesas, tudo o que for necessário para um conforto de um casa)\n- Totalmente equipado (televisão, eletrodomésticos, utensílios e louças de cozinha, lençóis, toalhas, tudo o que for necessário para sentir-se em casa)\n- Decoração moderna\n\nO imóvel encontra-se a uma curta distância a pé de uma vasta gama de serviços, restaurantes e comércio variado e a menos de 10 minutos do metro Anjos, linha verde.\n\nCondições de arrendamento:\n- Duas rendas de caução\n- Uma renda adiantada\n- Uma renda do mês de início de contrato\n- Comprovativo de rendimentos e documentação pessoal\n- Contrato de três anos\n\nLicença de Utilização nº285 de 24-12-1933\n\nInteressado em fazer deste apartamento o seu novo lar? Contacte-nos para marcar uma visita e venha sentir a atmosfera acolhedora que o espera. Não perca esta oportunidade única de viver num espaço encantador, decorado e mobilado.",
    preco: 1600,
    localizacao: "Anjos, Lisboa",
    quartos: 2,
    banheiros: 2,
    areaUtil: 50,
    areaTotal: 74,
    imagens: [
      "/lovable-uploads/7c000e34-b077-4e1a-b7bf-02360fc98872.png",
      "/lovable-uploads/fe3ebdb8-8723-4083-9a2c-d107bc148210.png",
      "/lovable-uploads/d02eefb4-58e0-4d65-b8c7-485b0a1129f0.png",
      "/lovable-uploads/b3662f79-f655-4ac8-9d0b-f9f01c2ec8b9.png",
      "/lovable-uploads/6ee6ce4a-18d2-4141-ac6c-e867d0591df4.png",
      "/lovable-uploads/825e1ceb-3ade-4cd2-a10e-bcff5dd967db.png"
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
