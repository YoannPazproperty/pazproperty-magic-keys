
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contacto = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para enviar o formulário
    console.log("Formulário enviado:", formData);
    alert("Obrigado pelo seu contacto! Responderemos em breve.");
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      mensagem: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Entre em Contacto</h1>
            <p className="text-xl text-gray-600">
              Estamos aqui para responder a todas as suas questões sobre gestão locativa em Lisboa. 
              Entre em contacto connosco hoje mesmo.
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Info & Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Informações de Contacto</h2>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="mt-1 mr-4 bg-primary/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Telefone</h3>
                    <p className="text-gray-600">+351 912 345 678</p>
                    <p className="text-gray-500 text-sm mt-1">Seg-Sex: 9:00 - 18:00</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1 mr-4 bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Email</h3>
                    <p className="text-gray-600">info@pazproperty.pt</p>
                    <p className="text-gray-500 text-sm mt-1">Respondemos em 24 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1 mr-4 bg-primary/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Morada</h3>
                    <p className="text-gray-600">Avenida da Liberdade, 110</p>
                    <p className="text-gray-600">1250-146 Lisboa, Portugal</p>
                    <p className="text-gray-500 text-sm mt-1">Seg-Sex: 9:00 - 18:00 (com marcação)</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4">Horário de Funcionamento</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Segunda-Feira</span>
                    <span className="text-gray-800">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Terça-Feira</span>
                    <span className="text-gray-800">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quarta-Feira</span>
                    <span className="text-gray-800">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quinta-Feira</span>
                    <span className="text-gray-800">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sexta-Feira</span>
                    <span className="text-gray-800">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sábado</span>
                    <span className="text-gray-800">Fechado</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Domingo</span>
                    <span className="text-gray-800">Fechado</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold mb-6">Envie-nos uma Mensagem</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    name="nome"
                    placeholder="Seu nome completo"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Seu email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    placeholder="Seu telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mensagem">Mensagem</Label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    placeholder="Como podemos ajudar?"
                    value={formData.mensagem}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full bg-brand-blue hover:bg-primary/90">
                  <Send className="mr-2 h-4 w-4" /> Enviar Mensagem
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Onde Estamos</h2>
          <div className="h-96 rounded-xl overflow-hidden shadow-lg">
            {/* Aqui você poderia integrar um mapa real (Google Maps, etc.) */}
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">Mapa de Localização - Avenida da Liberdade, Lisboa</p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contacto;
