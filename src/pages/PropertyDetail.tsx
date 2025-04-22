
import React, { useState, useEffect } from "react";
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

// Define a type for the property to ensure consistency
type Property = {
  id: number;
  titulo: string;
  descricao: string;
  descricaoCompleta: string;
  preco: number;
  localizacao: string;
  quartos: number;
  banheiros: number;
  areaUtil?: number;
  areaTotal: number;
  imagem: string;
  imagens: string[];
};

const propriedadesData: Property[] = [
  {
    id: 1,
    titulo: "Apartamento Renovado Arroios",
    descricao: "Descubra este encantador apartamento T2, um refúgio de tranquilidade e estilo no coração do bairro dos Anjos, em Lisboa.",
    descricaoCompleta: "Descubra este encantador apartamento T2, um refúgio de tranquilidade e estilo no coração do bairro dos Anjos, em Lisboa. Situado na rua mais pitoresca de Penha de França, este imóvel combina o charme tradicional com todas as comodidades modernas, ideal para quem valoriza a harmonia entre a vida urbana e o conforto doméstico. Possibilidade de arrendar com ou sem mobília. Este apartamento de 2 quartos destaca-se pelo seu pé direito alto que amplia a sensação de espaço.",
    preco: 1_600,
    localizacao: "Anjos, Lisboa",
    quartos: 2,
    banheiros: 2,
    areaUtil: 50,
    areaTotal: 74,
    imagem: "/lovable-uploads/7c000e34-b077-4e1a-b7bf-02360fc98872.png",
    imagens: [
      "/lovable-uploads/7c000e34-b077-4e1a-b7bf-02360fc98872.png",
      "/lovable-uploads/fe3ebdb8-8723-4083-9a2c-d107bc148210.png"
    ]
  },
  {
    id: 2,
    titulo: "Moradia Funcional - Foz de Arelho",
    descricao: "Moradia geminada T3, com 2 pisos, inserida num lote de 4 moradias, com piscina comum. Vista para as praias da Foz-do-Arelho.",
    descricaoCompleta: "Moradia geminada T3, com 2 pisos, inserida num lote de 4 moradias, com piscina comum. Vista para as praias da Foz-do-Arelho. Exposição solar: norte/sul, em muito bom estado e totalmente mobilado. Esta propriedade é composta por 2 pisos habitáveis e uma cave. O piso térreo é a zona social. É composto por um hall de entrada que dá para uma ampla sala de estar / jantar, por uma cozinha, por uma casa de banho social e por as escadas de acesso ao primeiro andar. A sala é muito luminosa com duas grandes janelas que se abrem para o terraço com vista para a piscina e para as praias de Foz-do-Arelho. A cozinha encontra-se totalmente equipada (frigorífico, máquina de lavar loiça, fogão, exaustor, forno e micro-ondas da marca Zanussi). Tem ainda uma máquina de café e todas as loiças necessárias. É semi-aberta para a sala de jantar e tem acesso para o jardim interior (equipado com mesa de jantar, espreguiçadeiras e churrasqueira). No primeiro andar encontram-se os três quartos (incluindo uma suite principal com casa de banho com duche) e uma casa de banho com banheira. Os três quartos abrem para uma varanda com vista para a piscina e para as praias de Foz-do-Arelho. Tem roupeiros em todos os quartos e muita luz (as casas de banho têm janelas). Na cave, existe uma garagem para 2 carros, uma casa de banho com duche e a lavandaria, equipada com máquina de lavar roupa. A casa é equipada com sistema de aspiração central e tambem tem piso radiante em todas as divisões. Toda a casa está mobilada: sofá, mesa de centro, televisão de ecrã plano (tambem tem televisão em todos os quartos), sistema de som, internet, mesa de jantar, secretária, móveis de jardim e camas (com edredões e almofadas e com possibilidade de toalhas e lençóis). A moradia está totalmente pronta a habitar e é arrendada com todo o recheio existente. A moradia situa-se a poucos minutos da junta de freguesia de Foz do Arelho e do jardim de infância da Foz do Arelho. Fica a 3 minutos de carro (15 minutos a pé) das praias e da lagoa de Óbidos e dos restaurantes de praia. É uma zona ideal para quem pretende viver em família junto ao mar mas suficientemente perto dos acessos às grandes cidades. Foz do Arelho fica a menos de 15 min de Caldas da Rainha (10 km), 25 min de Óbidos (18 km), 45 min de Leiria (60 km) e 1h15 de Lisboa (100 km) e 1h20 de Coimbra (130km).",
    preco: 2_000,
    localizacao: "Foz do Arelho",
    quartos: 3,
    banheiros: 3,
    areaUtil: 230,
    areaTotal: 230,
    imagem: "/lovable-uploads/81661f2c-ba0b-41c6-a46b-c7c41eb8ab9b.png",
    imagens: [
      "/lovable-uploads/81661f2c-ba0b-41c6-a46b-c7c41eb8ab9b.png",
      "/lovable-uploads/eebca9eb-df7a-4732-8af7-2d472c0bf3c6.png",
      "/lovable-uploads/4c26b8dd-106a-4022-9f87-c30fa0b2342b.png",
      "/lovable-uploads/572bfd1c-9e2a-49ef-8f74-33b2634ff015.png",
      "/lovable-uploads/c8a48a55-1863-4aa6-a1e7-96722155a3ce.png",
      "/lovable-uploads/2ec49fd8-0669-48a1-9ec9-eba9d22dba6b.png",
      "/lovable-uploads/645391b2-9b9c-46ba-9b91-74fc145a22e1.png",
      "/lovable-uploads/29efa01a-d48a-4f41-9375-1ccc13ff6b33.png",
      "/lovable-uploads/71fdcb4c-58aa-48cd-99fb-72d88b1555a4.png"
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

  const descricaoCompleta = `Descubra este encantador apartamento T2, um refúgio de tranquilidade e estilo no coração do bairro dos Anjos, em Lisboa. Situado na rua mais pitoresca de Penha de França, este imóvel combina o charme tradicional com todas as comodidades modernas, ideal para quem valoriza a harmonia entre a vida urbana e o conforto doméstico. Possibilidade de arrendar com ou sem mobília. 

Este apartamento de 2 quartos destaca-se pelo seu pé direito alto que amplia a sensação de espaço. Ao entrar, é recebido por um hall que abre para uma sala de estar espaçosa e uma varanda transformada em agradável área de refeições com vidros duplos oscilo-batentes. A cozinha, moderna e totalmente equipada, complementa este ambiente acolhedor.

O apartamento dispõe de dois quartos, sendo um deles uma suíte com closet e casa de banho moderna equipada com base de duche. Existe ainda uma segunda casa de banho completa, também com duche, servindo o segundo quarto.

Características adicionais incluem:
- Pisos em madeira
- Aquecimento elétrico
- Totalmente mobiliado (camas, sofa, cadeiras, mesas, tudo o que for necessário para um conforto de um casa)
- Totalmente equipado (televisão, eletrodomésticos, utensílios e louças de cozinha, lençóis, toalhas, tudo o que for necessário para sentir-se em casa)
- Decoração moderna

O imóvel encontra-se a uma curta distância a pé de uma vasta gama de serviços, restaurantes e comércio variado e a menos de 10 minutos do metro Anjos, linha verde.

Condições de arrendamento:
- Duas rendas de caução
- Uma renda adiantada
- Uma renda do mês de início de contrato
- Comprovativo de rendimentos e documentação pessoal
- Contrato de três anos

Licença de Utilização nº285 de 24-12-1933

Interessado em fazer deste apartamento o seu novo lar? Contacte-nos para marcar uma visita e venha sentir a atmosfera acolhedora que o espera. Não perca esta oportunidade única de viver num espaço encantador, decorado e mobilado.`;

  const propriedade = {
    ...property,
    descricaoCompleta,
  };

  const formattedDescription = propriedade.descricaoCompleta.split('\n\n').map((paragraph: string, i: number) => (
    <p key={i} className="mb-4 text-justify">{paragraph}</p>
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
