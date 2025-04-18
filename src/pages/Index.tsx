import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Home, Wrench, Settings, Phone, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("E-mail enviado:", email);
    setEmail("");
    alert("Obrigado pelo seu contacto! Responderemos em breve.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1296&q=80" 
            alt="Lisboa vista panorâmica" 
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="relative z-10 container mx-auto h-full flex items-center justify-center px-4">
          <div className="text-center text-white max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Gestão de Arrendamentos <span className="text-gradient">Simplificada</span> em Lisboa, Grande Lisboa e Margem Sul
            </h1>
            <div className="text-xl mb-8">
              <p><em>Your keys, our responsibilities</em></p>
              <p><em>As suas chaves, a nossa missão</em></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-brand-blue hover:bg-primary/90">
                <Link to="/contacto">Fale Connosco</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 border-white">
                <Link to="/servicos">Nossos Serviços</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Serviços</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos uma gama completa de serviços para garantir que o seu imóvel esteja 
              sempre bem cuidado e a gerar o máximo retorno.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Gestão de Arrendamentos</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Gerimos todo o processo — desde a promoção do imóvel até à gestão diária, passando pela seleção de inquilinos e contratos.
              </p>
              <Link to="/servicos#gestao" className="inline-flex items-center text-primary hover:underline">
                Saber mais <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wrench className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Manutenção</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Equipa de profissionais pronta para resolver qualquer questão de manutenção — desde pequenos reparos até grandes renovações.
              </p>
              <Link to="/servicos#manutencao" className="inline-flex items-center text-primary hover:underline">
                Saber mais <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Consultoria</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Aconselhamento especializado sobre o mercado imobiliário em Lisboa, com foco em oportunidades de investimento e na otimização de rendimentos.
              </p>
              <Link to="/servicos#consultoria" className="inline-flex items-center text-primary hover:underline">
                Saber mais <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/servicos">Ver Todos os Serviços</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Por Que Escolher a Pazproperty?</h2>
              <p className="text-gray-600 mb-8">
                Com anos de experiência no mercado imobiliário lisboeta, oferecemos um serviço completo e personalizado para proprietários que valorizam tranquilidade, eficiência e confiança.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Equipa Local</h3>
                    <p className="text-gray-600">Conhecemos Lisboa como a palma da nossa mão.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Disponibilidade 24/7</h3>
                    <p className="text-gray-600">Sempre prontos para responder a qualquer emergência.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Tecnologia Avançada</h3>
                    <p className="text-gray-600">Sistema de gestão online para acompanhar tudo em tempo real.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Transparência Total</h3>
                    <p className="text-gray-600">Relatórios detalhados e comunicação constante.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg overflow-hidden shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1567016526105-22da7c13f707?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80" 
                  alt="Propriedade em Lisboa" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden shadow-md mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80" 
                  alt="Interior moderno" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1597211833712-5e41faa202e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=863&q=80" 
                  alt="Bairro lisboeta" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden shadow-md mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1537726235470-8504e3beef77?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80" 
                  alt="Detalhe arquitetônico" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para simplificar a gestão do seu imóvel?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Entre em contacto connosco hoje mesmo e descubra como podemos ajudar a maximizar o retorno do seu investimento.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                required
              />
              <Button type="submit" className="bg-white text-primary hover:bg-white/90">
                Contactar
              </Button>
            </div>
          </form>
          
          <div className="mt-8 flex justify-center">
            <Link to="/contacto" className="flex items-center text-white hover:underline">
              <Phone className="mr-2 h-5 w-5" />
              Alexa: +351 962 093 401 | Yoann: +33 6 09 95 12 84
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
