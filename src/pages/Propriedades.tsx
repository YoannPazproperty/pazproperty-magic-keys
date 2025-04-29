import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, BedDouble, Bath, Square, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Define a type for the property to ensure consistency
type Property = {
  id: number;
  titulo: string;
  descricao: string;
  descricaoCompleta?: string;
  preco: number;
  localizacao: string;
  quartos: number;
  banheiros: number;
  areaUtil?: number;
  areaTotal: number;
  imagem: string;
  imagens?: string[];
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
    descricaoCompleta: "Moradia geminada T3, com 2 pisos, inserida num lote de 4 moradias, com piscina comum. Vista para as praias da Foz-do-Arelho. Exposição solar: norte/sul, em muito bom estado e totalmente mobilado. Esta propriedade é composta por 2 pisos habitáveis e uma cave. O piso térreo é a zona social. É composto por um hall de entrada que dá para uma ampla sala de estar / jantar, por uma cozinha, por uma casa de banho social e por as escadas de acesso ao primeiro andar. A sala é muito luminosa com duas grandes janelas que se abrem para o terraço com vista para a piscina e para as praias de Foz-do-Arelho. A cozinha encontra-se totalmente equipada (frigorífico, máquina de lavar loiça, fogão, exaustor, forno e micro-ondas da marca Zanussi). Tem ainda uma máquina de café e todas as loiças necessárias. É semi-aberta para a sala de jantar e tem acesso para o jardim interior (equipado com mesa de jantar, espreguiçadeiras e churrasqueira). No primeiro andar encontram-se os três quartos (incluindo uma suite principal com casa de banho com duche) e uma casa de banho com banheira. Os três quartos abrem para uma varanda com vista para a piscina e para as praias de Foz-do-Arelho. Tem roupeiros em todos os quartos e muita luz (as casas de banho têm janelas). Na cave, existe uma garagem para 2 carros, uma casa de banho com duche e a lavandaria, equipada com máquina de lavar roupa. A casa é equipada com sistema de aspiração central e tambem tem piso radiante em todas as divisões. Toda a casa está mobilada: sofá, mesa de centro, televisão de ecrã plano (também tem televisão em todos os quartos), sistema de som, internet, mesa de jantar, secretária, móveis de jardim e camas (com edredões e almofadas e com possibilidade de toalhas e lençóis). A moradia está totalmente pronta a habitar e é arrendada com todo o recheio existente. A moradia situa-se a poucos minutos da junta de freguesia de Foz do Arelho e do jardim de infância da Foz do Arelho. Fica a 3 minutos de carro (15 minutos a pé) das praias e da lagoa de Óbidos e dos restaurantes de praia. É uma zona ideal para quem pretende viver em família junto ao mar mas suficientemente perto dos acessos às grandes cidades. Foz do Arelho fica a menos de 15 min de Caldas da Rainha (10 km), 25 min de Óbidos (18 km), 45 min de Leiria (60 km) e 1h15 de Lisboa (100 km) e 1h20 de Coimbra (130km).",
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

const Propriedades = () => {
  const [pesquisa, setPesquisa] = useState("");
  const [filtroQuartos, setFiltroQuartos] = useState("");
  const [filtroLocalizacao, setFiltroLocalizacao] = useState("");
  const { t } = useLanguage();
  
  // Filtrar propriedades com base nos critérios
  const propriedadesFiltradas = propriedadesData.filter(prop => {
    const matchesPesquisa = prop.titulo.toLowerCase().includes(pesquisa.toLowerCase()) || 
                           prop.descricao.toLowerCase().includes(pesquisa.toLowerCase());
    const matchesQuartos = filtroQuartos === "" || prop.quartos.toString() === filtroQuartos;
    const matchesLocalizacao = filtroLocalizacao === "" || prop.localizacao.includes(filtroLocalizacao);
    
    return matchesPesquisa && matchesQuartos && matchesLocalizacao;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('properties.hero.title')}</h1>
            <p className="text-xl text-gray-600">
              {t('properties.hero.description')}
            </p>
          </div>
        </div>
      </section>
      
      {/* Search and Filters */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t('properties.search')}
                    value={pesquisa}
                    onChange={(e) => setPesquisa(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:w-2/3">
                <div>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={filtroQuartos}
                    onChange={(e) => setFiltroQuartos(e.target.value)}
                  >
                    <option value="">{t('properties.rooms')}</option>
                    <option value="0">{t('properties.studio')}</option>
                    <option value="1">1 {t('properties.bedroom')}</option>
                    <option value="2">2 {t('properties.bedrooms')}</option>
                    <option value="3">3 {t('properties.bedrooms')}</option>
                    <option value="4">4+ {t('properties.bedrooms')}</option>
                  </select>
                </div>
                
                <div>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={filtroLocalizacao}
                    onChange={(e) => setFiltroLocalizacao(e.target.value)}
                  >
                    <option value="">{t('properties.location')}</option>
                    <option value="Anjos">Anjos</option>
                    <option value="Foz do Arelho">Foz do Arelho</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Properties Grid */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {propriedadesFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {propriedadesFiltradas.map((propriedade) => (
                <div key={propriedade.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-56 overflow-hidden">
                    <img 
                      src={propriedade.imagem} 
                      alt={propriedade.titulo} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{propriedade.titulo}</h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{propriedade.localizacao}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{propriedade.descricao}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center text-gray-600">
                        <BedDouble className="h-4 w-4 mr-1" />
                        <span className="text-sm mr-3">
                          {propriedade.quartos === 0 ? t('properties.studio') : `${propriedade.quartos} ${propriedade.quartos > 1 ? t('properties.bedrooms') : t('properties.bedroom')}`}
                        </span>
                        <Bath className="h-4 w-4 mr-1" />
                        <span className="text-sm mr-3">{propriedade.banheiros} WC</span>
                        <Square className="h-4 w-4 mr-1" />
                        <span className="text-sm">{propriedade.areaTotal} m²</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">{propriedade.preco}€<span className="text-sm text-gray-600">{t('properties.month')}</span></span>
                      <Button asChild size="sm" className="bg-brand-blue hover:bg-primary/90">
                        <Link to={`/propriedades/${propriedade.id}`}>{t('properties.details')}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold mb-2">{t('properties.notfound')}</h3>
              <p className="text-gray-600">{t('properties.adjustsearch')}</p>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-white mt-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('properties.cta.title')}</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            {t('properties.cta.description')}
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/contacto">{t('properties.cta.button')}</Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Propriedades;
