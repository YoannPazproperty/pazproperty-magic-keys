
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, BedDouble, Bath, Square, MapPin } from "lucide-react";

const propriedadesData = [
  {
    id: 1,
    titulo: "Apartamento Renovado Arroios",
    descricao: "Descubra este encantador apartamento T2, um refúgio de tranquilidade e estilo no coração do bairro dos Anjos, em Lisboa. Situado na rua mais pitoresca de Penha de França, este imóvel combina o charme tradicional com todas as comodidades modernas, ideal para quem valoriza a harmonia entre a vida urbana e o conforto doméstico. Possibilidade de arrendar com ou sem mobília. Este apartamento de 2 quartos destaca-se pelo seu pé direito alto que amplia a sensação de espaço.",
    preco: 1.600, // Updated price format
    localizacao: "Anjos, Lisboa",
    quartos: 2,
    banheiros: 2,
    area: 74,
    imagem: "/lovable-uploads/7c000e34-b077-4e1a-b7bf-02360fc98872.png"
  }
];

const Propriedades = () => {
  const [pesquisa, setPesquisa] = useState("");
  const [filtroQuartos, setFiltroQuartos] = useState("");
  const [filtroLocalizacao, setFiltroLocalizacao] = useState("");
  
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Propriedades Geridas</h1>
            <p className="text-xl text-gray-600">
              Descubra a seleção de propriedades de alta qualidade que gerimos em Lisboa. 
              Cada uma é cuidada com a máxima atenção aos detalhes.
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
                    placeholder="Pesquisar propriedades..."
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
                    <option value="">Nº de Quartos</option>
                    <option value="0">Estúdio</option>
                    <option value="1">1 Quarto</option>
                    <option value="2">2 Quartos</option>
                    <option value="3">3 Quartos</option>
                    <option value="4">4+ Quartos</option>
                  </select>
                </div>
                
                <div>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={filtroLocalizacao}
                    onChange={(e) => setFiltroLocalizacao(e.target.value)}
                  >
                    <option value="">Localização</option>
                    <option value="Anjos">Anjos</option>
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
                          {propriedade.quartos === 0 ? "Estúdio" : `${propriedade.quartos} Quarto${propriedade.quartos > 1 ? 's' : ''}`}
                        </span>
                        <Bath className="h-4 w-4 mr-1" />
                        <span className="text-sm mr-3">{propriedade.banheiros} WC</span>
                        <Square className="h-4 w-4 mr-1" />
                        <span className="text-sm">{propriedade.area} m²</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">{propriedade.preco}€<span className="text-sm text-gray-600">/mês</span></span>
                      <Button asChild size="sm" className="bg-brand-blue hover:bg-primary/90">
                        <Link to={`/propriedades/${propriedade.id}`}>Ver Detalhes</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold mb-2">Nenhuma propriedade encontrada</h3>
              <p className="text-gray-600">Tente ajustar os seus critérios de pesquisa.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-white mt-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Procura gestão para a sua propriedade?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            A Pazproperty oferece serviços completos de gestão que maximizam o retorno do seu investimento 
            enquanto minimizam as suas preocupações.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/contacto">Fale Connosco Hoje</Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Propriedades;
