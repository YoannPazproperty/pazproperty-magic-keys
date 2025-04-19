import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Users, Award, Clock, Shield } from "lucide-react";

const Sobre = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre a Pazproperty</h1>
            <div className="text-xl text-gray-600 mb-8">
              <p><em>Your keys, our responsibilities</em></p>
              <p><em>As suas chaves, a nossa missão</em></p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">A Nossa História</h2>
              <p className="text-lg text-gray-600 mb-6">
                A PazProperty nasceu de uma paixão: a paixão por Lisboa — pelos seus bairros cheios de vida, 
                pelos edifícios com história e pelo potencial de cada imóvel escondido entre o Tejo e as colinas.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Ao viver entre Portugal e o estrangeiro, percebemos uma realidade partilhada por muitos — 
                não só investidores internacionais, mas também muitos portugueses: proprietários que valorizam 
                os seus imóveis, mas que não querem — ou não podem — lidar com a gestão do dia a dia.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Foi com isso em mente que fundámos a PazProperty, em 2023. Mais do que uma empresa de gestão 
                de arrendamentos, somos um parceiro de confiança. Cuidamos de cada propriedade como se fosse 
                nossa — com proximidade, rigor e dedicação.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Combinamos tecnologia inteligente, processos transparentes e um atendimento humano, próximo 
                e disponível. A nossa equipa é formada por profissionais experientes, apaixonados pelo setor 
                imobiliário e por resolver problemas antes que eles aconteçam.
              </p>
              <p className="text-lg text-gray-600">
                Hoje, a PazProperty é mais do que um nome — é uma promessa:
                a de transformar imóveis em rendimento, e preocupações em paz.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1296&q=80" 
                alt="Lisboa vista panorâmica" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Mission */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Nossa Missão e Valores</h2>
            <p className="text-xl text-gray-600">
              Transformar a gestão de imóveis em Lisboa numa experiência simples, segura e rentável — com proximidade, transparência e eficiência.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Integridade</h3>
              </div>
              <p className="text-gray-600">
                Agimos com transparência e honestidade, construindo relações de confiança duradouras.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Excelência</h3>
              </div>
              <p className="text-gray-600">
                Buscamos constantemente a excelência em tudo o que fazemos, oferecendo serviços 
                de alta qualidade que superam as expectativas dos nossos clientes.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Personalização</h3>
              </div>
              <p className="text-gray-600">
                Reconhecemos que cada propriedade e proprietário têm necessidades únicas, 
                e adaptamos os nossos serviços para atender a essas necessidades específicas.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
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
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Por Que Escolher a Pazproperty?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Na Pazproperty, combinamos conhecimento local com tecnologia de ponta para oferecer 
                uma gestão imobiliária sem complicações, permitindo que você aproveite os benefícios 
                do seu investimento sem as preocupações.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Conhecimento Local Profundo</h3>
                    <p className="text-gray-600">Nossa equipa conhece Lisboa em detalhe, incluindo as particularidades de cada bairro.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Serviço Personalizado</h3>
                    <p className="text-gray-600">Adaptamos os nossos serviços às necessidades específicas de cada proprietário.</p>
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
                    <p className="text-gray-600">Utilizamos as mais recentes tecnologias para otimizar a gestão e comunicação.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Rede de Profissionais</h3>
                    <p className="text-gray-600">Temos uma extensa rede de profissionais qualificados para qualquer necessidade.</p>
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
                    <p className="text-gray-600">Estamos sempre disponíveis para resolver qualquer situação de emergência.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Team */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Nossa Equipa</h2>
            <p className="text-xl text-gray-600">
              Conheça os profissionais dedicados que fazem da Pazproperty a empresa de gestão 
              locativa de referência em Lisboa.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80" 
                  alt="Ana Silva" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Ana Silva</h3>
                <p className="text-primary font-medium mb-4">CEO & Fundadora</p>
                <p className="text-gray-600">
                  Com mais de 15 anos de experiência no mercado imobiliário lisboeta, Ana fundou a 
                  Pazproperty com a visão de revolucionar a gestão locativa na cidade.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="Miguel Santos" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Miguel Santos</h3>
                <p className="text-primary font-medium mb-4">Diretor de Operações</p>
                <p className="text-gray-600">
                  Miguel coordena toda a equipa operacional, garantindo que cada propriedade 
                  receba o nível de serviço excepcional que a Pazproperty promete.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="Sofia Martins" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Sofia Martins</h3>
                <p className="text-primary font-medium mb-4">Gestora de Clientes</p>
                <p className="text-gray-600">
                  Sofia é o ponto de contacto principal para os nossos clientes, assegurando uma 
                  comunicação clara e eficiente em todos os momentos.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button asChild className="bg-brand-blue hover:bg-primary/90">
              <Link to="/contacto">Fale com a Nossa Equipa</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">O Que Dizem os Nossos Clientes</h2>
            <p className="text-xl text-gray-600">
              A satisfação dos nossos clientes é o nosso maior orgulho. Conheça algumas das opiniões 
              de quem confia na Pazproperty para a gestão dos seus imóveis.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                    alt="João Pereira" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">João Pereira</h3>
                  <p className="text-gray-600 text-sm">Proprietário em Alfama</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Desde que entreguei a gestão do meu apartamento à Pazproperty, a minha vida mudou. 
                Não tenho de me preocupar com nada e a rentabilidade aumentou significativamente."
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=689&q=80" 
                    alt="Maria Costa" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">Maria Costa</h3>
                  <p className="text-gray-600 text-sm">Proprietária em Belém</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "A equipa da Pazproperty é extremamente profissional e atenciosa. Sempre que surge 
                algum problema, eles resolvem rapidamente e com eficiência. Recomendo vivamente."
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                    alt="Pedro Oliveira" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">Pedro Oliveira</h3>
                  <p className="text-gray-600 text-sm">Proprietário no Chiado</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Como proprietário que vive no estrangeiro, a Pazproperty é os meus olhos e mãos em 
                Lisboa. O nível de detalhe nos relatórios mensais é impressionante."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Junte-se à Nossa Família de Clientes Satisfeitos</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Descubra como podemos ajudar a simplificar a gestão do seu imóvel em Lisboa e maximizar o seu retorno.
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

export default Sobre;
