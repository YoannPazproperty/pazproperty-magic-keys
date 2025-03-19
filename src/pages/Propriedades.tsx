
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, BedDouble, Bath, SquareFeet, MapPin } from "lucide-react";

// Dados de exemplo de propriedades
const propriedadesData = [
  {
    id: 1,
    titulo: "Apartamento Moderno no Chiado",
    descricao: "Fantástico apartamento T2 totalmente renovado no coração do Chiado, a curta distância de restaurantes e lojas.",
    preco: 1200,
    localizacao: "Chiado, Lisboa",
    quartos: 2,
    banheiros: 1,
    area: 75,
    imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80"
  },
  {
    id: 2,
    titulo: "Espaçoso T3 em Alfama",
    descricao: "Charmoso apartamento T3 no bairro histórico de Alfama, com varandas e vista parcial para o rio Tejo.",
    preco: 1500,
    localizacao: "Alfama, Lisboa",
    quartos: 3,
    banheiros: 2,
    area: 110,
    imagem: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80"
  },
  {
    id: 3,
    titulo: "Estúdio Moderno em Belém",
    descricao: "Estúdio contemporâneo em Belém, acabamentos de alta qualidade e proximidade aos principais pontos turísticos.",
    preco: 850,
    localizacao: "Belém, Lisboa",
    quartos: 0,
    banheiros: 1,
    area: 45,
    imagem: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80"
  },
  {
    id: 4,
    titulo: "Apartamento T2 no Parque das Nações",
    descricao: "Moderno T2 no Parque das Nações, com vista para o rio, estacionamento e acesso a todas as comodidades.",
    preco: 1300,
    localizacao: "Parque das Nações, Lisboa",
    quartos: 2,
    banheiros: 2,
    area: 90,
    imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80"
  },
  {
    id: 5,
    titulo: "Apartamento Clássico na Baixa",
    descricao: "Apartamento de 1 quarto na Baixa Pombalina, recentemente renovado mantendo elementos originais do edifício.",
    preco: 1100,
    localizacao: "Baixa, Lisboa",
    quartos: 1,
    banheiros: 1,
    area: 65,
    imagem: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80"
  },
  {
    id: 6,
    titulo: "Espaçosa Moradia em Alvalade",
    descricao: "Moradia de 4 quartos em Alvalade, com jardim, garagem e excelente para famílias que procuram tranquilidade.",
    preco: 2500,
    localizacao: "Alvalade, Lisboa",
    quartos: 4,
    banheiros: 3,
    area: 200,
    imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80"
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
                    <option value="Chiado">Chiado</option>
                    <option value="Alfama">Alfama</option>
                    <option value="Belém">Belém</option>
                    <option value="Baixa">Baixa</option>
                    <option value="Parque das Nações">Parque das Nações</option>
                    <option value="Alvalade">Alvalade</option>
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
                        <SquareFeet className="h-4 w-4 mr-1" />
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
