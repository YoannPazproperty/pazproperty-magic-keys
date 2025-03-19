
import { ArrowRight, Clipboard, Tool, Home, ClipboardCheck, Search, Settings, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Servicos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gray-50" id="servicos">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Nossos Serviços</h1>
            <p className="text-xl text-gray-600">
              Oferecemos uma gama completa de serviços de gestão imobiliária para proprietários em Lisboa, 
              desde a gestão locativa até à manutenção e consultoria.
            </p>
          </div>
        </div>
      </section>
      
      {/* Gestão Locativa */}
      <section className="py-20" id="gestao">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Home className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Gestão Locativa</h2>
              <p className="text-lg text-gray-600 mb-6">
                Nossa gestão locativa cobre todos os aspectos do arrendamento do seu imóvel, 
                garantindo que você receba o máximo retorno com o mínimo de preocupações.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Promoção do imóvel nos principais portais e redes sociais</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Seleção rigorosa de inquilinos com verificação de referências</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Preparação e gestão de contratos de arrendamento</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Cobrança de rendas e gestão de pagamentos</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Inspeções regulares ao imóvel</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Relatórios financeiros mensais detalhados</p>
                </div>
              </div>
              
              <Button asChild className="bg-brand-blue hover:bg-primary/90">
                <Link to="/contacto">Solicitar Orçamento</Link>
              </Button>
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1296&q=80" 
                alt="Gestão locativa em Lisboa" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Manutenção */}
      <section className="py-20 bg-gray-50" id="manutencao">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                alt="Manutenção de imóveis" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Tool className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Manutenção</h2>
              <p className="text-lg text-gray-600 mb-6">
                Nossa equipa de profissionais qualificados está pronta para garantir que o seu imóvel 
                esteja sempre em perfeitas condições, resolvendo problemas rapidamente.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Serviços de emergência 24/7</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Manutenção preventiva e inspeções regulares</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Reparações gerais (canalização, eletricidade, etc.)</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Renovações e melhorias</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Serviços de limpeza profissional</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Coordenação com técnicos e fornecedores</p>
                </div>
              </div>
              
              <Button asChild className="bg-brand-blue hover:bg-primary/90">
                <Link to="/contacto">Solicitar Orçamento</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Limpeza */}
      <section className="py-20" id="limpeza">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <ClipboardCheck className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Serviços de Limpeza</h2>
              <p className="text-lg text-gray-600 mb-6">
                Oferecemos serviços de limpeza profissional para garantir que o seu imóvel esteja sempre 
                impecável, seja para novos inquilinos ou para manutenção regular.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Limpeza profunda entre inquilinos</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Limpeza regular agendada</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Limpeza de vidros e fachadas</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Limpeza de áreas comuns em prédios</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Produtos ecológicos e hipoalergénicos</p>
                </div>
              </div>
              
              <Button asChild className="bg-brand-blue hover:bg-primary/90">
                <Link to="/contacto">Solicitar Orçamento</Link>
              </Button>
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                alt="Serviços de limpeza" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Consultoria */}
      <section className="py-20 bg-gray-50" id="consultoria">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80" 
                alt="Consultoria imobiliária" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Settings className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Consultoria</h2>
              <p className="text-lg text-gray-600 mb-6">
                Nossos especialistas oferecem consultoria personalizada para ajudá-lo a tomar as melhores 
                decisões sobre o seu património imobiliário em Lisboa.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Análise de mercado e avaliação de propriedades</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Estratégias de otimização de rendimento</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Aconselhamento sobre investimentos imobiliários</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Orientação sobre regulamentos e legislação</p>
                </div>
                <div className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Planeamento fiscal para proprietários</p>
                </div>
              </div>
              
              <Button asChild className="bg-brand-blue hover:bg-primary/90">
                <Link to="/contacto">Solicitar Orçamento</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* All Services in Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Todos os Nossos Serviços</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Conheça a gama completa de serviços que oferecemos para garantir uma gestão imobiliária sem complicações.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <Home className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gestão Locativa</h3>
              <p className="text-gray-600 mb-4">Gestão completa do seu imóvel para arrendamento.</p>
              <Link to="#gestao" className="text-primary hover:underline inline-flex items-center">
                Detalhes <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <Tool className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Manutenção</h3>
              <p className="text-gray-600 mb-4">Serviços de manutenção e reparação para o seu imóvel.</p>
              <Link to="#manutencao" className="text-primary hover:underline inline-flex items-center">
                Detalhes <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <ClipboardCheck className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Limpeza</h3>
              <p className="text-gray-600 mb-4">Serviços de limpeza profissional para o seu imóvel.</p>
              <Link to="#limpeza" className="text-primary hover:underline inline-flex items-center">
                Detalhes <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <Settings className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Consultoria</h3>
              <p className="text-gray-600 mb-4">Aconselhamento profissional para o seu património.</p>
              <Link to="#consultoria" className="text-primary hover:underline inline-flex items-center">
                Detalhes <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <Search className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Análise de Mercado</h3>
              <p className="text-gray-600 mb-4">Estudos detalhados sobre o mercado imobiliário em Lisboa.</p>
              <Link to="/contacto" className="text-primary hover:underline inline-flex items-center">
                Contactar <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Segurança</h3>
              <p className="text-gray-600 mb-4">Sistemas de segurança e vigilância para o seu imóvel.</p>
              <Link to="/contacto" className="text-primary hover:underline inline-flex items-center">
                Contactar <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Entre em contacto connosco para discutir as suas necessidades e como podemos ajudar a maximizar 
            o valor do seu imóvel em Lisboa.
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

export default Servicos;
